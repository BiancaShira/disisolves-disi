import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowUp, ArrowDown, MessageSquare, Check, User, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { formatRelativeTime, formatSoftwareDisplay } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAnswerSchema } from "@shared/schema";
import type { Question, Answer } from "@shared/schema";

const answerFormSchema = insertAnswerSchema.omit({
  questionId: true,
  authorId: true,
  authorName: true,
});

type AnswerFormData = z.infer<typeof answerFormSchema>;

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const questionId = parseInt(id!);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: [`/api/questions/${questionId}`],
    enabled: !!questionId,
  });

  const { data: answers, isLoading: answersLoading } = useQuery({
    queryKey: [`/api/questions/${questionId}/answers`],
    enabled: !!questionId,
  });

  const form = useForm<AnswerFormData>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (data: AnswerFormData) => {
      const answerData = {
        ...data,
        questionId,
        authorId: 1,
        authorName: "John Doe",
      };
      const response = await apiRequest("POST", "/api/answers", answerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Answer posted successfully!",
        description: "Your answer has been added to the question.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}`] });
      form.reset();
      setShowAnswerForm(false);
    },
    onError: () => {
      toast({
        title: "Error posting answer",
        description: "There was an error submitting your answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: number) => {
      const response = await apiRequest("PATCH", `/api/answers/${answerId}/accept`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Answer accepted!",
        description: "This answer has been marked as the accepted solution.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}`] });
    },
    onError: () => {
      toast({
        title: "Error accepting answer",
        description: "There was an error accepting the answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ type, answerId }: { type: "up" | "down", answerId?: number }) => {
      const voteData = {
        userId: 1,
        type,
        ...(answerId ? { answerId } : { questionId }),
      };
      const response = await apiRequest("POST", "/api/votes", voteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
    },
  });

  const onSubmitAnswer = (data: AnswerFormData) => {
    createAnswerMutation.mutate(data);
  };

  const handleVote = (type: "up" | "down", answerId?: number) => {
    voteMutation.mutate({ type, answerId });
  };

  const handleAcceptAnswer = (answerId: number) => {
    acceptAnswerMutation.mutate(answerId);
  };

  if (questionLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Question not found</h3>
            <p className="text-text-secondary mb-4">
              The question you're looking for doesn't exist or may have been removed.
            </p>
            <Link href="/questions">
              <Button>Browse Questions</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/questions">Questions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Question #{question.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Question */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Vote Controls */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("up")}
                className="p-2"
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span className="text-lg font-semibold">{question.votes}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("down")}
                className="p-2"
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            </div>

            {/* Question Content */}
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-text-primary">
                  {question.title}
                  {question.solved && (
                    <Check className="inline-block ml-2 w-6 h-6 text-success" />
                  )}
                </h1>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-text-secondary whitespace-pre-wrap">{question.description}</p>
              </div>

              {/* System Info */}
              {(question.operatingSystem || question.softwareVersion) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-text-primary mb-2">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {question.operatingSystem && (
                      <div>
                        <span className="font-medium">OS:</span> {question.operatingSystem}
                      </div>
                    )}
                    {question.softwareVersion && (
                      <div>
                        <span className="font-medium">Version:</span> {question.softwareVersion}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-primary-light text-primary">
                  {formatSoftwareDisplay(question.software)}
                </Badge>
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                <Badge
                  variant={question.priority === "high" ? "destructive" : question.priority === "medium" ? "default" : "secondary"}
                >
                  {question.priority} priority
                </Badge>
              </div>

              {/* Question Meta */}
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {question.authorName}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Asked {formatRelativeTime(new Date(question.createdAt))}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{question.answersCount} answers</span>
                  <span>{question.votes} votes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {question.answersCount} Answer{question.answersCount !== 1 ? "s" : ""}
          </h2>
          <Button
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            variant={showAnswerForm ? "secondary" : "default"}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showAnswerForm ? "Cancel" : "Write Answer"}
          </Button>
        </div>

        {answersLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : answers?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No answers yet</h3>
              <p className="text-text-secondary mb-4">
                Be the first to help solve this technical problem!
              </p>
              <Button onClick={() => setShowAnswerForm(true)}>
                Write First Answer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {answers?.map((answer: Answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-success border-2" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Vote Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("up", answer.id)}
                        className="p-2"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </Button>
                      <span className="font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("down", answer.id)}
                        className="p-2"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </Button>
                      {!answer.isAccepted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="p-2 text-success hover:text-success"
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="flex-grow">
                      {answer.isAccepted && (
                        <div className="flex items-center mb-3 text-success">
                          <Check className="w-5 h-5 mr-2" />
                          <span className="font-medium">Accepted Answer</span>
                        </div>
                      )}
                      
                      <div className="prose max-w-none mb-4">
                        <p className="text-text-secondary whitespace-pre-wrap">{answer.content}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-text-secondary">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {answer.authorName}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatRelativeTime(new Date(answer.createdAt))}
                          </span>
                        </div>
                        <span>{answer.votes} votes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      {showAnswerForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Your Answer</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAnswer)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed answer with steps to solve the problem..."
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={createAnswerMutation.isPending}
                  >
                    {createAnswerMutation.isPending ? "Posting..." : "Post Answer"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAnswerForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

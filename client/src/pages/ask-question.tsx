import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Layers, Save, Lightbulb, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertQuestionSchema } from "@shared/schema";

const questionFormSchema = insertQuestionSchema.extend({
  tags: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function AskQuestion() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      software: "",
      operatingSystem: "",
      softwareVersion: "",
      priority: "medium",
      authorId: 1,
      authorName: "John Doe",
      tags: "",
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const { tags, ...questionData } = data;
      const questionToSubmit = {
        ...questionData,
        tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      };
      const response = await apiRequest("POST", "/api/questions", questionToSubmit);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Question posted successfully!",
        description: "Your question has been submitted and is now visible to the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setLocation(`/questions/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error posting question",
        description: "There was an error submitting your question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    createQuestionMutation.mutate(data);
  };

  const softwareOptions = [
    { value: "omniscan", label: "Omniscan" },
    { value: "softtrac", label: "SoftTrac" },
    { value: "ibml-scanners", label: "IBML Scanners" },
    { value: "database-tools", label: "Database Tools" },
    { value: "network-tools", label: "Network Tools" },
    { value: "other", label: "Other" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low - General question" },
    { value: "medium", label: "Medium - Affecting productivity" },
    { value: "high", label: "High - System down/critical" },
  ];

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
            <BreadcrumbPage>Ask Question</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Ask a Technical Question</h2>
        <p className="text-text-secondary">
          Provide detailed information about your technical issue to get the best possible help from the community.
        </p>
      </div>

      {/* Question Form */}
      <Card>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Question Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summarize your problem in one line"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-text-secondary">
                      Be specific and clear about your issue
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Software/Tool Selection */}
              <FormField
                control={form.control}
                name="software"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Related Software/Tool <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the primary software involved" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {softwareOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Problem Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Problem Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your problem in detail. Include:
• What you were trying to do
• What happened instead
• Error messages (if any)
• Steps you've already tried
• Your system environment"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-text-secondary">
                      The more details you provide, the better help you'll receive
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* System Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="operatingSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Windows 11, Windows 10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="softwareVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Software Version</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Omniscan v6.2, SoftTrac 2023"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add relevant tags separated by commas (e.g., network, calibration, windows-update)"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-text-secondary">
                      Tags help others find and categorize your question
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Level */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {priorityOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="text-sm">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={createQuestionMutation.isPending}
                  className="font-medium"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {createQuestionMutation.isPending ? "Posting..." : "Post Question"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setLocation("/questions")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Tips Panel */}
      <Card className="mt-8 border-blue-200 bg-primary-light">
        <CardContent className="p-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center">
            <Lightbulb className="text-primary mr-2 w-5 h-5" />
            Tips for Getting Better Answers
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start">
              <Check className="text-success mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
              <span>Search existing questions first to see if your problem has been solved</span>
            </li>
            <li className="flex items-start">
              <Check className="text-success mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
              <span>Include exact error messages and screenshots when possible</span>
            </li>
            <li className="flex items-start">
              <Check className="text-success mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
              <span>Describe what you've already tried to solve the problem</span>
            </li>
            <li className="flex items-start">
              <Check className="text-success mr-2 mt-0.5 flex-shrink-0 w-4 h-4" />
              <span>Use clear, specific titles that describe the actual problem</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, MessageSquare, User, Clock, Check } from "lucide-react";
import { formatRelativeTime, formatSoftwareDisplay } from "@/lib/utils";
import type { Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  onVote?: (questionId: number, type: "up" | "down") => void;
}

export default function QuestionCard({ question, onVote }: QuestionCardProps) {
  const handleVote = (type: "up" | "down") => {
    if (onVote) {
      onVote(question.id, type);
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Vote and Stats */}
        <div className="flex-shrink-0 text-center space-y-2">
          <div className="bg-primary-light rounded-lg p-3">
            <div className="text-lg font-semibold text-primary">{question.votes}</div>
            <div className="text-xs text-text-secondary">votes</div>
          </div>
          <div className={`rounded-lg p-2 text-sm ${
            question.answersCount > 0 
              ? question.solved 
                ? "bg-success text-white" 
                : "bg-warning text-white"
              : "bg-gray-100 text-text-secondary"
          }`}>
            <div className="font-medium">{question.answersCount}</div>
            <div className="text-xs">answers</div>
          </div>
        </div>
        
        {/* Question Content */}
        <div className="flex-grow">
          <Link href={`/questions/${question.id}`}>
            <h3 className="text-lg font-semibold text-text-primary mb-2 hover:text-primary cursor-pointer">
              {question.title}
              {question.solved && (
                <Check className="inline-block ml-2 w-5 h-5 text-success" />
              )}
            </h3>
          </Link>
          <p className="text-text-secondary mb-4 line-clamp-2">
            {question.description.length > 150 
              ? `${question.description.slice(0, 150)}...` 
              : question.description}
          </p>
          
          {/* Tags and Meta */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
              <Badge variant="default" className="bg-primary-light text-primary">
                {formatSoftwareDisplay(question.software)}
              </Badge>
              {question.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-text-secondary">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 2 && (
                <Badge variant="secondary" className="bg-gray-100 text-text-secondary">
                  +{question.tags.length - 2} more
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {question.authorName}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatRelativeTime(new Date(question.createdAt))}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      {onVote && (
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              className="text-text-secondary hover:text-primary"
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              Upvote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-primary"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Answer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

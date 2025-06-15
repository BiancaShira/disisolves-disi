import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import QuestionCard from "@/components/question-card";
import type { Question } from "@shared/schema";

export default function Questions() {
  const searchParams = new URLSearchParams(useSearch());
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [softwareFilter, setSoftwareFilter] = useState(searchParams.get("software") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 20;

  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: [
      `/api/questions?search=${searchQuery}&software=${softwareFilter}&status=${statusFilter}&sortBy=${sortBy}&limit=${questionsPerPage}&offset=${(currentPage - 1) * questionsPerPage}`
    ],
  });

  const totalQuestions = questions?.length || 0;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  useEffect(() => {
    refetch();
  }, [searchQuery, softwareFilter, statusFilter, sortBy, currentPage, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleVote = async (questionId: number, type: "up" | "down") => {
    // TODO: Implement voting functionality
    console.log(`Vote ${type} on question ${questionId}`);
  };

  const softwareOptions = [
    { value: "all", label: "All Software" },
    { value: "omniscan", label: "Omniscan" },
    { value: "softtrac", label: "SoftTrac" },
    { value: "ibml-scanners", label: "IBML Scanners" },
    { value: "database-tools", label: "Database Tools" },
    { value: "network-tools", label: "Network Tools" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "solved", label: "Solved" },
    { value: "unsolved", label: "Unsolved" },
    { value: "no-answers", label: "No Answers" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "votes", label: "Most Voted" },
    { value: "answers", label: "Most Answers" },
    { value: "unsolved", label: "Unsolved" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">All Questions</h2>
          <p className="text-text-secondary">Browse and search technical support questions</p>
        </div>
        <Link href="/ask">
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Search Questions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Software Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Software
              </label>
              <Select value={softwareFilter} onValueChange={setSoftwareFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {softwareOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
          
          {/* Sort Options */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-4">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => setSortBy(option.value)}
                  className={
                    sortBy === option.value
                      ? "text-primary font-medium"
                      : "text-text-secondary hover:text-primary"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <span className="text-sm text-text-secondary mt-2 sm:mt-0">
              Showing {Math.min(questionsPerPage, totalQuestions)} of {totalQuestions} questions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-4 w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-100 rounded w-20"></div>
                  <div className="h-6 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : questions?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">No questions found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your search criteria or be the first to ask a question!
            </p>
            <Link href="/ask">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ask First Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions?.map((question: Question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * questionsPerPage + 1} to{" "}
            {Math.min(currentPage * questionsPerPage, totalQuestions)} of {totalQuestions} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

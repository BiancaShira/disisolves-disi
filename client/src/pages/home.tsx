import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, TrendingUp, User, MessageSquare, ArrowUp } from "lucide-react";
import { useState } from "react";
import { formatRelativeTime, formatSoftwareDisplay } from "@/lib/utils";
import type { Question } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: recentQuestions, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/questions?sortBy=newest&limit=3"],
  });

  const { data: trendingQuestions, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/questions?sortBy=votes&limit=3"],
  });

  const popularSoftware = [
    { name: "Omniscan", value: "omniscan", icon: "🔍" },
    { name: "SoftTrac", value: "softtrac", icon: "⚙️" },
    { name: "IBML Scanners", value: "ibml-scanners", icon: "🖨️" },
    { name: "Database Issues", value: "database-tools", icon: "🗄️" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/questions?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Find Solutions to Technical Problems
        </h2>
        <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
          Search our knowledge base for solutions to enterprise software issues including 
          Omniscan, SoftTrac, IBML scanners, and more.
        </p>
        
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for problems, solutions, or software names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg h-14"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2"
            >
              Search
            </Button>
          </div>
        </form>
        
        {/* Popular Software Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {popularSoftware.map((software) => (
            <Link key={software.value} href={`/questions?software=${software.value}`}>
              <Badge
                variant="secondary"
                className="bg-primary-light text-primary cursor-pointer hover:bg-blue-100 px-3 py-1"
              >
                <span className="mr-2">{software.icon}</span>
                {software.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {statsLoading ? "..." : stats?.totalQuestions || 0}
            </div>
            <div className="text-text-secondary">Total Questions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {statsLoading ? "..." : stats?.solvedQuestions || 0}
            </div>
            <div className="text-text-secondary">Solved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {statsLoading ? "..." : stats?.activeUsers || 0}
            </div>
            <div className="text-text-secondary">Active Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-text-primary mb-2">
              {statsLoading ? "..." : stats?.avgResponseTime || "0h"}
            </div>
            <div className="text-text-secondary">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent and Trending Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Issues */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Clock className="text-primary mr-2 w-5 h-5" />
              Recent Issues
            </h3>
            
            {recentLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuestions?.map((question: Question) => (
                  <Link key={question.id} href={`/questions/${question.id}`}>
                    <div className="border-l-4 border-primary pl-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium text-text-primary mb-1">
                        {question.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {question.authorName}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatRelativeTime(new Date(question.createdAt))}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-primary-light text-primary text-xs"
                        >
                          {formatSoftwareDisplay(question.software)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <Link href="/questions">
              <Button variant="ghost" className="mt-4 text-primary hover:text-blue-600">
                View All Recent Issues →
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Trending Issues */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="text-warning mr-2 w-5 h-5" />
              Trending Issues
            </h3>
            
            {trendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {trendingQuestions?.map((question: Question, index: number) => (
                  <Link key={question.id} href={`/questions/${question.id}`}>
                    <div className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        index === 0 ? "bg-primary" : index === 1 ? "bg-success" : "bg-warning"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-text-primary mb-1">
                          {question.title}
                        </h4>
                        <div className="text-sm text-text-secondary">
                          <span className="mr-4 flex items-center inline-flex">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {question.votes} votes
                          </span>
                          <span className="flex items-center inline-flex">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {question.answersCount} answers
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <Link href="/questions?sortBy=votes">
              <Button variant="ghost" className="mt-4 text-primary hover:text-blue-600">
                View All Trending Issues →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

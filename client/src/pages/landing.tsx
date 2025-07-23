import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bolt, TrendingUp, ArrowRight, Star, MessageSquare, Users } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stats for the homepage
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  // Fetch recent questions for the homepage
  const { data: recentQuestions } = useQuery({
    queryKey: ["/api/questions"],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/questions?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSoftwareFilter = (software: string) => {
    window.location.href = `/questions?software=${software}`;
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header for landing page */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bolt className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-text-primary">DisiSolves</h1>
            </div>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Solutions to Technical Problems
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Search our knowledge base for solutions to enterprise software issues including 
              Omniscan, SoftTrac, IBML scanners, and more.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for problems, solutions, or software names..."
                  className="w-full pl-12 pr-20 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Popular Software Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button 
                onClick={() => handleSoftwareFilter("omniscan")}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                <span className="mr-2">🔍</span>
                Omniscan
              </button>
              <button 
                onClick={() => handleSoftwareFilter("softtrac")}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                <span className="mr-2">⚙️</span>
                SoftTrac
              </button>
              <button 
                onClick={() => handleSoftwareFilter("ibml-scanners")}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                <span className="mr-2">🖨️</span>
                IBML Scanners
              </button>
              <button 
                onClick={() => handleSoftwareFilter("database-tools")}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                <span className="mr-2">📁</span>
                Database Issues
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 text-center">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.totalQuestions || 7}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats?.solvedQuestions || 0}</div>
              <div className="text-gray-600">Solved</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl font-bold text-orange-600 mb-2">{stats?.activeUsers || 2}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl font-bold text-gray-600 mb-2">2.4h</div>
              <div className="text-gray-600">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues and Trending Issues */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Recent Issues */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
              </div>
              <div className="space-y-4">
                {recentQuestions?.slice(0, 5).map((question: any) => (
                  <div key={question.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:border-blue-500 transition-colors">
                    <h3 className="font-medium text-gray-900 hover:text-blue-600">
                      <Link href={`/questions/${question.id}`}>
                        {question.title}
                      </Link>
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span className="mr-4">{question.votes || 0} votes</span>
                      <span className="mr-4">{question.answersCount || 0} answers</span>
                      <Badge variant="outline" className="text-xs">{question.software}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Issues */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Trending Issues</h2>
              </div>
              <div className="space-y-4">
                {recentQuestions?.slice(0, 5).map((question: any) => (
                  <div key={question.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:border-orange-500 transition-colors">
                    <h3 className="font-medium text-gray-900 hover:text-orange-600">
                      <Link href={`/questions/${question.id}`}>
                        {question.title}
                      </Link>
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span className="mr-4">{question.votes || 0} votes</span>
                      <span className="mr-4">{question.answersCount || 0} answers</span>
                      <Badge variant="outline" className="text-xs">{question.software}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get help?</span>
            <span className="block text-blue-200">Join our community today.</span>
          </h2>
          <div className="mt-8 flex gap-4 lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button variant="secondary" size="lg" asChild>
                <a href="/api/login">Sign Up Now</a>
              </Button>
            </div>
            <div className="inline-flex rounded-md shadow">
              <Button variant="outline" asChild>
                <Link href="/questions">Browse Questions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 DisiSolves. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
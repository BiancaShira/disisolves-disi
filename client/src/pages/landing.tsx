import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bolt, TrendingUp, ArrowRight, Star, MessageSquare, Users } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
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

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl">
              Solve Enterprise Software Issues
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-text-secondary sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Get expert help with Omniscan, SoftTrac, IBML scanners, and other enterprise software. 
              Join our community of IT professionals solving real-world problems.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Button size="lg" asChild>
                  <a href="/api/login">Get Started</a>
                </Button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/questions">Browse Questions</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Questions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats?.totalQuestions || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Solved Questions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats?.solvedQuestions || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats?.activeUsers || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Questions Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Recent Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              See what the community is working on
            </p>
          </div>
          
          <div className="mt-10">
            <div className="space-y-6">
              {recentQuestions?.slice(0, 5).map((question: any) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary">
                        <Link href={`/questions/${question.id}`}>
                          {question.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {question.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-4">
                        <Badge variant="outline">{question.software}</Badge>
                        <Badge variant="outline">{question.priority}</Badge>
                        <span className="text-sm text-gray-500">
                          by {question.authorName}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end space-y-2">
                      <div className="text-sm text-gray-500">
                        {question.votes || 0} votes
                      </div>
                      <div className="text-sm text-gray-500">
                        {question.answersCount || 0} answers
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/questions">
                  View All Questions <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button variant="secondary" size="lg" asChild>
                <a href="/api/login">Sign Up Now</a>
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
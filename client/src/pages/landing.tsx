import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Q&A Hub</h1>
          </div>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Get answers to your
          <span className="text-blue-600"> technical questions</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Connect with experts and the community to solve enterprise software issues, 
          troubleshoot problems, and share knowledge.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/api/login">Get Started</a>
          </Button>
          <Button variant="outline" size="lg">
            Browse Questions
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <HelpCircle className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Ask Questions</CardTitle>
              <CardDescription>
                Get help with technical issues from our community of experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Post detailed questions about enterprise software, hardware troubleshooting, 
                and technical challenges.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Expert Community</CardTitle>
              <CardDescription>
                Connect with experienced professionals and technical experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Learn from industry professionals with years of experience in 
                enterprise software and systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Vote & Rank</CardTitle>
              <CardDescription>
                Quality answers rise to the top through community voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                The best solutions get recognized and help others facing 
                similar technical challenges.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Join Our Growing Community
          </h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-300">Questions Answered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-300">Resolution Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">2.4h</div>
              <div className="text-gray-600 dark:text-gray-300">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to get started?
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join thousands of professionals solving technical challenges together.
        </p>
        <Button size="lg" asChild>
          <a href="/api/login">Sign In Now</a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2025 Q&A Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
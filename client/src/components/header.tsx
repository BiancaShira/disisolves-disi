import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bolt, Bell, User } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Bolt className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-text-primary">DisiSolves</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-medium",
                    isActive("/") ? "text-primary" : "text-text-secondary hover:text-primary"
                  )}
                >
                  Home
                </Button>
              </Link>
              <Link href="/questions">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-medium",
                    isActive("/questions") ? "text-primary" : "text-text-secondary hover:text-primary"
                  )}
                >
                  Questions
                </Button>
              </Link>
              <Link href="/ask">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-medium",
                    isActive("/ask") ? "text-primary" : "text-text-secondary hover:text-primary"
                  )}
                >
                  Ask Question
                </Button>
              </Link>
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="text-text-secondary text-lg" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="hidden sm:block text-sm font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

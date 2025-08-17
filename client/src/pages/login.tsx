import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCredentials, setShowCredentials] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.firstName || data.email}!`,
      });
      
      // Redirect based on role
      if (data.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleDemoLogin = (email: string, password: string) => {
    form.setValue('email', email);
    form.setValue('password', password);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to Q&A System
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access your account to ask questions and get help
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter your email"
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter your password"
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCredentials(!showCredentials)}
                className="w-full"
                data-testid="button-show-demo-accounts"
              >
                {showCredentials ? "Hide" : "Show"} Demo Accounts
              </Button>

              {showCredentials && (
                <div className="mt-4 space-y-3">
                  <Alert>
                    <AlertDescription>
                      <strong>Demo Accounts (All use password: password123)</strong>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDemoLogin('admin@company.com', 'password123')}
                      data-testid="button-login-admin"
                      className="text-left"
                    >
                      <div>
                        <div className="font-medium">Admin Account</div>
                        <div className="text-xs opacity-70">admin@company.com - Full system access</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDemoLogin('supervisor@company.com', 'password123')}
                      data-testid="button-login-supervisor"
                      className="text-left"
                    >
                      <div>
                        <div className="font-medium">Supervisor Account</div>
                        <div className="text-xs opacity-70">supervisor@company.com - Post content (needs approval)</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDemoLogin('user@company.com', 'password123')}
                      data-testid="button-login-user"
                      className="text-left"
                    >
                      <div>
                        <div className="font-medium">User Account</div>
                        <div className="text-xs opacity-70">user@company.com - View content & raise issues</div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>No account? Contact your administrator for access.</p>
        </div>
      </div>
    </div>
  );
}
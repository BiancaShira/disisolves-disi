import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Questions from "@/pages/questions";
import AskQuestion from "@/pages/ask-question";
import QuestionDetail from "@/pages/question-detail";
import Header from "@/components/header";

function Router() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/questions" component={Questions} />
        <Route path="/ask" component={AskQuestion} />
        <Route path="/questions/:id" component={QuestionDetail} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

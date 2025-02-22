import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { FileText } from "lucide-react";
import { createContext, useContext, useState, ReactNode } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-bold">ResumeAI Pro</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Contact
          </Link>
          <ThemeToggle />
          {user ? (
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          ) : (
            <Button variant="default" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

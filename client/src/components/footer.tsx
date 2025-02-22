
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t mt-auto py-6 bg-background">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © 2024 ResumeAI Pro. Created by @manojkakashi
        </div>
        <div className="flex gap-6">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
            Pricing
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

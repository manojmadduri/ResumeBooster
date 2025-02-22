
import React from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "./navigation-menu";
import { Button } from "./button";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
                href="/"
              >
                ResumeAI
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex-1" />
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="default" href="/auth">
            Sign In
          </Button>
        )}
      </div>
    </motion.header>
  );
}

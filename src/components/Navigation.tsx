'use client'

import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
    const pathname = usePathname();

    // Don't show full nav on public question submission pages
    const isPublicPage = pathname?.startsWith('/ask/');

    const navLinks = [
        {
            href: "/",
            label: "Home",
            icon: Home,
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/sessions",
            label: "Sessions",
            icon: MessageSquare,
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
                {/* Logo / Brand - Left aligned */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <MessageSquare className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="hidden font-bold sm:inline-block">
                            Q&A Helper Pro
                        </span>
                    </Link>
                </div>

                {/* Navigation Links - Centered with flex */}
                {!isPublicPage && (
                    <SignedIn>
                        <div className="hidden md:flex md:gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || 
                                               (link.href === "/sessions" && pathname?.startsWith('/sessions'));
                                
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                            isActive
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </SignedIn>
                )}

                {/* Auth Buttons - Right aligned */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </nav>

            {/* Mobile Navigation - Only show when signed in and not on public pages */}
            {!isPublicPage && (
                <SignedIn>
                    <div className="border-t md:hidden">
                        <div className="container flex items-center justify-around px-4 py-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || 
                                               (link.href === "/sessions" && pathname?.startsWith('/sessions'));
                                
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex flex-col items-center gap-1 text-xs transition-colors hover:text-primary",
                                            isActive
                                                ? "text-primary font-medium"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </SignedIn>
            )}
        </header>
    )
}
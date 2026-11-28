import type { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./nav-panel";
import { useAuthContext } from "@/context/auth-context";
import { SUPPORT_EMAIL } from "@shared/plans";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function PublicHeader() {
  const { user } = useAuthContext();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <a href="/" aria-label="ProfitPad home">
          <BrandMark />
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button onClick={() => (window.location.href = "/")}>Open ProfitPad</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => (window.location.href = "/login")} data-testid="button-signin-header">
                Sign in
              </Button>
              <Button onClick={() => (window.location.href = "/register")} className="hidden sm:inline-flex">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const col = "space-y-2.5 text-sm";
  const link = "text-muted-foreground transition-colors hover:text-foreground";
  return (
    <footer className="mt-20 border-t border-border/70 bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="col-span-2 md:col-span-1">
          <BrandMark />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Profit, inventory and expense tracking built for resellers.
          </p>
        </div>
        <div className={col}>
          <p className="font-semibold">Product</p>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={`block ${link}`}>
              {item.label}
            </a>
          ))}
        </div>
        <div className={col}>
          <p className="font-semibold">Support</p>
          <Link href="/contact" className={`block ${link}`}>Contact us</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={`block break-all ${link}`}>{SUPPORT_EMAIL}</a>
          <Link href="/forgot-password" className={`block ${link}`}>Forgot password</Link>
        </div>
        <div className={col}>
          <p className="font-semibold">Legal</p>
          <Link href="/terms" className={`block ${link}`}>Terms of Service</Link>
          <Link href="/privacy" className={`block ${link}`}>Privacy Policy</Link>
          <Link href="/refund-policy" className={`block ${link}`}>Refund Policy</Link>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} ProfitPad. Built for resellers who want to maximize every flip.
        </p>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}

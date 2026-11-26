import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { BrandMark } from "./nav-panel";

const HIGHLIGHTS = [
  "Know your real profit on every flip, after fees and shipping",
  "Track inventory across eBay, Poshmark, Mercari and more",
  "Scan barcodes and snap receipts right from your phone",
];

/**
 * Split-screen shell for the sign-in and sign-up pages: brand story on the
 * left (desktop only), form on the right.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />

        <BrandMark className="relative" />

        <div className="relative my-auto max-w-md">
          <p className="mb-4 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
            Built for resellers
          </p>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Every flip, every fee,{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
              every dollar of profit.
            </span>
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex gap-3 text-sidebar-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {/* Mini profit card for a touch of product */}
          <div className="mt-10 rounded-2xl bg-white/5 p-5 ring-1 ring-inset ring-white/10 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sidebar-foreground">
                Profit this month <span className="text-sidebar-foreground/50">· example</span>
              </span>
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-bold text-emerald-300">+24%</span>
            </div>
            <p className="tabular mt-2 text-3xl font-extrabold">$2,418.60</p>
            <div className="mt-4 flex h-12 items-end gap-1.5">
              {[30, 45, 38, 60, 52, 70, 64, 82, 76, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400"
                  style={{ height: `${h}%`, opacity: 0.45 + i * 0.055 }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} ProfitPad</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <BrandMark className="mb-10 lg:hidden" />
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}

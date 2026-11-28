import type { ReactNode } from "react";
import { Link } from "wouter";
import { Mail, ShieldCheck, KeyRound, CreditCard } from "lucide-react";
import PublicLayout from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { MONEY_BACK_DAYS, SUPPORT_EMAIL } from "@shared/plans";

const UPDATED = "November 28, 2026";
const Email = () => (
  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
);

function LegalPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last updated {UPDATED}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
        <article className="prose prose-slate mt-10 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-h2:mt-10 prose-h2:text-xl">
          {children}
        </article>
      </main>
    </PublicLayout>
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The plain-English rules for using ProfitPad. By creating an account you agree to them."
    >
      <h2>1. What ProfitPad is</h2>
      <p>
        ProfitPad ("we", "us") is an online tool for resellers to track inventory, sales, expenses and profit. These
        terms cover your use of profitpadapp.com and the ProfitPad app ("the service").
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 18 years old and give us a real email address.</li>
        <li>Keep your password private. You're responsible for what happens under your account.</li>
        <li>
          On the Enterprise plan, the account owner can invite teammates. The owner is responsible for their
          teammates' use of the account and can remove them at any time.
        </li>
      </ul>

      <h2>3. Plans and payment</h2>
      <ul>
        <li>
          ProfitPad is a paid service. Prices are shown on our <a href="/#pricing">pricing section</a> in US dollars.
          You pay up front through PayPal, with a PayPal account or a debit or credit card.
        </li>
        <li>
          A monthly payment covers 30 days and a yearly payment covers 365 days, starting on the day you pay.{" "}
          <strong>Plans do not renew automatically</strong>: we never charge you again unless you choose to renew.
          Renewing the same plan early adds the new time on top of the time you have left; switching to a different plan starts it from the day you pay.
        </li>
        <li>
          When your paid time runs out, your data stays in your account but you won't be able to add new records
          until you renew.
        </li>
        <li>We may change prices for future payments. A price change never affects time you've already paid for.</li>
      </ul>

      <h2>4. Money-back guarantee</h2>
      <p>
        Every account is covered by a {MONEY_BACK_DAYS}-day money-back guarantee. The details are in our{" "}
        <Link href="/refund-policy">Refund Policy</Link>.
      </p>

      <h2>5. Your data</h2>
      <p>
        Everything you put into ProfitPad (items, sales, expenses, photos and notes) belongs to you. You give us
        permission to store and process it only so we can run the service for you. How we handle it is explained in
        our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>6. Acceptable use</h2>
      <p>Don't use ProfitPad to:</p>
      <ul>
        <li>break the law, or track the sale of stolen, counterfeit or prohibited goods;</li>
        <li>try to access other people's accounts or data, or probe, overload or disrupt the service;</li>
        <li>resell or give away access to the service outside your own team.</li>
      </ul>
      <p>We may suspend or close accounts that do these things.</p>

      <h2>7. Numbers are estimates, not advice</h2>
      <p>
        ProfitPad calculates profit, fees and totals from the information you enter and from typical marketplace fee
        rates. Marketplaces change their fees, and your actual numbers may differ. ProfitPad is a record-keeping tool,
        not tax, legal or financial advice. Check important figures, especially for taxes, with a qualified
        professional.
      </p>

      <h2>8. Availability</h2>
      <p>
        We work hard to keep ProfitPad running and your data safe, but the service is provided "as is" and we can't
        promise it will always be available or error-free. We recommend exporting your reports regularly.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, ProfitPad isn't liable for indirect or consequential losses (such as lost
        profits or lost sales), and our total liability for any claim is limited to the amount you paid us in the 12
        months before the claim.
      </p>

      <h2>10. Closing your account</h2>
      <p>
        You can stop using ProfitPad at any time. Since plans don't renew automatically, there's nothing to cancel. To
        have your account and data deleted, email <Email />. We may close accounts that break these terms, and will
        refund any unused paid time if we close your account without cause.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        If we make important changes, we'll update the date at the top of this page and let you know in the app or by
        email before they take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms? Email <Email />.
      </p>
    </LegalPage>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What we collect, why, and who it's shared with. Short version: we only use your data to run ProfitPad, and we never sell it."
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address and a securely hashed version of your password
          (we never see or store the password itself).
        </li>
        <li>
          <strong>Your business records:</strong> the inventory, sales, expenses, reminders, goals, photos and notes
          you add.
        </li>
        <li>
          <strong>Payment records:</strong> which plan you bought, when, and the PayPal order reference. Payments are
          handled entirely by PayPal; we never see or store your card or bank details.
        </li>
        <li>
          <strong>Technical basics:</strong> a sign-in cookie that keeps you logged in, and standard server logs (such
          as IP address and time of request) used for security and fixing problems.
        </li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell or rent your data, and we don't use it for advertising.</li>
        <li>We don't use advertising or tracking cookies.</li>
        <li>We don't read your business records except when you ask us for help, or to keep the service secure.</li>
      </ul>

      <h2>Who helps us run ProfitPad</h2>
      <p>We use a small number of trusted providers, who only process data on our behalf:</p>
      <ul>
        <li>
          <strong>Railway</strong> hosts the app and stores uploaded photos; <strong>Neon</strong> hosts our database.
        </li>
        <li>
          <strong>PayPal</strong> processes payments.
        </li>
        <li>
          <strong>Resend</strong> delivers account emails, like password reset links.
        </li>
        <li>
          If you use an AI-powered feature (such as receipt scanning, when it's available), the content you submit to
          it is sent to our AI provider, <strong>Anthropic</strong>, to produce the result.
        </li>
      </ul>
      <p>We may also share information if the law requires it, or to protect the safety of our users or service.</p>

      <h2>Teams</h2>
      <p>
        On the Enterprise plan, everyone on a team can see and edit the account's shared business records. The account
        owner can see who is on the team.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while you have an account, including after a plan ends, so it's there if you come back. If
        you ask us to delete your account, we'll delete your data within 30 days, except records we must keep by law
        (such as payment records for tax purposes).
      </p>

      <h2>Your choices</h2>
      <p>
        You can view and edit your data in the app at any time. To get a copy of your data, correct something you
        can't change yourself, or delete your account, email <Email />.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit (HTTPS), passwords are hashed, and access to our systems is restricted. No system
        is perfectly secure, but we'll tell you promptly if a breach ever affects your data.
      </p>

      <h2>Children</h2>
      <p>ProfitPad is not meant for anyone under 18, and we don't knowingly collect data from children.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy in a meaningful way, we'll update the date above and let you know in the app or by
        email.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or requests: <Email />.
      </p>
    </LegalPage>
  );
}

export function RefundPolicy() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`Try ProfitPad with confidence. If it isn't right for you, you get your money back within ${MONEY_BACK_DAYS} days.`}
    >
      <h2>The {MONEY_BACK_DAYS}-day money-back guarantee</h2>
      <p>
        If you're not happy with ProfitPad, email <Email /> within {MONEY_BACK_DAYS} days of your{" "}
        <strong>first payment</strong> and we'll refund that payment in full. No forms and no questions you don't want
        to answer. This applies to monthly and yearly plans alike.
      </p>

      <h2>How to ask for a refund</h2>
      <ol>
        <li>
          Email <Email /> from the address on your ProfitPad account (or tell us that address).
        </li>
        <li>Say you'd like a refund. Telling us why is optional, but it helps us improve.</li>
        <li>
          We'll send the refund through PayPal to the account or card you paid with, normally within 3 business days.
          PayPal or your bank may take a few more days to show it.
        </li>
      </ol>
      <p>Once a refund is issued, your paid plan ends.</p>

      <h2>No automatic renewals</h2>
      <p>
        ProfitPad plans don't renew automatically. Each payment covers 30 days (monthly) or 365 days (yearly), and we
        never charge you again unless you choose to renew. So there's nothing to cancel, and no surprise charges.
      </p>

      <h2>Later payments</h2>
      <p>
        Renewals and upgrades made after your first {MONEY_BACK_DAYS} days aren't covered by the guarantee. If
        something went wrong, such as paying twice by mistake, email us and we'll make it right.
      </p>

      <h2>Questions</h2>
      <p>
        Email <Email /> any time.
      </p>
    </LegalPage>
  );
}

export function Contact() {
  const items = [
    {
      icon: Mail,
      title: "Questions & support",
      body: "Help with your account, a feature, or anything else. We usually reply within one business day.",
    },
    {
      icon: ShieldCheck,
      title: `${MONEY_BACK_DAYS}-day money-back guarantee`,
      body: "Want a refund? Email us within 30 days of your first payment.",
      link: { href: "/refund-policy", label: "Refund policy" },
    },
    {
      icon: KeyRound,
      title: "Locked out?",
      body: "Reset your password yourself in a minute.",
      link: { href: "/forgot-password", label: "Reset password" },
    },
    {
      icon: CreditCard,
      title: "Billing",
      body: "Questions about a payment, an upgrade, or which plan is right for you.",
    },
  ];
  return (
    <PublicLayout>
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
            ProfitPad is run by resellers. Email us and a real person will get back to you.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                {item.link && (
                  <Link href={item.link.href} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                    {item.link.label} →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}

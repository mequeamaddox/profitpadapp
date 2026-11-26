import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Copy, Link2, LogOut, Mail, UserMinus, Users, X } from "lucide-react";

interface TeamMember {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface TeamInvite {
  id: string;
  email: string;
  token: string;
}

type TeamData =
  | { role: "member"; owner: { name: string; email: string | null } }
  | { role: "owner" | null; canManage: boolean; seats: number; members: TeamMember[]; invites: TeamInvite[] };

/** "403: {"message":"..."}" -> "..." */
function errorMessage(error: unknown) {
  const raw = (error as Error)?.message ?? "";
  try {
    return JSON.parse(raw.slice(raw.indexOf(":") + 1)).message ?? raw;
  } catch {
    return raw || "Something went wrong";
  }
}

const inviteLink = (token: string) => `${window.location.origin}/join/${token}`;

export default function Team() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { refreshUser } = useAuthContext();
  const [email, setEmail] = useState("");

  const { data: team, isLoading } = useQuery<TeamData>({ queryKey: ["/api/team"] });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/team"] });

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink(token));
      toast({ title: "Invite link copied", description: "Send it to your teammate." });
    } catch {
      toast({ title: "Copy this link", description: inviteLink(token) });
    }
  };

  const invite = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/team/invites", { email })).json(),
    onSuccess: async (created: TeamInvite) => {
      setEmail("");
      await refresh();
      copyLink(created.token);
    },
    onError: (error) => toast({ title: "Couldn't invite", description: errorMessage(error), variant: "destructive" }),
  });

  const cancelInvite = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/team/invites/${id}`),
    onSuccess: refresh,
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/team/members/${id}`),
    onSuccess: () => {
      refresh();
      toast({ title: "Teammate removed" });
    },
  });

  const leave = useMutation({
    mutationFn: () => apiRequest("POST", "/api/team/leave"),
    onSuccess: async () => {
      queryClient.clear();
      await refreshUser();
      setLocation("/");
    },
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header title="Team" subtitle="Work on one ProfitPad account together" />

        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5 md:px-8 md:pt-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {isLoading || !team ? (
              <Card className="h-40 animate-pulse" />
            ) : team.role === "member" ? (
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your team</p>
                    <p className="mt-0.5 text-xl font-bold">{team.owner.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You're working in {team.owner.name}'s account. Inventory, sales and expenses are shared with
                      the whole team, and the owner manages billing.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Leave this team? You'll go back to your own account.")) leave.mutate();
                    }}
                    disabled={leave.isPending}
                  >
                    <LogOut /> Leave team
                  </Button>
                </div>
              </Card>
            ) : !team.canManage ? (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Users className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold">Bring your team</h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Team access is part of the Enterprise plan. Invite up to 5 teammates to share your inventory,
                  sales and expenses while you keep control of billing.
                </p>
                <Button className="mt-6" onClick={() => setLocation("/billing")}>
                  See Enterprise
                </Button>
              </Card>
            ) : (
              <>
                <Card className="p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">Invite a teammate</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You'll get a link to send them. It only works for the email you enter.
                      </p>
                    </div>
                    <span className="tabular shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {team.members.length + team.invites.length} / {team.seats} seats
                    </span>
                  </div>
                  <form
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      invite.mutate();
                    }}
                  >
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="teammate@example.com"
                        className="h-11 pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-11"
                      disabled={invite.isPending || team.members.length + team.invites.length >= team.seats}
                    >
                      <Link2 /> Create invite link
                    </Button>
                  </form>
                </Card>

                <Card className="p-5 md:p-6">
                  <h2 className="text-lg font-bold">Team members</h2>
                  {team.members.length === 0 && team.invites.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">No teammates yet. Invite someone above.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-border/70">
                      {team.members.map((m) => {
                        const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;
                        return (
                          <li key={m.id} className="flex items-center gap-3 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                              {(name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{name}</p>
                              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-rose-600"
                              onClick={() => {
                                if (confirm(`Remove ${name} from your team?`)) removeMember.mutate(m.id);
                              }}
                            >
                              <UserMinus /> Remove
                            </Button>
                          </li>
                        );
                      })}
                      {team.invites.map((inv) => (
                        <li key={inv.id} className="flex items-center gap-3 py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{inv.email}</p>
                            <p className="text-xs text-amber-700">Invite pending</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyLink(inv.token)}>
                            <Copy /> Copy link
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-rose-600"
                            aria-label="Cancel invite"
                            onClick={() => cancelInvite.mutate(inv.id)}
                          >
                            <X />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                  Teammates share your inventory, sales, expenses and reminders. Only you can change the plan,
                  billing or who's on the team.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { BrandMark } from "@/components/layout/nav-panel";
import { AlertCircle, Loader2, Users } from "lucide-react";

interface InviteInfo {
  ownerName: string;
  email: string;
  emailMatches: boolean;
  ownerActive: boolean;
}

function errorMessage(error: unknown) {
  const raw = (error as Error)?.message ?? "";
  try {
    return JSON.parse(raw.slice(raw.indexOf(":") + 1)).message ?? raw;
  } catch {
    return raw || "Something went wrong";
  }
}

/** Accept an Enterprise team invite from a shared link (/join/:token). */
export default function JoinTeam() {
  const [, params] = useRoute("/join/:token");
  const token = params?.token ?? "";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, refreshUser } = useAuthContext();
  const next = encodeURIComponent(`/join/${token}`);

  const { data: invite, isLoading, error } = useQuery<InviteInfo>({
    queryKey: [`/api/team/join/${token}`],
    enabled: !!user && !!token,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => apiRequest("POST", `/api/team/join/${token}`),
    onSuccess: async () => {
      queryClient.clear();
      await refreshUser();
      setLocation("/");
    },
  });

  let body: React.ReactNode;
  if (authLoading || (user && isLoading)) {
    body = <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />;
  } else if (!user) {
    body = (
      <>
        <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-extrabold">You've been invited to a team</h1>
        <p className="mt-2 text-muted-foreground">Sign in or create an account with the invited email to join.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => setLocation(`/login?next=${next}`)}>Sign in</Button>
          <Button variant="outline" onClick={() => setLocation(`/register?next=${next}`)}>
            Create account
          </Button>
        </div>
      </>
    );
  } else if (error || !invite) {
    body = (
      <>
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-rose-500" />
        <h1 className="text-2xl font-extrabold">Invite not found</h1>
        <p className="mt-2 text-muted-foreground">{errorMessage(error) || "This invite link is no longer valid."}</p>
        <Button className="mt-6" onClick={() => setLocation("/")}>Go to dashboard</Button>
      </>
    );
  } else {
    body = (
      <>
        <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-extrabold">Join {invite.ownerName}'s team</h1>
        <p className="mt-2 text-muted-foreground">
          You'll work in their ProfitPad account and share its inventory, sales and expenses. Anything in your own
          account stays saved and comes back if you leave the team.
        </p>
        {!invite.emailMatches ? (
          <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This invite is for <strong>{invite.email}</strong>, but you're signed in as {user.email}. Sign out and
            sign in with the invited email to accept.
          </p>
        ) : !invite.ownerActive ? (
          <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This team isn't on the Enterprise plan right now, so it can't add teammates.
          </p>
        ) : null}
        {accept.error && (
          <p className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage(accept.error)}</p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => accept.mutate()}
            disabled={!invite.emailMatches || !invite.ownerActive || accept.isPending}
          >
            {accept.isPending ? "Joining..." : "Join team"}
          </Button>
          <Button variant="outline" onClick={() => setLocation("/")}>Not now</Button>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <BrandMark className="mb-8" />
      <Card className="w-full max-w-md p-8 text-center">{body}</Card>
    </div>
  );
}

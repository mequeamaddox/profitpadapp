import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/settings-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const accountSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AccountFormData = z.infer<typeof accountSchema>;

export default function SettingsAccount() {
  const { toast } = useToast();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      return await apiRequest("PUT", "/api/user/account/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been changed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive",
      });
    },
  });

  const handleLogoutEverywhere = async () => {
    try {
      await apiRequest("POST", "/api/user/account/logout-all", {});
      toast({
        title: "Sessions Cleared",
        description: "All other sessions have been logged out.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to clear sessions.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: AccountFormData) => {
    passwordMutation.mutate(data);
  };

  return (
    <SettingsShell
      title="Account"
      subtitle="Manage your security and account access."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {passwordMutation.isPending
                      ? "Saving..."
                      : "Update Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Sign out of other active sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogoutEverywhere}>
              Log Out All Other Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    </SettingsShell>
  );
}
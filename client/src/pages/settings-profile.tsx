import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SettingsShell from "@/components/settings/settings-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { User as UserIcon } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      profileImageUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <SettingsShell
        title="Profile"
        subtitle="Manage your personal information."
      >
        <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
      </SettingsShell>
    );
  }

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SettingsShell
      title="Profile"
      subtitle="Manage your personal information."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your name and profile image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={form.watch("profileImageUrl") || undefined}
                  alt={user?.firstName || "User"}
                />
                <AvatarFallback>
                  {user?.firstName ? (
                    user.firstName.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium">
                  {user?.firstName || "User"} {user?.lastName || ""}
                </p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="https://..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ""} disabled />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SettingsShell>
  );
}
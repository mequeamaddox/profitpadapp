import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Logout() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect to login after showing the logout confirmation
    const timer = setTimeout(() => {
      window.location.href = "/logout";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogoutNow = () => {
    window.location.href = "/logout";
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl">Sign Out of ProfitPad</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              You'll be automatically signed out in a few seconds, or you can sign out now.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogoutNow} 
              className="w-full"
              variant="destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out Now
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Stay Signed In
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Thanks for using ProfitPad to grow your business!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
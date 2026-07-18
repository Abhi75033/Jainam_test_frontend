import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Lock, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const { loginWithPassword, requestOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("password");
  const [mobile, setMobile] = useState("+919999900000");
  const [password, setPassword] = useState("ChangeMe@108");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword({ mobile, password });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onRequestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await requestOtp(mobile);
      setOtpSent(true);
      toast.success("OTP sent to your mobile.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ mobile, otp });
      toast.success("Signed in.");
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden p-1">
              <img src="/logo.png" alt="JiNANAM Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-brand text-2xl leading-none">JiNANAM</div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                Admin Panel
              </div>
            </div>
          </div>

          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Welcome back.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in with your admin credentials to manage your organization.
          </p>

          <Card className="mt-8 p-6 rounded-md border-border">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="password" data-testid="login-tab-password">
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" data-testid="login-tab-otp">
                  OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={onPasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-pw" className="text-xs font-medium">
                      Mobile Number
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile-pw"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        className="pl-9"
                        required
                        data-testid="login-mobile-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-xs font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="pl-9"
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                <form onSubmit={otpSent ? onVerifyOtp : (e) => { e.preventDefault(); onRequestOtp(); }} className="space-y-4">
                  <div>
                    <Label htmlFor="mobile-otp" className="text-xs font-medium">
                      Mobile Number
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile-otp"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        className="pl-9"
                        disabled={otpSent}
                        required
                        data-testid="login-otp-mobile-input"
                      />
                    </div>
                  </div>
                  {otpSent && (
                    <div>
                      <Label htmlFor="otp" className="text-xs font-medium">
                        One-Time Password
                      </Label>
                      <div className="relative mt-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="6-digit code"
                          className="pl-9 tracking-widest"
                          maxLength={6}
                          required
                          data-testid="login-otp-code-input"
                        />
                      </div>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={loading}
                    data-testid={otpSent ? "login-otp-verify-button" : "login-otp-request-button"}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {otpSent ? "Verify & Sign in" : "Send OTP"}
                  </Button>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Change mobile number
                    </button>
                  )}
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                Demo credentials
              </div>
              <div className="text-xs text-foreground/70 space-y-0.5">
                <div><span className="text-muted-foreground">Super Admin:</span> +919999900000 / ChangeMe@108</div>
                <div><span className="text-muted-foreground">Temple Admin:</span> +919999900001 / ChangeMe@108</div>
              </div>
            </div>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center mt-6">
            By signing in you agree to our terms of use and privacy policy.
          </p>
        </div>
      </div>

      {/* Right: Hero */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524443169398-9aa1ceab67d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxqYWluJTIwdGVtcGxlJTIwYXJjaGl0ZWN0dXJlJTIwcGVhY2VmdWx8ZW58MHx8fHwxNzgzMzM1OTQ4fDA&ixlib=rb-4.1.0&q=85"
          alt="Jain temple"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 login-hero-overlay" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="text-[11px] tracking-[0.28em] uppercase text-white/80 mb-3">
            Serving the Jain community
          </div>
          <h2 className="font-brand text-4xl xl:text-5xl leading-tight mb-4">
            One platform. Every temple, monk & seva — beautifully organised.
          </h2>
          <p className="text-white/85 text-sm max-w-md leading-relaxed">
            Bookings, donations, events, tracking and reports for temples,
            dharamshalas & Jain centers — all in one refined admin experience.
          </p>
          <div className="mt-8 flex items-center gap-6 text-xs text-white/80">
            <div>
              <div className="font-mono-num text-2xl text-white">83</div>
              <div className="uppercase tracking-widest text-[10px]">Gacchas</div>
            </div>
            <div>
              <div className="font-mono-num text-2xl text-white">23</div>
              <div className="uppercase tracking-widest text-[10px]">Tirthankaras</div>
            </div>
            <div>
              <div className="font-mono-num text-2xl text-white">11</div>
              <div className="uppercase tracking-widest text-[10px]">Roles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoPath from "@assets/e11b493c-2b8a-480b-b05e-415585d9ed79_1775877456770.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040404] flex items-center justify-center p-4 font-mono relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logoPath} alt="DuneX" className="h-12 w-auto mb-4" />
          <h1 className="text-white text-xl font-bold tracking-[0.3em]">DUNE<span className="text-primary">X</span></h1>
          <p className="text-muted-foreground text-[10px] tracking-widest mt-1">OPERATIONS DASHBOARD</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-8">
          <div className="mb-6">
            <h2 className="text-white text-sm font-bold tracking-widest">ACCESS CONTROL</h2>
            <p className="text-muted-foreground text-[10px] tracking-widest mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground tracking-widest">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-[#060606] border border-white/10 text-white text-xs pl-9 pr-3 py-2.5 outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground tracking-widest">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#060606] border border-white/10 text-white text-xs pl-9 pr-9 py-2.5 outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] text-red-400 tracking-wider">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black text-[11px] font-bold tracking-[0.2em] py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> AUTHENTICATING...</>
              ) : (
                "INITIALIZE SESSION"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground tracking-widest">SECURE ACCESS</span>
            <span className="flex items-center gap-1.5 text-[9px] text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-[10px] text-muted-foreground hover:text-white transition-colors tracking-wider">
            ← Return to public site
          </a>
        </div>
      </div>
    </div>
  );
}

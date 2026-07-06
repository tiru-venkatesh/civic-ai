import React, { useState } from "react";
import { Shield, Lock, User, AlertCircle, Home, Eye, EyeOff, Key } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToHome }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // Simulate safe identity verification delay
    setTimeout(() => {
      // Allow lowercase/trimmed variations for smooth UX
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if (u === "admin" && p === "admin123") {
        onLoginSuccess();
      } else if (!u || !p) {
        setError("AUTHENTICATION FAILED: Credentials cannot be empty.");
      } else {
        setError("ACCESS DENIED: Invalid Employee ID or passcode credentials.");
      }
      setIsVerifying(false);
    }, 850);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-all duration-300">
        
        {/* Header Branding & Security Icon */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-blue-50 text-[#1565C0] rounded-full ring-8 ring-blue-50/50 animate-pulse">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded">
              SECURE ACCESS GATEWAY
            </span>
            <h2 className="mt-2 text-2xl font-display font-extrabold text-slate-950 tracking-tight">
              Administrative Verification
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              CIVIC-AI National Security Infrastructure Portal
            </p>
          </div>
        </div>

        {/* Security Alert Compliance Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-[11px] text-amber-800 leading-relaxed flex gap-2.5 items-start">
          <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-[11.5px] text-amber-900 mb-0.5">MUNICIPAL COMPLIANCE NOTIFICATION</span>
            Access to this environment is restricted to authorized municipal officers. Active security auditing and session ledger recording are enforced.
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {/* Error Message Box */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-mono font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase font-mono block">
              Officer / Employee ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., admin"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1565C0] focus:bg-white rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase font-mono block">
                Access Passcode
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Case sensitive</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin123"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1565C0] focus:bg-white rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sandbox Credentials Prompt Block */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <span className="font-mono font-bold text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Key className="h-3 w-3 text-slate-400" />
              <span>Sandbox Demo Access Keys</span>
            </span>
            <div className="flex gap-4 text-[11px] font-mono">
              <div>ID: <span className="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</span></div>
              <div>PIN: <span className="text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123</span></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-1/3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Portal Home</span>
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full sm:w-2/3 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  <span>Verify Identity</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

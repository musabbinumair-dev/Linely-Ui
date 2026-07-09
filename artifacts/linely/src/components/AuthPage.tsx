import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Monitor, 
  Settings, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
  Mail,
  ChevronDown,
  Plus,
  Info,
  ShieldAlert
} from "lucide-react";

interface AuthPageProps {
  onGoHome: () => void;
  onSelectConsole: () => void;
  onSelectAdmin: () => void;
  onSelectSuperadmin: () => void;
  onSelectCompanySuperadmin: () => void;
}

type AuthMode = "login" | "register" | "forgot" | "workspace";

interface RegisteredUser {
  name: string;
  email: string;
  passwordHash: string;
}

export default function AuthPage({
  onGoHome,
  onSelectConsole,
  onSelectAdmin,
  onSelectSuperadmin,
  onSelectCompanySuperadmin
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  // Load "Remembered" Email
  useEffect(() => {
    const savedEmail = localStorage.getItem("optrixx_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (emailStr: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const existingStr = localStorage.getItem("optrixx_registered_users");
      const users: RegisteredUser[] = existingStr ? JSON.parse(existingStr) : [];

      const duplicate = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (duplicate || email.toLowerCase() === "daemon@targaryen.com") {
        setIsLoading(false);
        setError("An account with this email already exists.");
        return;
      }

      const newUser: RegisteredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: password
      };
      users.push(newUser);
      localStorage.setItem("optrixx_registered_users", JSON.stringify(users));

      setIsLoading(false);
      setSuccessMsg("Account created! Redirecting to Sign In...");
      
      setTimeout(() => {
        setSuccessMsg(null);
        setMode("login");
        setPassword("");
      }, 1500);
    }, 1200);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      let authSuccessful = false;
      let matchedName = "Daemon Targaryen";

      if (trimmedEmail === "daemon@targaryen.com" && password === "valyriansteel") {
        authSuccessful = true;
      } else {
        const existingStr = localStorage.getItem("optrixx_registered_users");
        const users: RegisteredUser[] = existingStr ? JSON.parse(existingStr) : [];
        const found = users.find(u => u.email === trimmedEmail);

        if (found && found.passwordHash === password) {
          authSuccessful = true;
          matchedName = found.name;
        }
      }

      if (!authSuccessful) {
        setIsLoading(false);
        setError("Invalid email address or password.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("optrixx_remembered_email", email.trim());
      } else {
        localStorage.removeItem("optrixx_remembered_email");
      }

      localStorage.setItem("optrixx_current_user", matchedName);

      setIsLoading(false);
      setSuccessMsg(`Welcome back, ${matchedName}!`);
      
      setTimeout(() => {
        setSuccessMsg(null);
        setMode("workspace");
      }, 1000);
    }, 1000);
  };

  const handleTryDemo = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("optrixx_current_user", "Demo Workspace Partner");
      setMode("workspace");
    }, 600);
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recoveryEmail.trim() || !validateEmail(recoveryEmail)) {
      setError("Please enter a valid corporate email address.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setRecoverySent(true);
    }, 1200);
  };

  return (
    <div className="h-screen w-full bg-white font-sans selection:bg-[#4F3FB9]/20 selection:text-[#4F3FB9] overflow-hidden relative">
      
      {/* Main Container Card (Centered exactly like the design mockup) */}
      <div 
        className="w-full h-full grid grid-cols-1 md:grid-cols-12 overflow-hidden"
        id="auth-container-card"
      >
        
        {/* LEFT COLUMN: Lavender Gradient & Beautiful Dashboard Mockup (Exactly Cloned) */}
        <div 
          className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#F2EDFF] via-[#EAE3FF] to-[#F5F2FF] p-8 lg:p-12 flex-col justify-between relative overflow-hidden select-none border-r border-slate-100/50 h-full"
          id="left-brand-panel"
        >

          {/* Heading */}
          <div className="mt-2 space-y-1" id="left-header">
            <h2 className="text-[44px] font-extrabold text-[#3B29B1] tracking-tight leading-none font-rethink">
              Optimize
            </h2>
            <p className="text-[#8E8CB0] text-lg font-medium leading-none font-rethink">
              your queue operations
            </p>
          </div>

          {/* Tilted High-Fidelity Mockup (Cloned precisely) */}
          <div 
            className="relative mt-8 md:mt-12 mb-4 w-full [perspective:1000px] origin-top-left flex justify-center"
            id="mockup-perspective-wrapper"
          >
            {/* The tilted browser/dashboard canvas */}
            <div 
              className="w-[108%] md:w-[115%] bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_12px_35px_rgba(79,63,185,0.06)] [transform:rotateX(6deg)_rotateY(-14deg)_rotateZ(3deg)] origin-top-left transition-all duration-700 hover:[transform:rotateX(4deg)_rotateY(-10deg)_rotateZ(2deg)]"
              id="dashboard-canvas-tilted"
            >
              {/* Mockup Top Header Row */}
              <div className="flex items-center justify-between mb-4 text-[9px] font-semibold text-slate-500">
                {/* Left side empty or status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Monitor</span>
                </div>

                {/* Right side controls matching design */}
                <div className="flex items-center gap-1.5">
                  {/* Date Selector Pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/60 rounded-full text-[8.5px] font-bold text-slate-600 shadow-2xs">
                    <span>Today, Jul 1, 2026</span>
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                  {/* Export button */}
                  <div className="px-2.5 py-1 bg-[#1F1E3A] text-white rounded-full text-[8.5px] font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-900">
                    <span>Export</span>
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  {/* Plus Button */}
                  <div className="w-5 h-5 bg-[#1F1E3A] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-900">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Two Column Cards Grid inside mockup */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Card 1: Avg Wait Duration (Replaces generic customer retention) */}
                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                  <div>
                    <p className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wide">Avg. Wait Duration</p>
                    <p className="text-lg font-extrabold text-[#1F1E3A] mt-1 font-rethink">14.2m</p>
                  </div>
                  {/* Down Pill (Representing wait reduction) */}
                  <div className="mt-2.5 self-start px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[8px] font-extrabold flex items-center gap-0.5">
                    <span>▼</span>
                    <span>-2.1m from avg</span>
                  </div>
                </div>

                {/* Card 2: SLA Compliance with Lavender/Pink Pastel Gradient (Replaces generic products attention card) */}
                <div className="bg-gradient-to-tr from-[#F1EAFF] via-[#FFEDF4] to-[#FFF6FA] border border-slate-100/60 rounded-xl p-3 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-1">
                      <p className="text-[8.5px] font-bold text-[#4F3FB9]/80 uppercase tracking-wide">SLA Compliance</p>
                      <Info className="w-2.5 h-2.5 text-[#4F3FB9]/60" />
                    </div>
                    <p className="text-xl font-black text-[#1F1E3A] mt-1 font-rethink">91.8%</p>
                    <p className="text-[9px] font-semibold text-[#8E8CB0] mt-0.5">SLA Target Goal</p>
                  </div>
                  {/* See Details Pill Button */}
                  <div className="mt-3 relative z-10 self-start px-2 py-0.5 bg-[#4F3FB9] text-white rounded-full text-[7.5px] font-extrabold cursor-pointer hover:bg-[#3B29B1] transition-colors">
                    <span>SLA Insights &gt;</span>
                  </div>
                </div>
              </div>

              {/* Custom High-Fidelity Interactive SVG Line Graph Card (Replaces Sales Trend with dual-line Checked-In/Served Queue trend) */}
              <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs">
                {/* Top subtitle */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F3FB9]"></div>
                    <span className="text-[8.5px] font-bold text-[#8E8CB0] uppercase tracking-wider">Today's Entry Trends</span>
                  </div>
                  <div className="flex gap-2 text-[7.5px] font-bold text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-[#4F3FB9] rounded-full inline-block" /> Checked-In</span>
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-[#00C3E3] rounded-full inline-block" /> Served</span>
                  </div>
                </div>

                {/* SVG Graph Drawing */}
                <div className="relative h-20 w-full" id="mock-svg-chart-container">
                  {/* Vertical Dotted line matching active tooltip */}
                  <div className="absolute left-[44%] top-0 bottom-3 border-l border-dashed border-slate-200"></div>

                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 80">
                    {/* Background Soft Dotted Grid Lines */}
                    <line x1="0" y1="20" x2="280" y2="20" stroke="#F1F1F6" strokeDasharray="2" />
                    <line x1="0" y1="40" x2="280" y2="40" stroke="#F1F1F6" strokeDasharray="2" />
                    <line x1="0" y1="60" x2="280" y2="60" stroke="#F1F1F6" strokeDasharray="2" />

                    {/* Curve 1: Cyan Line (Served Customers) */}
                    <path 
                      d="M 5 65 Q 35 55, 65 50 T 125 38 T 185 48 T 245 42 T 275 52" 
                      fill="none" 
                      stroke="#00C3E3" 
                      strokeWidth="1.5" 
                    />

                    {/* Curve 2: Purple Line (Checked-In Customers) */}
                    <path 
                      d="M 5 60 Q 35 40, 65 55 T 125 30 T 185 45 T 245 35 T 275 50" 
                      fill="none" 
                      stroke="#4F3FB9" 
                      strokeWidth="2.5" 
                    />

                    {/* Active highlighted Node on purple line */}
                    {/* At index 4 (around x = 125, y = 30) */}
                    <circle cx="125" cy="30" r="4.5" fill="#4F3FB9" stroke="white" strokeWidth="1.5" className="shadow-sm" />
                  </svg>

                  {/* Absolute Tooltip Card Floating exactly on top of the node */}
                  <div 
                    className="absolute left-[26%] top-[-8px] bg-[#1F1E3A] text-white px-2 py-0.5 rounded-md text-[7px] font-extrabold shadow-md flex items-center gap-1.5 whitespace-nowrap z-20 pointer-events-none"
                    id="mockup-chart-tooltip"
                  >
                    <span className="text-[6.5px] opacity-75 font-normal">12:00 PM</span>
                    <span className="text-amber-300 font-black">72 Checked-In</span>
                  </div>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center px-1 text-[7.5px] font-bold text-slate-400 mt-1 font-mono">
                  <span>08:00 AM</span>
                  <span>10:00 AM</span>
                  <span>12:00 PM</span>
                  <span>02:00 PM</span>
                  <span>04:00 PM</span>
                </div>

                {/* Chart Footer with Watermark */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50 text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-[#4F3FB9] rounded-2xs"></div>
                  <span>Real-Time Ticket Stream Channel</span>
                </div>
              </div>
            </div>
          </div>

          </div>        {/* RIGHT COLUMN: Pure White elegant form container (Exactly matching image) */}
        <div 
          className="col-span-12 md:col-span-7 bg-white p-6 md:p-8 lg:p-10 flex flex-col justify-between relative h-full overflow-hidden"
          id="right-auth-form-panel"
        >
          
          {/* Top Center Logo Header */}
          <div className="flex flex-col items-center justify-center mt-1 mb-4 lg:mb-6" id="right-panel-brand-header">
            <span className="font-boldonse text-2xl md:text-[30px] tracking-tight text-brand-navy select-none block leading-none">
              Linely
            </span>
          </div>

          {/* Main State Forms Container */}
          <div className="w-full max-w-sm mx-auto my-auto" id="auth-states-viewport">
            <AnimatePresence mode="wait">
              
              {/* STATE 1: SIGN IN (Default image state) */}
              {mode === "login" && (
                <motion.div
                  key="login-form-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-4 lg:space-y-5"
                >
                  <div className="text-left">
                    <h3 className="font-rethink text-2xl font-semibold uppercase tracking-wide text-[#1F1E3A] leading-tight">
                      SIGN IN
                    </h3>
                    <p className="text-xs text-[#8E8CB0] mt-0.5 font-medium font-rethink">
                      Please login to continue
                    </p>
                  </div>

                  {successMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-rethink font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 font-rethink font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] px-4 py-2.5 text-[14px] outline-none font-sans font-medium"
                        id="login-email-input"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] pl-4 pr-12 py-2.5 text-[14px] outline-none font-sans font-medium"
                          id="login-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Checkbox and Forgot Password Link */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-[#4F3FB9] focus:ring-[#4F3FB9] h-4 w-4"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                        }}
                        className="text-[#4F3FB9] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Royal Purple Submit Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#4F3FB9] hover:bg-[#3E2FA1] text-white py-2.5 lg:py-3 rounded-[14px] font-extrabold text-[14px] transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-1 lg:mt-2"
                      id="submit-login-btn"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Login</span>
                      )}
                    </button>
                  </form>

                  {/* Register and Demo Bypasses */}
                  <div className="text-center space-y-3 pt-1.5 lg:pt-2">
                    <p className="text-xs font-semibold text-slate-500">
                      No Account Yet?{" "}
                      <span
                        onClick={() => {
                          setMode("register");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[#4F3FB9] font-bold hover:underline cursor-pointer"
                        id="register-toggle-link"
                      >
                        Get Yours Now
                      </span>
                    </p>

                    <div className="relative flex items-center justify-center py-0.5">
                      <div className="absolute inset-x-0 h-px bg-slate-100" />
                      <span className="relative z-10 bg-white px-3 text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                        Or enter fast sandbox
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleTryDemo}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 lg:py-2 bg-[#F2EDFF] hover:bg-[#EAE3FF] text-[#4F3FB9] font-rethink font-bold text-xs rounded-full border border-[#4F3FB9]/10 transition-all cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4F3FB9]" />
                      <span>Instant Demo Access</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE 2: REGISTER PROFILE */}
              {mode === "register" && (
                <motion.div
                  key="register-form-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="text-left">
                    <h3 className="font-rethink text-2xl font-extrabold text-[#1F1E3A] tracking-tight leading-tight">
                      Register
                    </h3>
                    <p className="text-xs text-[#8E8CB0] mt-0.5 font-medium font-rethink">
                      Create an enterprise sandbox credentials
                    </p>
                  </div>

                  {successMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-rethink font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 font-rethink font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Daemon Targaryen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] px-4 py-2.5 text-[14px] outline-none font-sans font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="daemon@targaryen.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] px-4 py-2.5 text-[14px] outline-none font-sans font-medium"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] px-4 py-2.5 text-[14px] outline-none font-sans font-medium"
                      />
                    </div>

                    {/* Royal Purple Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#4F3FB9] hover:bg-[#3E2FA1] text-white py-2.5 lg:py-3 rounded-[14px] font-extrabold text-[14px] transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-1"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Create Account</span>
                      )}
                    </button>
                  </form>

                  {/* Back to sign in link */}
                  <div className="text-center pt-2">
                    <p className="text-xs font-semibold text-slate-500">
                      Already have an account?{" "}
                      <span
                        onClick={() => {
                          setMode("login");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[#4F3FB9] font-bold hover:underline cursor-pointer"
                      >
                        Sign In Instead
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: FORGOT PASSWORD */}
              {mode === "forgot" && (
                <motion.div
                  key="forgot-form-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="text-left">
                    <h3 className="font-rethink text-2xl font-extrabold text-[#1F1E3A] tracking-tight leading-tight">
                      Recover Password
                    </h3>
                    <p className="text-xs text-[#8E8CB0] mt-0.5 font-medium font-rethink">
                      Retrieve credentials for system access
                    </p>
                  </div>

                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 font-rethink font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!recoverySent ? (
                    <form onSubmit={handlePasswordRecovery} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-[#1F1E3A] uppercase tracking-wider block font-rethink">
                          Registered Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full bg-[#F5F5F7] text-slate-900 border border-transparent focus:border-[#4F3FB9] focus:bg-white transition-all rounded-[14px] px-4 py-2.5 text-[14px] outline-none font-sans font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#4F3FB9] hover:bg-[#3E2FA1] text-white py-2.5 lg:py-3 rounded-[14px] font-extrabold text-[14px] transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Send Recovery Email</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2.5">
                      <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <Check className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">Instructions Sent</h4>
                      <p className="text-xs text-slate-400 leading-normal">
                        Recovery reset links dispatched to <span className="font-semibold text-slate-700">{recoveryEmail}</span>.
                      </p>
                      <div className="pt-2 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-semibold">Demo Bypass Password: </span>
                        <span className="text-[#4F3FB9] font-extrabold bg-[#F5F4FF] px-1.5 py-0.5 rounded border border-slate-200 select-all font-mono">valyriansteel</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setRecoverySent(false);
                        setRecoveryEmail("");
                        setError(null);
                      }}
                      className="text-xs font-bold text-[#4F3FB9] hover:underline"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE 4: WORKSPACE SELECTION (Interactive choice page) */}
              {mode === "workspace" && (
                <motion.div
                  key="workspace-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-0.5">
                    <span className="inline-flex items-center justify-center bg-[#F2EDFF] text-[#4F3FB9] font-rethink text-[9px] font-extrabold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full">
                      Authorized Session
                    </span>
                    <h3 className="font-rethink text-xl font-black text-[#1F1E3A] tracking-tight">
                      Choose Portal
                    </h3>
                    <p className="text-xs text-[#8E8CB0] max-w-[280px] mx-auto font-rethink leading-relaxed">
                      Select your operational role interface to proceed.
                    </p>
                  </div>

                  {/* Portal Selection options */}
                  <div className="space-y-2">
                    {/* Option 1: Operator Console */}
                    <button
                      onClick={onSelectConsole}
                      className="group w-full flex items-start gap-3 p-2.5 text-left bg-[#F8F9FA] hover:bg-[#F2EDFF] border border-slate-100 hover:border-[#4F3FB9]/30 rounded-2xl transition-all duration-300 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#F2EDFF] text-[#4F3FB9] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#4F3FB9] group-hover:text-white">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#4F3FB9]">FRONTCOUNTER</span>
                          <span className="text-[9px] font-bold text-[#4F3FB9] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Enter &rarr;
                          </span>
                        </div>
                        <h4 className="text-[12px] font-extrabold text-[#1F1E3A] mt-0.5">Operator Console</h4>
                        <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5">Manage live lines, counters and customer calls.</p>
                      </div>
                    </button>

                    {/* Option 2: Admin Dashboard */}
                    <button
                      onClick={onSelectAdmin}
                      className="group w-full flex items-start gap-3 p-2.5 text-left bg-[#F8F9FA] hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-300 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#1F1E3A] group-hover:text-white">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">ADMINISTRATOR</span>
                          <span className="text-[9px] font-bold text-[#1F1E3A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Enter &rarr;
                          </span>
                        </div>
                        <h4 className="text-[12px] font-extrabold text-[#1F1E3A] mt-0.5">Control Center</h4>
                        <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5">Configure system thresholds, simulated SLAs, and settings.</p>
                      </div>
                    </button>

                    {/* Option 3: Superadmin Dashboard */}
                    <button
                      onClick={onSelectSuperadmin}
                      className="group w-full flex items-start gap-3 p-2.5 text-left bg-[#F8F9FA] hover:bg-red-50 border border-slate-100 hover:border-red-500/20 rounded-2xl transition-all duration-300 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-navy group-hover:text-brand-cyan">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-red-500 group-hover:text-red-600 transition-colors">LINELY TEAM ADMIN</span>
                          <span className="text-[9px] font-bold text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Enter &rarr;
                          </span>
                        </div>
                        <h4 className="text-[12px] font-extrabold text-[#1F1E3A] mt-0.5">Platform Developers Admin</h4>
                        <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5">Linely Internal Team Portal. Manage tenants, plans, and platform logs.</p>
                      </div>
                    </button>

                    {/* Option 4: Company Superadmin Dashboard */}
                    <button
                      onClick={onSelectCompanySuperadmin}
                      className="group w-full flex items-start gap-3 p-2.5 text-left bg-[#FDFCF7] hover:bg-[#FAF6EC] border border-[#EBE4D5]/60 hover:border-[#D6C6A5] rounded-2xl transition-all duration-300 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#FAF6EC] text-brand-navy flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-navy group-hover:text-brand-cyan">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-brand-navy group-hover:text-brand-deepnavy transition-colors">COMPANY SUPERADMIN</span>
                          <span className="text-[9px] font-bold text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Enter &rarr;
                          </span>
                        </div>
                        <h4 className="text-[12px] font-extrabold text-brand-navy mt-0.5 font-rethink">Corporate Superadmin</h4>
                        <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5">Global tenant & branch dashboard. Manage physical offices, SLA metrics and global locations.</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout signoff */}
                  <div className="text-center pt-1">
                    <span
                      onClick={() => {
                        setMode("login");
                        localStorage.removeItem("optrixx_current_user");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-[#4F3FB9] cursor-pointer transition-colors"
                    >
                      Secure Sign Out
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation Links matching design mockup perfectly */}
          <div 
            className="flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-400/80 mt-4 lg:mt-6 select-none"
            id="auth-footer-links"
          >
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">FAQ</span>
          </div>

        </div>
      </div>
    </div>
  );
}

import React from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Activity, 
  Sparkles, 
  Layers, 
  CreditCard,
  Globe,
  Zap,
  Briefcase
} from "lucide-react";

// ============================================================================
// GLOBAL REUSABLE UI COMPONENTS (LIQUID GLASSMORPHISM)
// ============================================================================

export interface StatusPillProps {
  status: string;
  className?: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  icon?: React.ComponentType<any>;
}

export const StatusPill: React.FC<StatusPillProps> = ({ 
  status, 
  className = "", 
  variant, 
  icon 
}) => {
  const normalized = status.trim().toUpperCase();
  
  // Smart automatic variant detection if not explicitly specified
  let detectedVariant = variant;
  if (!detectedVariant) {
    const isSuccess = [
      "ACTIVE", "STABLE", "OPTIMAL", "ONLINE", "EXCELLENT", "LOW RISK", 
      "ACCEPTED", "SUCCESS", "TASK DONE", "CONSOLE", "MASTER", "COMPLETED"
    ].some(s => normalized.includes(s));
    
    const isWarning = [
      "TRIAL", "WARNING", "THROTTLED", "PENDING", "DUE SOON", "IN REVIEW", 
      "WAITING", "NORMAL LOAD", "ACCELERATED", "SANDBOX"
    ].some(s => normalized.includes(s));
    
    const isFailed = [
      "SUSPENDED", "CANCELLED", "REVOKED", "FAILED", "DECLINED", "CRITICAL", 
      "HIGH TRAFFIC", "DANGER", "ERROR"
    ].some(s => normalized.includes(s));
    
    if (isSuccess) detectedVariant = "success";
    else if (isWarning) detectedVariant = "warning";
    else if (isFailed) detectedVariant = "danger";
    else detectedVariant = "neutral";
  }

  let styleClasses = "bg-slate-500/10 text-slate-700 border border-slate-500/20 backdrop-blur-md shadow-[0_2px_8px_rgba(100,116,139,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
  let Icon = Activity;

  if (detectedVariant === "success") {
    styleClasses = "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(16,185,129,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    Icon = CheckCircle;
  } else if (detectedVariant === "warning") {
    styleClasses = "bg-amber-500/10 text-amber-700 border border-amber-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(245,158,11,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    Icon = AlertTriangle;
  } else if (detectedVariant === "danger") {
    styleClasses = "bg-rose-500/10 text-rose-700 border border-rose-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(244,63,94,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    Icon = XCircle;
  } else if (detectedVariant === "info") {
    styleClasses = "bg-blue-500/10 text-blue-700 border border-blue-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(59,130,246,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    Icon = Sparkles;
  }

  const ActiveIcon = icon || Icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide transition-all duration-300 ease-out whitespace-nowrap shrink-0 ${styleClasses} ${className}`}>
      <ActiveIcon className="w-3.5 h-3.5 shrink-0 mr-1.5" />
      <span className="whitespace-nowrap shrink-0">{status}</span>
    </span>
  );
};

export interface PlanBadgeProps {
  plan: "Starter" | "Professional" | "Enterprise" | string;
  className?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  plan, 
  className = "" 
}) => {
  const normalized = plan.trim().toUpperCase();

  let styleClasses = "";
  let label = plan;
  let Icon = CreditCard;

  if (normalized === "STARTER" || normalized === "FREE TRIAL" || normalized === "MERCHANT") {
    styleClasses = "bg-amber-500/10 text-amber-800 border border-amber-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(245,158,11,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    label = "Merchant";
    Icon = Briefcase;
  } else if (normalized === "PROFESSIONAL" || normalized === "PAID PLAN" || normalized === "PRO ACCESS") {
    styleClasses = "bg-indigo-500/10 text-indigo-700 border border-indigo-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(99,102,241,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    label = "Pro Access";
    Icon = Zap;
  } else if (normalized === "ENTERPRISE" || normalized === "ENTERPRISE TENANT") {
    styleClasses = "bg-cyan-500/10 text-cyan-700 border border-cyan-500/25 backdrop-blur-md shadow-[0_2px_8px_rgba(6,182,212,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    label = "Enterprise Tenant";
    Icon = Globe;
  } else {
    styleClasses = "bg-slate-500/10 text-slate-700 border border-slate-500/20 backdrop-blur-md shadow-[0_2px_8px_rgba(100,116,139,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]";
    Icon = Layers;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold font-sans tracking-wider border transition-all duration-300 ease-out whitespace-nowrap shrink-0 ${styleClasses} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0 mr-1.5" />
      <span className="whitespace-nowrap shrink-0">{label}</span>
    </span>
  );
};

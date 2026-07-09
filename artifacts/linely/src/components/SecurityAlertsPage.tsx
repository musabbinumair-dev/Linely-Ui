import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Shield, AlertTriangle, AlertCircle, Info,
  CheckCircle, XCircle, Clock, MoreVertical, ChevronDown,
  ChevronRight, User, Zap, Bell, Eye, Flag,
  Calendar, BellOff, ArrowUpRight, Lock, Globe,
  Database, Network, Server, FileWarning, Layers,
  ShieldAlert, ShieldCheck, ShieldOff, Activity,
  UserCheck, X, Inbox, TrendingUp, RefreshCw
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type AlertSeverity = "Critical" | "High" | "Warning" | "Info";
type AlertStatus = "Active" | "Acknowledged" | "Resolved" | "Ignored" | "Silenced";
type AlertCategory = "Authentication" | "Access Control" | "System" | "Data" | "Network" | "Compliance";
type AlertAction = "view" | "acknowledge" | "assign" | "escalate" | "resolve" | "silence";
type DateRange = "Today" | "Last 7 Days" | "Last 30 Days" | "This Quarter";
type IncidentStatus = "Investigating" | "Mitigating" | "Monitoring";

interface AlertItem {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
  module: string;
  createdAt: string;
  createdDaysAgo: number;
  status: AlertStatus;
  owner: string;
  description: string;
  isEscalated: boolean;
}

interface ActiveIncident {
  id: string;
  title: string;
  severity: AlertSeverity;
  alertCount: number;
  startedAt: string;
  status: IncidentStatus;
}

interface RecentAck {
  id: string;
  alert: string;
  by: string;
  at: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "alrt-001", title: "Brute Force Attack Detected",
    severity: "Critical", category: "Authentication",
    source: "Branch Login API", module: "Auth Service",
    createdAt: "8 mins ago", createdDaysAgo: 0,
    status: "Active", owner: "Unassigned",
    description: "147 consecutive failed login attempts from IP 185.220.101.43 targeting NYC Flagship branch portal. Geographic anomaly: Origin is Tor exit node.",
    isEscalated: true
  },
  {
    id: "alrt-002", title: "Admin Privilege Escalation",
    severity: "Critical", category: "Access Control",
    source: "User Management", module: "IAM Layer",
    createdAt: "22 mins ago", createdDaysAgo: 0,
    status: "Active", owner: "Sébastien Chen",
    description: "User 'r.hayes@linely.io' self-assigned SuperAdmin role without approval flow. Policy violation — admin grants require dual approval.",
    isEscalated: true
  },
  {
    id: "alrt-003", title: "Multiple Failed MFA Attempts",
    severity: "High", category: "Authentication",
    source: "Auth Service", module: "MFA Gateway",
    createdAt: "1 hr ago", createdDaysAgo: 0,
    status: "Active", owner: "Unassigned",
    description: "12 MFA code rejections for account 'j.torres@boston-branch.com' over 20 minutes. Possible credential stuffing or account takeover attempt.",
    isEscalated: false
  },
  {
    id: "alrt-004", title: "Data Export Rate Exceeded",
    severity: "High", category: "Data",
    source: "Export Service", module: "Data Pipeline",
    createdAt: "2 hrs ago", createdDaysAgo: 0,
    status: "Acknowledged", owner: "Priya Mehta",
    description: "LA Hub exported 48 GB in a single session (threshold: 10 GB). Operator ID: op-2291. Data included full customer queue history from 2022–2024.",
    isEscalated: false
  },
  {
    id: "alrt-005", title: "Unauthorized API Access Attempt",
    severity: "High", category: "Network",
    source: "API Gateway", module: "REST API",
    createdAt: "3 hrs ago", createdDaysAgo: 0,
    status: "Active", owner: "Unassigned",
    description: "Repeated 401 responses (312 req/min) to /api/v2/admin/* endpoints. API key revoked at source but requests continue from rotation. Possible key leakage.",
    isEscalated: false
  },
  {
    id: "alrt-006", title: "Session Timeout Policy Bypass",
    severity: "Warning", category: "Authentication",
    source: "Session Manager", module: "Auth Service",
    createdAt: "4 hrs ago", createdDaysAgo: 0,
    status: "Active", owner: "Unassigned",
    description: "3 admin sessions active beyond configured 4-hour timeout. Session refresh tokens were manually extended via internal debug endpoint.",
    isEscalated: false
  },
  {
    id: "alrt-007", title: "Backup Integrity Check Failed",
    severity: "Warning", category: "System",
    source: "Backup Service", module: "Infrastructure",
    createdAt: "6 hrs ago", createdDaysAgo: 0,
    status: "Active", owner: "DevOps Bot",
    description: "Daily backup checksum mismatch detected for snapshot backup-2026-07-08-22h. File corruption may have occurred during upload to S3. Restore test pending.",
    isEscalated: false
  },
  {
    id: "alrt-008", title: "GDPR Deletion Request Overdue",
    severity: "Warning", category: "Compliance",
    source: "Data Management", module: "Privacy Suite",
    createdAt: "1 day ago", createdDaysAgo: 1,
    status: "Active", owner: "Unassigned",
    description: "Customer deletion request #CR-8812 has exceeded the 72-hour SLA window. Legally binding under GDPR Article 17. Immediate action required.",
    isEscalated: false
  },
  {
    id: "alrt-009", title: "Rate Limit Threshold at 85%",
    severity: "Warning", category: "Network",
    source: "API Gateway", module: "Traffic Control",
    createdAt: "1 day ago", createdDaysAgo: 1,
    status: "Acknowledged", owner: "Priya Mehta",
    description: "Global API rate limit usage at 85% of allocated capacity. Peak traffic from Chicago Loop and LA Hub. Projected to hit ceiling within 6 hours at current growth.",
    isEscalated: false
  },
  {
    id: "alrt-010", title: "Inactive Admin Account Active Login",
    severity: "Warning", category: "Authentication",
    source: "Auth Service", module: "IAM Layer",
    createdAt: "2 days ago", createdDaysAgo: 2,
    status: "Resolved", owner: "Sébastien Chen",
    description: "Account 'admin-legacy-2023@linely.io' logged in after 14 months of inactivity from Frankfurt. Account has been quarantined and access revoked.",
    isEscalated: false
  },
  {
    id: "alrt-011", title: "SSL Certificate Expires in 14 Days",
    severity: "Info", category: "System",
    source: "Infrastructure", module: "TLS Manager",
    createdAt: "2 days ago", createdDaysAgo: 2,
    status: "Acknowledged", owner: "DevOps Bot",
    description: "Certificate for *.api.linely.io expires 2026-07-23. Auto-renewal via Let's Encrypt is configured but DNS propagation may cause a 15–30 min window.",
    isEscalated: false
  },
  {
    id: "alrt-012", title: "New SuperAdmin User Created",
    severity: "Info", category: "Access Control",
    source: "User Management", module: "IAM Layer",
    createdAt: "3 days ago", createdDaysAgo: 3,
    status: "Resolved", owner: "Sébastien Chen",
    description: "SuperAdmin account created for 'p.nakamura@linely.io' via dual-approval workflow. MFA enforced at first login. Audit trail: ADM-TXN-00441.",
    isEscalated: false
  },
];

const ACTIVE_INCIDENTS: ActiveIncident[] = [
  { id: "inc-001", title: "Concurrent Auth Failures — NYC & LA", severity: "Critical", alertCount: 3, startedAt: "35 mins ago", status: "Investigating" },
  { id: "inc-002", title: "API Anomaly Cluster — Int'l Branches", severity: "High", alertCount: 2, startedAt: "3 hrs ago", status: "Mitigating" },
  { id: "inc-003", title: "TLS / SSL Expiry Risk", severity: "Warning", alertCount: 1, startedAt: "2 days ago", status: "Monitoring" },
];

const RECENT_ACKS: RecentAck[] = [
  { id: "ra-001", alert: "SSL Certificate Expires", by: "DevOps Bot", at: "12 mins ago" },
  { id: "ra-002", alert: "Data Export Rate Exceeded", by: "Priya Mehta", at: "1 hr ago" },
  { id: "ra-003", alert: "Rate Limit Threshold 85%", by: "Priya Mehta", at: "2 hrs ago" },
];

const ESCALATION_QUEUE = [
  { id: "esc-001", title: "Brute Force Attack Detected", severity: "Critical" as AlertSeverity, assignee: "Unassigned" },
  { id: "esc-002", title: "Admin Privilege Escalation", severity: "Critical" as AlertSeverity, assignee: "Sébastien Chen" },
  { id: "esc-003", title: "GDPR Deletion Overdue", severity: "Warning" as AlertSeverity, assignee: "Legal Team" },
];

// ─── Configs ─────────────────────────────────────────────────────────────────

const SEVERITY_CFG: Record<AlertSeverity, { chip: string; dot: string; row: string; icon: React.ReactNode }> = {
  Critical: {
    chip: "bg-rose-50 text-rose-700 border-rose-200/60",
    dot: "bg-rose-500 animate-pulse",
    row: "border-l-2 border-rose-400 bg-rose-50/20",
    icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
  },
  High: {
    chip: "bg-orange-50 text-orange-700 border-orange-200/60",
    dot: "bg-orange-500",
    row: "border-l-2 border-orange-400 bg-orange-50/10",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
  },
  Warning: {
    chip: "bg-amber-50 text-amber-700 border-amber-200/60",
    dot: "bg-amber-400",
    row: "border-l-2 border-amber-300 bg-amber-50/10",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  },
  Info: {
    chip: "bg-sky-50 text-sky-700 border-sky-200/60",
    dot: "bg-sky-400",
    row: "border-l-2 border-sky-200",
    icon: <Info className="w-3.5 h-3.5 text-sky-500" />,
  },
};

const STATUS_CFG: Record<AlertStatus, { chip: string; label: string }> = {
  Active:       { chip: "bg-rose-50 text-rose-700 border-rose-200/60", label: "Active" },
  Acknowledged: { chip: "bg-amber-50 text-amber-700 border-amber-200/60", label: "Ack'd" },
  Resolved:     { chip: "bg-emerald-50 text-emerald-700 border-emerald-200/60", label: "Resolved" },
  Ignored:      { chip: "bg-slate-50 text-slate-500 border-slate-200/60", label: "Ignored" },
  Silenced:     { chip: "bg-purple-50 text-purple-700 border-purple-200/60", label: "Silenced" },
};

const CATEGORY_ICON: Record<AlertCategory, React.ReactNode> = {
  Authentication: <Lock className="w-3 h-3" />,
  "Access Control": <Shield className="w-3 h-3" />,
  System:   <Server className="w-3 h-3" />,
  Data:     <Database className="w-3 h-3" />,
  Network:  <Network className="w-3 h-3" />,
  Compliance: <FileWarning className="w-3 h-3" />,
};

const INCIDENT_STATUS_CFG: Record<IncidentStatus, { chip: string }> = {
  Investigating: { chip: "bg-rose-50 text-rose-700 border-rose-200/60" },
  Mitigating:   { chip: "bg-orange-50 text-orange-700 border-orange-200/60" },
  Monitoring:   { chip: "bg-amber-50 text-amber-700 border-amber-200/60" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityChip({ severity }: { severity: AlertSeverity }) {
  const cfg = SEVERITY_CFG[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cfg.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {severity}
    </span>
  );
}

function StatusChip({ status }: { status: AlertStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cfg.chip}`}>
      {cfg.label}
    </span>
  );
}

function KPICard({ label, value, sub, icon, accent = "text-brand-navy", pulse = false }: {
  label: string; value: number | string; sub: string; icon: React.ReactNode; accent?: string; pulse?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate uppercase tracking-wider">{label}</span>
        <span className="text-slate-400 group-hover:text-brand-ocean transition-colors">{icon}</span>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black font-outfit leading-none flex items-center gap-1.5 ${accent}`}>
          {value}
          {pulse && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
        </p>
        <p className="text-[10px] text-slate font-semibold mt-1 font-mono">{sub}</p>
      </div>
    </div>
  );
}

function ActionMenu({ alertId, status, onAction }: {
  alertId: string;
  status: AlertStatus;
  onAction: (id: string, action: AlertAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const actions: { label: string; icon: React.ReactNode; action: AlertAction; cls?: string; hidden?: boolean }[] = [
    { label: "View Details", icon: <Eye className="w-3.5 h-3.5" />, action: "view" },
    { label: "Acknowledge", icon: <CheckCircle className="w-3.5 h-3.5" />, action: "acknowledge", hidden: status === "Acknowledged" || status === "Resolved" },
    { label: "Assign Owner", icon: <UserCheck className="w-3.5 h-3.5" />, action: "assign" },
    { label: "Escalate", icon: <ArrowUpRight className="w-3.5 h-3.5" />, action: "escalate" },
    { label: "Mark Resolved", icon: <ShieldCheck className="w-3.5 h-3.5" />, action: "resolve", hidden: status === "Resolved", cls: "text-emerald-600" },
    { label: "Silence Alert", icon: <BellOff className="w-3.5 h-3.5" />, action: "silence", cls: "text-slate-500" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-200/60 rounded-2xl shadow-lg overflow-hidden py-1"
          >
            {actions.filter(a => !a.hidden).map(({ label, icon, action, cls }) => (
              <button
                key={action}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[11px] font-semibold hover:bg-slate-50 transition-colors text-left ${cls ?? "text-brand-navy"}`}
                onClick={e => { e.stopPropagation(); onAction(alertId, action); setOpen(false); }}
              >
                <span className="text-slate">{icon}</span>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertRow({ alert, expanded, onToggle, onAction }: {
  alert: AlertItem;
  expanded: boolean;
  onToggle: () => void;
  onAction: (id: string, action: AlertAction) => void;
}) {
  const sev = SEVERITY_CFG[alert.severity];

  return (
    <motion.div
      layout
      className={`bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs mb-2 ${sev.row}`}
    >
      {/* Row header */}
      <div
        className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-3.5 items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggle}
      >
        {/* Severity indicator */}
        <div className="flex items-center gap-2.5">
          {sev.icon}
          {alert.isEscalated && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Escalated" />
          )}
        </div>

        {/* Main info */}
        <div className="min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-brand-navy leading-snug truncate">{alert.title}</span>
            <SeverityChip severity={alert.severity} />
            <StatusChip status={alert.status} />
            {alert.isEscalated && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200/60 uppercase tracking-wide">
                <Zap className="w-2.5 h-2.5" /> Escalated
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate font-medium">
            <span className="flex items-center gap-1">{CATEGORY_ICON[alert.category]}{alert.category}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{alert.module}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{alert.createdAt}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className={alert.owner === "Unassigned" ? "text-rose-400 font-bold" : ""}>{alert.owner}</span>
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <ActionMenu alertId={alert.id} status={alert.status} onAction={onAction} />
          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/40">
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{alert.description}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onAction(alert.id, "acknowledge")}
                  className="px-3 py-1.5 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
                </button>
                <button
                  onClick={() => onAction(alert.id, "escalate")}
                  className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:bg-rose-50 active:scale-95 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Escalate
                </button>
                <button
                  onClick={() => onAction(alert.id, "resolve")}
                  className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Resolve
                </button>
                <button
                  onClick={() => onAction(alert.id, "silence")}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <BellOff className="w-3.5 h-3.5" /> Silence
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SecurityAlertsPageProps {
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function SecurityAlertsPage({ triggerToast }: SecurityAlertsPageProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [recentAcks, setRecentAcks] = useState<RecentAck[]>(RECENT_ACKS);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"All" | AlertSeverity>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | AlertCategory>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | AlertStatus>("All");
  const [dateRange, setDateRange] = useState<DateRange>("Today");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const maxDaysAgo = useMemo(() => {
    if (dateRange === "Today") return 0;
    if (dateRange === "Last 7 Days") return 7;
    if (dateRange === "Last 30 Days") return 30;
    return Infinity;
  }, [dateRange]);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.module.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      const matchSeverity = severityFilter === "All" || a.severity === severityFilter;
      const matchCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      const matchDate = a.createdDaysAgo <= maxDaysAgo;
      return matchSearch && matchSeverity && matchCategory && matchStatus && matchDate;
    });
  }, [alerts, search, severityFilter, categoryFilter, statusFilter, maxDaysAgo]);

  const kpis = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.severity === "Critical" && a.status === "Active").length,
    warning: alerts.filter(a => a.severity === "Warning" && a.status === "Active").length,
    resolved: alerts.filter(a => a.status === "Resolved").length,
    ignored: alerts.filter(a => a.status === "Ignored" || a.status === "Silenced").length,
    incidents: ACTIVE_INCIDENTS.length,
  }), [alerts]);

  const unresolvedCritical = useMemo(() =>
    alerts.filter(a => a.severity === "Critical" && a.status !== "Resolved"), [alerts]);

  const handleAction = (id: string, action: AlertAction) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    if (action === "view") {
      setExpandedId(expandedId === id ? null : id);
      return;
    }
    if (action === "acknowledge") {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a));
      setRecentAcks(prev => [{
        id: `ra-${Date.now()}`, alert: alert.title, by: "Sébastien Chen", at: "Just now"
      }, ...prev.slice(0, 4)]);
      triggerToast(`Alert acknowledged: ${alert.title}`, "success");
    } else if (action === "resolve") {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Resolved", owner: "Sébastien Chen" } : a));
      triggerToast(`Alert resolved: ${alert.title}`, "success");
    } else if (action === "escalate") {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isEscalated: true } : a));
      triggerToast(`Alert escalated to incident queue.`, "warning");
    } else if (action === "silence") {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Silenced" } : a));
      triggerToast(`Alert silenced for 24 hours.`, "info");
    } else if (action === "assign") {
      triggerToast(`Assign panel coming soon.`, "info");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-5 min-h-full">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate uppercase tracking-widest font-mono">Security & Operations</span>
              <ChevronRight className="w-3 h-3 text-slate/40" />
              <span className="text-[10px] font-bold text-brand-ocean uppercase tracking-widest font-mono">Alerts & Incidents</span>
            </div>
            <h2 className="font-rethink text-xl font-extrabold text-brand-navy leading-none">Security Alerts</h2>
            <p className="text-xs text-slate mt-1">Monitor, triage, and resolve security events across your entire corporate infrastructure</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts..."
                className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200/60 rounded-full text-[11px] font-medium outline-none focus:border-brand-navy w-40 transition-all"
              />
            </div>
            {/* Severity */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <ShieldAlert className="w-3 h-3 text-slate" />
              <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as "All" | AlertSeverity)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </div>
            {/* Category */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Filter className="w-3 h-3 text-slate" />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as "All" | AlertCategory)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Categories</option>
                <option value="Authentication">Authentication</option>
                <option value="Access Control">Access Control</option>
                <option value="System">System</option>
                <option value="Data">Data</option>
                <option value="Network">Network</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
            {/* Status */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Activity className="w-3 h-3 text-slate" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "All" | AlertStatus)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Resolved">Resolved</option>
                <option value="Silenced">Silenced</option>
                <option value="Ignored">Ignored</option>
              </select>
            </div>
            {/* Date range */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Calendar className="w-3 h-3 text-slate" />
              <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>
            {/* Refresh */}
            <button
              onClick={() => triggerToast("Alerts refreshed.", "info")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* ── KPI Strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Total Alerts" value={kpis.total} sub={`${filtered.length} matching filters`} icon={<Bell className="w-4 h-4" />} accent="text-brand-navy" />
          <KPICard label="Critical Active" value={kpis.critical} sub="Need immediate action" icon={<AlertCircle className="w-4 h-4" />} accent="text-rose-600" pulse={kpis.critical > 0} />
          <KPICard label="Warnings" value={kpis.warning} sub="Active warning alerts" icon={<AlertTriangle className="w-4 h-4" />} accent="text-amber-600" />
          <KPICard label="Resolved" value={kpis.resolved} sub="Closed this period" icon={<ShieldCheck className="w-4 h-4" />} accent="text-emerald-600" />
          <KPICard label="Silenced" value={kpis.ignored} sub="Muted or ignored" icon={<ShieldOff className="w-4 h-4" />} accent="text-slate-500" />
          <KPICard label="Active Incidents" value={kpis.incidents} sub="Open incident clusters" icon={<Zap className="w-4 h-4" />} accent={kpis.incidents > 0 ? "text-rose-600" : "text-brand-navy"} pulse={kpis.incidents > 0} />
        </div>

        {/* ── Main Two-Column Body ─────────────────────────────────────────── */}
        <div className="flex gap-5 items-start">

          {/* Alerts List */}
          <div className="flex-1 min-w-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate uppercase tracking-wider font-mono">
                {filtered.length} Alert{filtered.length !== 1 ? "s" : ""} {severityFilter !== "All" || statusFilter !== "All" ? "· Filtered" : ""}
              </p>
              <div className="flex gap-2">
                {["Critical", "High", "Warning"].map(sev => {
                  const count = filtered.filter(a => a.severity === sev && a.status === "Active").length;
                  if (!count) return null;
                  return (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev as AlertSeverity)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${SEVERITY_CFG[sev as AlertSeverity].chip}`}
                    >
                      {count} {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-10 text-center shadow-2xs">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No alerts match your filters</p>
                <p className="text-xs text-slate mt-1">Try widening the date range or clearing a filter</p>
              </div>
            ) : (
              <div>
                {filtered.map(alert => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    expanded={expandedId === alert.id}
                    onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Insights Panel ─────────────────────────────────────────────── */}
          <div className="w-72 shrink-0 space-y-4">

            {/* Active Incidents */}
            <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-500" /> Active Incidents
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-full">
                  {ACTIVE_INCIDENTS.length}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {ACTIVE_INCIDENTS.map(inc => (
                  <div key={inc.id} className={`p-3 rounded-xl border ${SEVERITY_CFG[inc.severity].row} bg-white`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold text-brand-navy leading-snug">{inc.title}</p>
                      <span className={`shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${INCIDENT_STATUS_CFG[inc.status].chip}`}>
                        {inc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate">
                      <SeverityChip severity={inc.severity} />
                      <span className="font-mono">{inc.alertCount} alert{inc.alertCount > 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{inc.startedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unresolved Critical */}
            <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-rose-50 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Unresolved Critical
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-full">
                  {unresolvedCritical.length}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {unresolvedCritical.length === 0 ? (
                  <p className="text-[11px] text-slate text-center py-2">All critical alerts resolved ✓</p>
                ) : unresolvedCritical.map(a => (
                  <div key={a.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-brand-navy leading-tight truncate">{a.title}</p>
                      <p className="text-[10px] text-slate mt-0.5">{a.createdAt} · {a.owner}</p>
                    </div>
                    <button
                      onClick={() => handleAction(a.id, "acknowledge")}
                      className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      Ack
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalation Queue */}
            <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-50">
                <span className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wide flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" /> Escalation Queue
                </span>
              </div>
              <div className="p-3 space-y-1.5">
                {ESCALATION_QUEUE.map(e => (
                  <div key={e.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_CFG[e.severity].dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-brand-navy truncate">{e.title}</p>
                      <p className={`text-[10px] mt-0.5 ${e.assignee === "Unassigned" ? "text-rose-400 font-bold" : "text-slate"}`}>{e.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Acknowledgements */}
            <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-50">
                <span className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Recent Acks
                </span>
              </div>
              <div className="p-3 space-y-1.5">
                {recentAcks.map(ack => (
                  <div key={ack.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-brand-navy leading-tight">{ack.alert}</p>
                      <p className="text-[10px] text-slate mt-0.5">{ack.by} · {ack.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

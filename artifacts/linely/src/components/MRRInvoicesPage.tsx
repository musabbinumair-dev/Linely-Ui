import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend
} from "recharts";
import {
  Search, Filter, Download, Clock, Calendar,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, AlertCircle, MoreVertical,
  Eye, Send, CreditCard, FileText, RefreshCcw,
  Building2, DollarSign, Users, Activity, ChevronRight,
  Banknote, ReceiptText, PackageCheck, Zap
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type PaymentStatus = "Paid" | "Unpaid" | "Overdue" | "Failed" | "Processing";
type ApprovalStatus = "Approved" | "Pending" | "Disputed" | "Waived";
type BillingPlan = "Enterprise" | "Professional" | "Starter";
type BillingCycle = "Monthly" | "Annual";

interface Invoice {
  id: string;
  number: string;
  branch: string;
  plan: BillingPlan;
  cycle: BillingCycle;
  amount: number;
  dueDate: string;
  dueDays: number; // negative = overdue
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  lastUpdate: string;
  isAutoRenew: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const INVOICES: Invoice[] = [
  { id: "inv-001", number: "INV-2024-0891", branch: "NYC Flagship",         plan: "Enterprise",   cycle: "Annual",  amount: 150000, dueDate: "Jul 15, 2024", dueDays: 6,   paymentStatus: "Unpaid",     approvalStatus: "Approved", lastUpdate: "2 hrs ago",  isAutoRenew: true  },
  { id: "inv-002", number: "INV-2024-0890", branch: "LA Hub",               plan: "Enterprise",   cycle: "Monthly", amount: 14000,  dueDate: "Jul 12, 2024", dueDays: 3,   paymentStatus: "Processing", approvalStatus: "Pending",  lastUpdate: "4 hrs ago",  isAutoRenew: true  },
  { id: "inv-003", number: "INV-2024-0889", branch: "London West End",      plan: "Enterprise",   cycle: "Monthly", amount: 11000,  dueDate: "Jul 01, 2024", dueDays: -8,  paymentStatus: "Overdue",    approvalStatus: "Approved", lastUpdate: "1 day ago",  isAutoRenew: false },
  { id: "inv-004", number: "INV-2024-0888", branch: "Chicago Loop",         plan: "Professional", cycle: "Monthly", amount: 4500,   dueDate: "Jul 10, 2024", dueDays: 1,   paymentStatus: "Paid",       approvalStatus: "Approved", lastUpdate: "3 hrs ago",  isAutoRenew: true  },
  { id: "inv-005", number: "INV-2024-0887", branch: "Seattle Waterfront",   plan: "Professional", cycle: "Monthly", amount: 4800,   dueDate: "Jul 10, 2024", dueDays: 1,   paymentStatus: "Paid",       approvalStatus: "Approved", lastUpdate: "5 hrs ago",  isAutoRenew: true  },
  { id: "inv-006", number: "INV-2024-0886", branch: "Toronto Center",       plan: "Starter",      cycle: "Monthly", amount: 1500,   dueDate: "Jun 30, 2024", dueDays: -9,  paymentStatus: "Failed",     approvalStatus: "Disputed", lastUpdate: "2 days ago", isAutoRenew: false },
  { id: "inv-007", number: "INV-2024-0885", branch: "Miami Beach",          plan: "Starter",      cycle: "Monthly", amount: 1200,   dueDate: "Jul 20, 2024", dueDays: 11,  paymentStatus: "Unpaid",     approvalStatus: "Pending",  lastUpdate: "1 day ago",  isAutoRenew: false },
  { id: "inv-008", number: "INV-2024-0884", branch: "Austin Tech Ridge",    plan: "Professional", cycle: "Annual",  amount: 48000,  dueDate: "Aug 01, 2024", dueDays: 23,  paymentStatus: "Unpaid",     approvalStatus: "Approved", lastUpdate: "3 days ago", isAutoRenew: true  },
  { id: "inv-009", number: "INV-2024-0883", branch: "Boston Downtown",      plan: "Enterprise",   cycle: "Monthly", amount: 12500,  dueDate: "Jun 28, 2024", dueDays: -11, paymentStatus: "Overdue",    approvalStatus: "Approved", lastUpdate: "4 days ago", isAutoRenew: true  },
  { id: "inv-010", number: "INV-2024-0882", branch: "Frankfurt Flughafen",  plan: "Enterprise",   cycle: "Annual",  amount: 132000, dueDate: "Sep 01, 2024", dueDays: 54,  paymentStatus: "Paid",       approvalStatus: "Approved", lastUpdate: "1 wk ago",   isAutoRenew: true  },
  { id: "inv-011", number: "INV-2024-0881", branch: "Houston Galleria",     plan: "Professional", cycle: "Monthly", amount: 0,      dueDate: "—",            dueDays: 0,   paymentStatus: "Paid",       approvalStatus: "Waived",   lastUpdate: "1 wk ago",   isAutoRenew: false },
  { id: "inv-012", number: "INV-2024-0880", branch: "Portland Outpost",     plan: "Starter",      cycle: "Monthly", amount: 1500,   dueDate: "Jul 25, 2024", dueDays: 16,  paymentStatus: "Unpaid",     approvalStatus: "Pending",  lastUpdate: "2 days ago", isAutoRenew: false },
];

const REVENUE_TREND = [
  { month: "Feb", mrr: 38400, arr_k: 460.8, subs: 7 },
  { month: "Mar", mrr: 41200, arr_k: 494.4, subs: 7 },
  { month: "Apr", mrr: 43500, arr_k: 522.0, subs: 8 },
  { month: "May", mrr: 47800, arr_k: 573.6, subs: 8 },
  { month: "Jun", mrr: 50200, arr_k: 602.4, subs: 9 },
  { month: "Jul", mrr: 49500, arr_k: 594.0, subs: 9 },
];

const BILLING_BREAKDOWN = [
  { name: "Enterprise", value: 37500, color: "#0D1A5E", percent: 75.7 },
  { name: "Professional", value: 9300,  color: "#00C3E3", percent: 18.8 },
  { name: "Starter",      value: 2700,  color: "#94A3B8", percent: 5.5  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<PaymentStatus, { chip: string; dot: string }> = {
  Paid:       { chip: "bg-emerald-50 text-emerald-700 border-emerald-200/60", dot: "bg-emerald-500" },
  Unpaid:     { chip: "bg-amber-50 text-amber-700 border-amber-200/60",       dot: "bg-amber-500" },
  Overdue:    { chip: "bg-rose-50 text-rose-700 border-rose-200/60",           dot: "bg-rose-500 animate-pulse" },
  Failed:     { chip: "bg-rose-100 text-rose-800 border-rose-300/60",          dot: "bg-rose-600 animate-pulse" },
  Processing: { chip: "bg-sky-50 text-sky-700 border-sky-200/60",              dot: "bg-sky-400 animate-pulse" },
};

const APPROVAL_CONFIG: Record<ApprovalStatus, { chip: string }> = {
  Approved: { chip: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  Pending:  { chip: "bg-amber-50 text-amber-700 border-amber-200/60" },
  Disputed: { chip: "bg-rose-50 text-rose-700 border-rose-200/60" },
  Waived:   { chip: "bg-slate-100 text-slate-500 border-slate-200/60" },
};

const PLAN_CONFIG: Record<BillingPlan, { chip: string }> = {
  Enterprise:   { chip: "bg-brand-navy text-brand-cyan border-brand-navy" },
  Professional: { chip: "bg-indigo-50 text-indigo-700 border-indigo-200/60" },
  Starter:      { chip: "bg-slate-100 text-slate-600 border-slate-200/60" },
};

function PaymentChip({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cfg.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ApprovalChip({ status }: { status: ApprovalStatus }) {
  const cfg = APPROVAL_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.chip}`}>
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: BillingPlan }) {
  const cfg = PLAN_CONFIG[plan];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${cfg.chip}`}>
      {plan}
    </span>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  valueColor?: string;
  trend?: string;
  trendUp?: boolean;
}

function KPICard({ label, value, sub, icon: Icon, iconColor, valueColor, trend, trendUp }: KPICardProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate uppercase tracking-wider leading-none">{label}</span>
        <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
      </div>
      <div className="mt-3">
        <p className={`text-xl font-black leading-none font-outfit ${valueColor ?? "text-brand-navy"}`}>{value}</p>
        <p className="text-[10px] text-slate font-semibold mt-1 font-mono">{sub}</p>
      </div>
      {trend && (
        <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
          <span className="text-slate font-semibold">vs last month</span>
          <span className={`font-bold flex items-center gap-0.5 ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
            {trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

interface InvoiceActionMenuProps {
  invoice: Invoice;
  onAction: (id: string, action: string) => void;
}

function InvoiceActionMenu({ invoice, onAction }: InvoiceActionMenuProps) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "View Invoice",    icon: Eye,          action: "view" },
    { label: "Send Reminder",   icon: Send,         action: "remind" },
    { label: "Mark as Paid",    icon: CheckCircle,  action: "paid" },
    { label: "Download PDF",    icon: FileText,     action: "download" },
    { label: "Export Report",   icon: Download,     action: "export" },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
        <MoreVertical className="w-3.5 h-3.5 text-slate" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-20 w-44 bg-white border border-slate-200/70 rounded-2xl shadow-xl overflow-hidden"
            >
              {actions.map(({ label, icon: Icon, action }) => (
                <button
                  key={action}
                  onClick={() => { onAction(invoice.id, action); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-navy transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#091244] text-white p-3.5 rounded-xl shadow-xl border border-white/10 text-xs font-rethink">
      <p className="font-bold border-b border-white/10 pb-1.5 mb-1.5">{label} Revenue</p>
      <div className="space-y-1">
        <p className="text-brand-cyan">MRR: <span className="font-mono font-bold">${payload[0]?.value?.toLocaleString()}</span></p>
        {payload[1] && <p className="text-emerald-400">ARR: <span className="font-mono font-bold">${payload[1]?.value?.toFixed(1)}K</span></p>}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface MRRInvoicesPageProps {
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function MRRInvoicesPage({ triggerToast }: MRRInvoicesPageProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<"All" | BillingCycle>("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [sortCol, setSortCol] = useState<"amount" | "dueDate" | "branch">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // KPI calculations
  const kpis = useMemo(() => {
    const mrr = 49500;
    const arr = mrr * 12;
    const activeSubs = invoices.filter(i => i.paymentStatus !== "Failed").length;
    const paid = invoices.filter(i => i.paymentStatus === "Paid").length;
    const unpaid = invoices.filter(i => i.paymentStatus === "Unpaid").length;
    const overdue = invoices.filter(i => i.paymentStatus === "Overdue" || i.paymentStatus === "Failed").length;
    return { mrr, arr, activeSubs, paid, unpaid, overdue };
  }, [invoices]);

  const branches = useMemo(() => ["All", ...Array.from(new Set(invoices.map(i => i.branch)))], [invoices]);

  const filtered = useMemo(() => {
    let list = invoices.filter(inv => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        inv.branch.toLowerCase().includes(q) ||
        inv.number.toLowerCase().includes(q) ||
        inv.plan.toLowerCase().includes(q);
      const matchCycle = cycleFilter === "All" || inv.cycle === cycleFilter;
      const matchBranch = branchFilter === "All" || inv.branch === branchFilter;
      const matchStatus = statusFilter === "All" || inv.paymentStatus === statusFilter;
      return matchSearch && matchCycle && matchBranch && matchStatus;
    });

    list = [...list].sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortCol === "amount") { av = a.amount; bv = b.amount; }
      else if (sortCol === "dueDate") { av = a.dueDays; bv = b.dueDays; }
      else if (sortCol === "branch") { av = a.branch; bv = b.branch; }
      return sortDir === "asc"
        ? (av < bv ? -1 : av > bv ? 1 : 0)
        : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return list;
  }, [invoices, search, cycleFilter, branchFilter, statusFilter, sortCol, sortDir]);

  const overdueList = useMemo(() => invoices.filter(i => i.paymentStatus === "Overdue"), [invoices]);
  const awaitingApproval = useMemo(() => invoices.filter(i => i.approvalStatus === "Pending"), [invoices]);
  const failedList = useMemo(() => invoices.filter(i => i.paymentStatus === "Failed"), [invoices]);
  const upcoming = useMemo(() => invoices.filter(i => i.dueDays > 0 && i.dueDays <= 14 && i.paymentStatus !== "Paid"), [invoices]);

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const handleInvoiceAction = (id: string, action: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const messages: Record<string, string> = {
      view:     `Viewing invoice ${inv.number} for ${inv.branch}.`,
      remind:   `Payment reminder sent to ${inv.branch} for ${inv.number}.`,
      paid:     `Invoice ${inv.number} marked as paid. Ledger updated.`,
      download: `Invoice ${inv.number} downloaded as PDF.`,
      export:   `Invoice report for ${inv.branch} exported successfully.`,
    };
    const types: Record<string, "success" | "info" | "warning"> = {
      view: "info", remind: "info", paid: "success", download: "info", export: "success"
    };

    if (action === "paid") {
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, paymentStatus: "Paid" as PaymentStatus, approvalStatus: "Approved" as ApprovalStatus } : i));
    }

    triggerToast(messages[action] || "Action completed.", types[action] || "info");
  };

  const handleExport = () => {
    triggerToast("MRR & Invoice report exported. CSV file saved to corporate folder.", "success");
  };

  const SortBtn = ({ col, label }: { col: typeof sortCol; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className={`flex items-center gap-0.5 hover:text-brand-navy transition-colors cursor-pointer ${sortCol === col ? "text-brand-navy font-extrabold" : ""}`}
    >
      {label}
      {sortCol === col && <span className="text-[8px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-5 min-h-full">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate uppercase tracking-widest font-mono">Finance & Workflow</span>
              <ChevronRight className="w-3 h-3 text-slate/40" />
              <span className="text-[10px] font-bold text-brand-ocean uppercase tracking-widest font-mono">MRR & Invoices</span>
            </div>
            <h2 className="font-rethink text-xl font-extrabold text-brand-navy leading-none">Revenue & Billing</h2>
            <p className="text-xs text-slate mt-1">Monthly recurring revenue, invoice management, and billing health across all branches</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200/60 rounded-full text-[11px] font-medium outline-none focus:border-brand-navy w-44 transition-all"
              />
            </div>

            {/* Billing cycle */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <RefreshCcw className="w-3 h-3 text-slate" />
              <select value={cycleFilter} onChange={e => setCycleFilter(e.target.value as "All" | BillingCycle)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Cycles</option>
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            {/* Branch */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Building2 className="w-3 h-3 text-slate" />
              <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1 max-w-28 truncate">
                {branches.map(b => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Filter className="w-3 h-3 text-slate" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "All" | PaymentStatus)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                <option value="Failed">Failed</option>
                <option value="Processing">Processing</option>
              </select>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ── KPI Strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KPICard label="MRR" value={`$${(kpis.mrr / 1000).toFixed(1)}K`} sub="Current month" icon={TrendingUp} iconColor="text-emerald-500" valueColor="text-emerald-700" trend="+14.2%" trendUp={true} />
          <KPICard label="ARR Run-Rate" value={`$${(kpis.arr / 1000).toFixed(0)}K`} sub="Annualized" icon={Banknote} iconColor="text-brand-ocean" trend="+14.2%" trendUp={true} />
          <KPICard label="Active Subs" value={`${kpis.activeSubs}`} sub="Active plans" icon={PackageCheck} iconColor="text-indigo-500" trend="+1 this mo" trendUp={true} />
          <KPICard label="Paid Invoices" value={`${kpis.paid}`} sub="This period" icon={CheckCircle} iconColor="text-emerald-500" valueColor="text-emerald-700" />
          <KPICard label="Unpaid" value={`${kpis.unpaid}`} sub="Awaiting payment" icon={ReceiptText} iconColor="text-amber-500" valueColor={kpis.unpaid > 0 ? "text-amber-600" : "text-brand-navy"} />
          <KPICard label="Overdue" value={`${kpis.overdue}`} sub="Past due date" icon={AlertCircle} iconColor="text-rose-500" valueColor={kpis.overdue > 0 ? "text-rose-600" : "text-brand-navy"} />
        </div>

        {/* ── Charts Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink">Revenue Trend</h3>
                <p className="text-xs text-slate mt-0.5">MRR & ARR growth over the last 6 months</p>
              </div>
              <div className="flex gap-3 text-[10px] font-mono font-bold text-slate">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-brand-navy rounded-full inline-block" /> MRR
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-brand-cyan rounded-full inline-block" /> ARR
                </span>
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D1A5E" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0D1A5E" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C3E3" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#00C3E3" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F6" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="mrr" stroke="#0D1A5E" strokeWidth={2.5} fillOpacity={1} fill="url(#mrrGrad)" />
                  <Area type="monotone" dataKey="arr_k" stroke="#00C3E3" strokeWidth={1.5} fillOpacity={1} fill="url(#arrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate font-mono mt-3 pt-3 border-t border-slate-50">
              Revenue synced daily from billing ledger · Next billing cycle: Aug 1, 2024
            </p>
          </div>

          {/* Billing Status Breakdown Chart */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink">Plan Breakdown</h3>
              <p className="text-xs text-slate mt-0.5">MRR split by subscription tier</p>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BILLING_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="#94A3B8" fontSize={9} hide />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={10} width={72} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "MRR"]}
                    contentStyle={{ background: "#091244", border: "none", borderRadius: 10, color: "#fff", fontSize: 11 }}
                    labelStyle={{ color: "#00C3E3", fontWeight: 700 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {BILLING_BREAKDOWN.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-50">
              {BILLING_BREAKDOWN.map(item => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-navy">${item.value.toLocaleString()}</span>
                    <span className="font-mono text-slate text-[10px]">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Invoice Table + Side Panel ───────────────────────────────────── */}
        <div className="flex gap-5 min-h-0">

          {/* Invoice Table */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-2xs overflow-hidden">

              {/* Table header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                  Invoice Ledger <span className="font-mono text-slate ml-1 normal-case text-[10px]">({filtered.length} records)</span>
                </h3>
                <div className="flex gap-1.5">
                  {(["All", "Paid", "Unpaid", "Overdue"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as "All" | PaymentStatus)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        statusFilter === s
                          ? "bg-brand-navy border-brand-navy text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column labels */}
              <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] gap-3 px-5 py-2.5 text-[9px] font-extrabold text-slate uppercase tracking-widest border-b border-slate-50">
                <span>Invoice #</span>
                <SortBtn col="branch" label="Branch" />
                <span>Plan</span>
                <SortBtn col="amount" label="Amount" />
                <SortBtn col="dueDate" label="Due Date" />
                <span>Payment</span>
                <span>Approval</span>
                <span>Updated</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <div className="p-10 text-center">
                      <ReceiptText className="w-8 h-8 text-slate/30 mx-auto mb-2" />
                      <p className="text-sm font-bold text-brand-navy font-rethink">No invoices found</p>
                      <p className="text-xs text-slate mt-1">Adjust your filters to see results.</p>
                    </div>
                  ) : filtered.map(inv => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`grid grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] gap-3 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors ${
                        inv.paymentStatus === "Overdue" || inv.paymentStatus === "Failed"
                          ? "border-l-2 border-rose-400 bg-rose-50/10"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="text-[11px] font-bold text-brand-navy font-mono">{inv.number}</p>
                        <p className="text-[9px] text-slate font-mono mt-0.5">{inv.cycle}</p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 truncate">{inv.branch}</p>
                      <PlanBadge plan={inv.plan} />
                      <p className="text-[11px] font-black text-brand-navy font-outfit">
                        {inv.amount === 0 ? "—" : `$${inv.amount.toLocaleString()}`}
                      </p>
                      <div>
                        <p className={`text-[10px] font-bold font-mono ${inv.dueDays < 0 ? "text-rose-600" : inv.dueDays <= 7 ? "text-amber-600" : "text-slate"}`}>
                          {inv.dueDate === "—" ? "—" : inv.dueDays < 0 ? `${Math.abs(inv.dueDays)}d overdue` : inv.dueDate}
                        </p>
                      </div>
                      <PaymentChip status={inv.paymentStatus} />
                      <ApprovalChip status={inv.approvalStatus} />
                      <p className="text-[10px] text-slate font-mono">{inv.lastUpdate}</p>
                      <InvoiceActionMenu invoice={inv} onAction={handleInvoiceAction} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Table footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate font-mono">
                <span>Showing {filtered.length} of {invoices.length} invoices</span>
                <span className="font-bold text-brand-navy">
                  Total: ${filtered.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── Side Insights Panel ── */}
          <div className="w-64 xl:w-72 shrink-0 space-y-4">

            {/* Overdue Invoices */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Overdue
                </h4>
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200/40">
                  {overdueList.length}
                </span>
              </div>
              <div className="space-y-2">
                {overdueList.length === 0
                  ? <p className="text-[11px] text-slate py-2">No overdue invoices.</p>
                  : overdueList.map(inv => (
                    <div key={inv.id} className="p-2.5 bg-rose-50/60 border border-rose-200/40 rounded-xl">
                      <p className="text-[11px] font-bold text-brand-navy truncate">{inv.branch}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-mono font-bold text-rose-600">${inv.amount.toLocaleString()}</p>
                        <button
                          onClick={() => handleInvoiceAction(inv.id, "remind")}
                          className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Remind
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Awaiting Approval */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting Approval
                </h4>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/40">
                  {awaitingApproval.length}
                </span>
              </div>
              <div className="space-y-2">
                {awaitingApproval.length === 0
                  ? <p className="text-[11px] text-slate py-2">All invoices approved.</p>
                  : awaitingApproval.map(inv => (
                    <div key={inv.id} className="p-2.5 bg-amber-50/50 border border-amber-200/40 rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-brand-navy truncate">{inv.number}</p>
                        <p className="text-[10px] text-slate font-mono">{inv.branch}</p>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-brand-navy shrink-0">${inv.amount.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Failed Payments */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed Payments
                </h4>
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200/40">
                  {failedList.length}
                </span>
              </div>
              <div className="space-y-2">
                {failedList.length === 0
                  ? <p className="text-[11px] text-slate py-2">No failed payments.</p>
                  : failedList.map(inv => (
                    <div key={inv.id} className="p-2.5 bg-rose-50/40 border border-rose-200/40 rounded-xl">
                      <p className="text-[11px] font-bold text-brand-navy truncate">{inv.branch}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] font-mono font-bold text-rose-600">${inv.amount.toLocaleString()}</p>
                        <button
                          onClick={() => handleInvoiceAction(inv.id, "paid")}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-cyan" /> Upcoming Renewals
                </h4>
                <span className="text-[10px] font-mono font-bold bg-cyan-50 text-brand-ocean px-2 py-0.5 rounded border border-cyan-200/40">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-2">
                {upcoming.length === 0
                  ? <p className="text-[11px] text-slate py-2">No renewals in next 14 days.</p>
                  : upcoming.map(inv => (
                    <div key={inv.id} className="p-2.5 bg-sky-50/40 border border-sky-200/40 rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-brand-navy truncate">{inv.branch}</p>
                        <p className="text-[10px] text-slate font-mono mt-0.5">Due in {inv.dueDays} days</p>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-emerald-700 shrink-0">${inv.amount.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

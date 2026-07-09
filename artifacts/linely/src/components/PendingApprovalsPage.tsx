import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Clock, ChevronDown, MoreVertical,
  Check, X, AlertTriangle, ArrowUpRight, Flag,
  User, Building2, Calendar, Timer,
  CheckCircle, XCircle, ArrowUp, Zap,
  Eye, Bell, MessageSquare, GitBranch, DollarSign,
  Users, ShieldCheck, Inbox, TrendingUp, ChevronRight
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type Priority = "Urgent" | "High" | "Normal" | "Low";
type ApprovalStatus = "Pending" | "Under Review" | "Escalated" | "Changes Requested";
type RequestType =
  | "Plan Upgrade"
  | "Branch Registration"
  | "Budget Request"
  | "Policy Exception"
  | "Staff Addition"
  | "System Access";
type QuickAction = "approve" | "reject" | "changes" | "escalate" | "view";
type DateRange = "Today" | "Last 7 Days" | "Last 30 Days" | "This Quarter";

interface ApprovalItem {
  id: string;
  type: RequestType;
  branch: string;
  requester: string;
  requesterRole: string;
  impact: string;
  priority: Priority;
  submittedAt: string;
  submittedDaysAgo: number; // 0 = today, 1 = yesterday, etc.
  dueAt: string;
  dueHours: number; // for sorting/SLA calc
  isOverdue: boolean;
  status: ApprovalStatus;
  assignee: string;
  notes: string;
}

interface RecentAction {
  id: string;
  action: "Approved" | "Rejected" | "Escalated" | "Changes Requested";
  item: string;
  by: string;
  at: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: "apr-001", type: "Plan Upgrade", branch: "NYC Flagship",
    requester: "Arthur Dent", requesterRole: "Branch Manager",
    impact: "$12,500/mo", priority: "Urgent",
    submittedAt: "25 mins ago", submittedDaysAgo: 0,
    dueAt: "Today, 5:00 PM", dueHours: 3,
    isOverdue: false, status: "Pending", assignee: "Sébastien Chen",
    notes: "Branch exceeding Pro limits by 40%. SLA pressure mounting."
  },
  {
    id: "apr-002", type: "Budget Request", branch: "LA Hub",
    requester: "Tony Stark", requesterRole: "Senior Manager",
    impact: "$8,200 one-time", priority: "Urgent",
    submittedAt: "1 hr ago", submittedDaysAgo: 0,
    dueAt: "Today, 3:00 PM", dueHours: 1,
    isOverdue: false, status: "Escalated", assignee: "Sébastien Chen",
    notes: "Emergency HVAC infrastructure repair. Operations at risk."
  },
  {
    id: "apr-003", type: "Branch Registration", branch: "Boston Downtown",
    requester: "Sarah Connor", requesterRole: "Regional Lead",
    impact: "New branch", priority: "High",
    submittedAt: "2 hrs ago", submittedDaysAgo: 0,
    dueAt: "Tomorrow, 12:00 PM", dueHours: 22,
    isOverdue: false, status: "Under Review", assignee: "Unassigned",
    notes: "Enterprise plan onboarding request. Documents submitted."
  },
  {
    id: "apr-004", type: "Staff Addition", branch: "Chicago Loop",
    requester: "Peter Gibbons", requesterRole: "Branch Manager",
    impact: "6 new operators", priority: "High",
    submittedAt: "4 hrs ago", submittedDaysAgo: 0,
    dueAt: "Tomorrow, 9:00 AM", dueHours: 18,
    isOverdue: false, status: "Pending", assignee: "Unassigned",
    notes: "Peak season staffing. HR pre-approved headcount."
  },
  {
    id: "apr-005", type: "Policy Exception", branch: "Seattle Waterfront",
    requester: "Bruce Wayne", requesterRole: "Branch Manager",
    impact: "SLA override 30 days", priority: "Normal",
    submittedAt: "6 hrs ago", submittedDaysAgo: 0,
    dueAt: "Tomorrow, 5:00 PM", dueHours: 28,
    isOverdue: false, status: "Under Review", assignee: "Sébastien Chen",
    notes: "Temporary SLA relaxation during renovation period."
  },
  {
    id: "apr-006", type: "System Access", branch: "London West End",
    requester: "Albert Wesker", requesterRole: "IT Lead",
    impact: "Admin portal access", priority: "Normal",
    submittedAt: "8 hrs ago", submittedDaysAgo: 0,
    dueAt: "Friday, 5:00 PM", dueHours: 52,
    isOverdue: false, status: "Pending", assignee: "Unassigned",
    notes: "New IT role requires elevated permissions for audit trail."
  },
  {
    id: "apr-007", type: "Budget Request", branch: "Miami Beach",
    requester: "Gavin Belson", requesterRole: "Branch Manager",
    impact: "$3,400 quarterly", priority: "Low",
    submittedAt: "1 day ago", submittedDaysAgo: 1,
    dueAt: "Next Monday", dueHours: 72,
    isOverdue: false, status: "Changes Requested", assignee: "Sébastien Chen",
    notes: "Marketing collateral spend. Finance needs revised breakdown."
  },
  {
    id: "apr-008", type: "Plan Upgrade", branch: "Toronto Center",
    requester: "Sol Roth", requesterRole: "Branch Manager",
    impact: "$4,500/mo", priority: "High",
    submittedAt: "1 day ago", submittedDaysAgo: 1,
    dueAt: "Yesterday", dueHours: -12,
    isOverdue: true, status: "Pending", assignee: "Unassigned",
    notes: "Trial expiry imminent. Upgrade required to maintain service."
  },
  {
    id: "apr-009", type: "Staff Addition", branch: "Austin Tech Ridge",
    requester: "Ted Crisp", requesterRole: "Branch Manager",
    impact: "3 operators", priority: "Normal",
    submittedAt: "2 days ago", submittedDaysAgo: 2,
    dueAt: "Yesterday", dueHours: -36,
    isOverdue: true, status: "Pending", assignee: "Unassigned",
    notes: "Backfill positions after two staff departures last quarter."
  },
  {
    id: "apr-010", type: "Policy Exception", branch: "Frankfurt Flughafen",
    requester: "Jack Donaghy", requesterRole: "International Lead",
    impact: "Custom SLA contract", priority: "High",
    submittedAt: "3 days ago", submittedDaysAgo: 3,
    dueAt: "2 days ago", dueHours: -48,
    isOverdue: true, status: "Escalated", assignee: "Sébastien Chen",
    notes: "EU compliance requirement. Legal sign-off pending."
  }
];

const RECENT_ACTIONS: RecentAction[] = [
  { id: "ra-001", action: "Approved", item: "Houston Galleria — Plan Downgrade", by: "Sébastien Chen", at: "12 mins ago" },
  { id: "ra-002", action: "Rejected", item: "Portland Branch — Budget Q4", by: "Sébastien Chen", at: "1 hr ago" },
  { id: "ra-003", action: "Escalated", item: "Denver Hub — System Access", by: "System Monitor", at: "3 hrs ago" },
  { id: "ra-004", action: "Changes Requested", item: "Miami Beach — Marketing Spend", by: "Sébastien Chen", at: "5 hrs ago" },
];

// ─── Helpers / Sub-components ────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; chip: string; row: string }> = {
  Urgent: {
    label: "Urgent",
    dot: "bg-rose-500 animate-pulse",
    chip: "bg-rose-50 text-rose-700 border-rose-200/60",
    row: "border-l-2 border-rose-400 bg-rose-50/20"
  },
  High: {
    label: "High",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 border-amber-200/60",
    row: "border-l-2 border-amber-400 bg-amber-50/10"
  },
  Normal: {
    label: "Normal",
    dot: "bg-sky-400",
    chip: "bg-sky-50 text-sky-700 border-sky-200/60",
    row: "border-l-2 border-sky-300"
  },
  Low: {
    label: "Low",
    dot: "bg-slate-300",
    chip: "bg-slate-50 text-slate-500 border-slate-200/60",
    row: "border-l-2 border-slate-200"
  }
};

const STATUS_CONFIG: Record<ApprovalStatus, { chip: string; label: string }> = {
  "Pending":            { chip: "bg-amber-50 text-amber-700 border-amber-200/60", label: "Pending" },
  "Under Review":       { chip: "bg-brand-ocean/10 text-brand-ocean border-brand-ocean/20", label: "Under Review" },
  "Escalated":          { chip: "bg-orange-50 text-orange-700 border-orange-200/60", label: "Escalated" },
  "Changes Requested":  { chip: "bg-purple-50 text-purple-700 border-purple-200/60", label: "Changes Req." }
};

const TYPE_CONFIG: Record<RequestType, { icon: React.ElementType; bg: string; color: string }> = {
  "Plan Upgrade":        { icon: TrendingUp,   bg: "bg-indigo-50",  color: "text-indigo-600" },
  "Branch Registration": { icon: Building2,    bg: "bg-emerald-50", color: "text-emerald-600" },
  "Budget Request":      { icon: DollarSign,   bg: "bg-amber-50",   color: "text-amber-600" },
  "Policy Exception":    { icon: ShieldCheck,  bg: "bg-purple-50",  color: "text-purple-600" },
  "Staff Addition":      { icon: Users,        bg: "bg-cyan-50",    color: "text-cyan-600" },
  "System Access":       { icon: GitBranch,    bg: "bg-rose-50",    color: "text-rose-600" }
};

function PriorityChip({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cfg.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusChip({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.chip}`}>
      {cfg.label}
    </span>
  );
}

interface ActionMenuProps {
  item: ApprovalItem;
  onAction: (id: string, action: "approve" | "reject" | "changes" | "escalate" | "view") => void;
}

function ActionMenu({ item, onAction }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
      >
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
              {[
                { label: "View Details",      icon: Eye,            action: "view",     cls: "text-slate-700" },
                { label: "Approve",           icon: CheckCircle,    action: "approve",  cls: "text-emerald-600" },
                { label: "Reject",            icon: XCircle,        action: "reject",   cls: "text-rose-600" },
                { label: "Request Changes",   icon: MessageSquare,  action: "changes",  cls: "text-purple-600" },
                { label: "Escalate",          icon: ArrowUp,        action: "escalate", cls: "text-orange-600" },
              ].map(({ label, icon: Icon, action, cls }) => (
                <button
                  key={action}
                  onClick={() => { onAction(item.id, action as QuickAction); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${cls}`}
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

interface KPICardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  valueColor?: string;
  trend?: string;
  trendUp?: boolean;
}

function KPICard({ label, value, sub, icon: Icon, iconColor, valueColor, trend, trendUp }: KPICardProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate uppercase tracking-wider leading-none">{label}</span>
        <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black leading-none font-outfit ${valueColor ?? "text-brand-navy"}`}>{value}</p>
        <p className="text-[10px] text-slate font-semibold mt-1 font-mono">{sub}</p>
      </div>
      {trend && (
        <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
          <span className="text-slate font-semibold">{sub}</span>
          <span className={`font-bold flex items-center gap-0.5 ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
            {trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5 rotate-180" />}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface PendingApprovalsPageProps {
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function PendingApprovalsPage({ triggerToast }: PendingApprovalsPageProps) {
  const [items, setItems] = useState<ApprovalItem[]>(MOCK_APPROVALS);
  const [recentActions, setRecentActions] = useState<RecentAction[]>(RECENT_ACTIONS);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ApprovalStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [dateRange, setDateRange] = useState<DateRange>("Today");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = items.length;
    const urgent = items.filter(i => i.priority === "Urgent").length;
    const overdue = items.filter(i => i.isOverdue).length;
    const escalated = items.filter(i => i.status === "Escalated").length;
    const slaRisk = items.filter(i => i.dueHours <= 4 && !i.isOverdue).length;
    return { total, urgent, overdue, escalated, slaRisk };
  }, [items]);

  // Date range → max submittedDaysAgo threshold
  const maxDaysAgo: number = useMemo(() => {
    if (dateRange === "Today") return 0;
    if (dateRange === "Last 7 Days") return 7;
    if (dateRange === "Last 30 Days") return 30;
    return Infinity; // This Quarter
  }, [dateRange]);

  // Filtered list
  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        item.branch.toLowerCase().includes(q) ||
        item.requester.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);
      const matchBranch = branchFilter === "All" || item.branch === branchFilter;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchPriority = priorityFilter === "All" || item.priority === priorityFilter;
      const matchDate = item.submittedDaysAgo <= maxDaysAgo;
      return matchSearch && matchBranch && matchStatus && matchPriority && matchDate;
    });
  }, [items, search, branchFilter, statusFilter, priorityFilter, maxDaysAgo]);

  const urgentItems = useMemo(() => items.filter(i => i.priority === "Urgent"), [items]);
  const overdueItems = useMemo(() => items.filter(i => i.isOverdue), [items]);
  const escalatedItems = useMemo(() => items.filter(i => i.status === "Escalated"), [items]);

  const branches = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.branch)))], [items]);

  const handleAction = (id: string, action: "approve" | "reject" | "changes" | "escalate" | "view") => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (action === "view") {
      setExpandedId(expandedId === id ? null : id);
      return;
    }

    const actionLabels = {
      approve: "Approved",
      reject: "Rejected",
      changes: "Changes Requested",
      escalate: "Escalated"
    } as const;

    const toastMessages = {
      approve: `Approved: ${item.type} — ${item.branch}. Provisioning initiated.`,
      reject: `Rejected: ${item.type} — ${item.branch}. Requester notified.`,
      changes: `Changes requested for ${item.branch}. Notification sent.`,
      escalate: `Escalated to global admin: ${item.branch} — ${item.type}.`
    };

    const toastTypes = {
      approve: "success",
      reject: "info",
      changes: "warning",
      escalate: "warning"
    } as const;

    if (action === "approve" || action === "reject") {
      setItems(prev => prev.filter(i => i.id !== id));
    } else if (action === "escalate") {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "Escalated" } : i));
    } else if (action === "changes") {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "Changes Requested" } : i));
    }

    setRecentActions(prev => [{
      id: `ra-${Date.now()}`,
      action: actionLabels[action],
      item: `${item.branch} — ${item.type}`,
      by: "Sébastien Chen",
      at: "Just now"
    }, ...prev.slice(0, 5)]);

    triggerToast(toastMessages[action], toastTypes[action]);
  };

  const handleBulkApprove = () => {
    const normal = items.filter(i => i.priority === "Normal" || i.priority === "Low");
    if (normal.length === 0) { triggerToast("No low-priority items to batch approve.", "info"); return; }
    setItems(prev => prev.filter(i => i.priority !== "Normal" && i.priority !== "Low"));
    triggerToast(`Batch approved ${normal.length} standard-priority requests.`, "success");
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="p-6 space-y-5 min-h-full">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate uppercase tracking-widest font-mono">Finance & Workflow</span>
              <ChevronRight className="w-3 h-3 text-slate/40" />
              <span className="text-[10px] font-bold text-brand-ocean uppercase tracking-widest font-mono">Pending Approvals</span>
            </div>
            <h2 className="font-rethink text-xl font-extrabold text-brand-navy leading-none">Approval Queue</h2>
            <p className="text-xs text-slate mt-1">Review, action, and escalate cross-branch requests across your corporate portfolio</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200/60 rounded-full text-[11px] font-medium outline-none focus:border-brand-navy w-44 transition-all"
              />
            </div>

            {/* Branch filter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Building2 className="w-3 h-3 text-slate" />
              <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                {branches.map(b => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Filter className="w-3 h-3 text-slate" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "All" | ApprovalStatus)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
                <option value="Changes Requested">Changes Requested</option>
              </select>
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/60 rounded-full text-[11px] font-bold text-slate-700 hover:border-slate-300 cursor-pointer">
              <Flag className="w-3 h-3 text-slate" />
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as "All" | Priority)} className="bg-transparent border-none outline-none text-[11px] font-bold cursor-pointer pr-1">
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
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

            {/* Action button */}
            <button
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Batch Approve</span>
            </button>
          </div>
        </div>

        {/* ── KPI Strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KPICard label="Total Pending" value={kpis.total} sub="Awaiting action" icon={Inbox} iconColor="text-brand-ocean" trend="+3 vs yesterday" trendUp={false} />
          <KPICard label="Urgent" value={kpis.urgent} sub="Priority 1 items" icon={Zap} iconColor="text-rose-500" valueColor={kpis.urgent > 0 ? "text-rose-600" : "text-brand-navy"} />
          <KPICard label="Approved Today" value={4} sub="Processed today" icon={CheckCircle} iconColor="text-emerald-500" valueColor="text-emerald-600" trend="+4 vs avg" trendUp={true} />
          <KPICard label="Rejected Today" value={1} sub="Declined today" icon={XCircle} iconColor="text-rose-400" />
          <KPICard label="Avg Handle Time" value="1.8h" sub="Per approval" icon={Timer} iconColor="text-brand-cyan" trend="-12% vs last wk" trendUp={true} />
          <KPICard label="SLA Risk" value={kpis.slaRisk} sub="Due within 4 hrs" icon={AlertTriangle} iconColor="text-amber-500" valueColor={kpis.slaRisk > 0 ? "text-amber-600" : "text-brand-navy"} />
        </div>

        {/* ── Main Content: Worklist + Side Panel ─────────────────────────── */}
        <div className="flex gap-5 min-h-0">

          {/* Worklist — 2/3 */}
          <div className="flex-1 min-w-0 space-y-2">

            {/* Worklist header */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                Active Requests <span className="font-mono text-slate ml-1 normal-case text-[10px]">({filtered.length} shown)</span>
              </p>
              {(kpis.urgent > 0 || kpis.overdue > 0) && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full">
                  {kpis.urgent} urgent · {kpis.overdue} overdue
                </span>
              )}
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-[24px_1.6fr_1fr_0.9fr_0.8fr_0.8fr_0.9fr_56px] gap-3 px-4 py-2 text-[9px] font-extrabold text-slate uppercase tracking-widest">
              <span />
              <span>Request</span>
              <span>Branch / Requester</span>
              <span>Impact</span>
              <span>Priority</span>
              <span>Due</span>
              <span>Status</span>
              <span />
            </div>

            {/* Approval rows */}
            <AnimatePresence initial={false}>
              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white border border-slate-200/60 rounded-2xl p-10 text-center"
                >
                  <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-extrabold text-brand-navy font-rethink">All clear</p>
                  <p className="text-xs text-slate mt-1">No approval requests match your filters.</p>
                </motion.div>
              )}

              {filtered.map((item) => {
                const typeCfg = TYPE_CONFIG[item.type];
                const priCfg = PRIORITY_CONFIG[item.priority];
                const TypeIcon = typeCfg.icon;
                const isExpanded = expandedId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className={`bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all ${priCfg.row}`}
                  >
                    {/* Main row */}
                    <div
                      className="grid grid-cols-[24px_1.6fr_1fr_0.9fr_0.8fr_0.8fr_0.9fr_56px] gap-3 px-4 py-3.5 items-center cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      {/* Type icon */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.bg}`}>
                        <TypeIcon className={`w-3.5 h-3.5 ${typeCfg.color}`} />
                      </div>

                      {/* Type & ID */}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-brand-navy truncate font-rethink">{item.type}</p>
                        <p className="text-[10px] text-slate font-mono mt-0.5">{item.id}</p>
                      </div>

                      {/* Branch / Requester */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-navy truncate">{item.branch}</p>
                        <p className="text-[10px] text-slate mt-0.5 truncate">{item.requester} · {item.requesterRole}</p>
                      </div>

                      {/* Impact */}
                      <p className="text-xs font-bold text-brand-navy font-mono">{item.impact}</p>

                      {/* Priority chip */}
                      <PriorityChip priority={item.priority} />

                      {/* Due */}
                      <div>
                        <p className={`text-[10px] font-bold font-mono ${item.isOverdue ? "text-rose-600" : item.dueHours <= 4 ? "text-amber-600" : "text-slate"}`}>
                          {item.isOverdue ? "⚠ Overdue" : item.dueAt}
                        </p>
                        {item.isOverdue && <p className="text-[9px] text-rose-400 font-mono">{Math.abs(item.dueHours)}h past due</p>}
                      </div>

                      {/* Status */}
                      <StatusChip status={item.status} />

                      {/* Actions */}
                      <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleAction(item.id, "approve")}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-all cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <ActionMenu item={item} onAction={handleAction} />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-[9px] font-extrabold text-slate uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{item.notes}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-extrabold text-slate uppercase tracking-wider mb-1">Assignment</p>
                                <p className="text-xs font-bold text-brand-navy">{item.assignee}</p>
                                <p className="text-[10px] text-slate font-mono mt-0.5">Submitted {item.submittedAt}</p>
                              </div>
                              <div className="flex items-end gap-2">
                                <button
                                  onClick={() => handleAction(item.id, "approve")}
                                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleAction(item.id, "reject")}
                                  className="flex-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                                <button
                                  onClick={() => handleAction(item.id, "escalate")}
                                  className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Side Insights Panel ── */}
          <div className="w-72 xl:w-80 shrink-0 space-y-4">

            {/* Urgent Approvals */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-500" /> Urgent
                </h4>
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200/40">
                  {urgentItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {urgentItems.length === 0
                  ? <p className="text-[11px] text-slate py-2">No urgent items — queue clear.</p>
                  : urgentItems.map(item => (
                    <div key={item.id} className="p-2.5 bg-rose-50/60 border border-rose-200/40 rounded-xl">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-brand-navy leading-tight truncate">{item.type}</p>
                          <p className="text-[10px] text-slate font-mono mt-0.5">{item.branch}</p>
                        </div>
                        <button
                          onClick={() => handleAction(item.id, "approve")}
                          className="shrink-0 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                      <p className="text-[10px] text-rose-500 font-mono mt-1.5">Due: {item.dueAt}</p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Overdue Items */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Overdue
                </h4>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/40">
                  {overdueItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {overdueItems.length === 0
                  ? <p className="text-[11px] text-slate py-2">No overdue items.</p>
                  : overdueItems.map(item => (
                    <div key={item.id} className="p-2.5 bg-amber-50/50 border border-amber-200/40 rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-brand-navy truncate">{item.branch}</p>
                        <p className="text-[10px] text-rose-500 font-mono mt-0.5">{Math.abs(item.dueHours)}h overdue</p>
                      </div>
                      <button
                        onClick={() => handleAction(item.id, "escalate")}
                        className="shrink-0 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Escalate
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Escalations */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-orange-500" /> Escalations
                </h4>
                <span className="text-[10px] font-mono font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200/40">
                  {escalatedItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {escalatedItems.length === 0
                  ? <p className="text-[11px] text-slate py-2">No active escalations.</p>
                  : escalatedItems.map(item => (
                    <div key={item.id} className="p-2.5 bg-orange-50/40 border border-orange-200/40 rounded-xl">
                      <p className="text-[11px] font-bold text-brand-navy truncate">{item.type}</p>
                      <p className="text-[10px] text-slate font-mono mt-0.5">{item.branch} · {item.requester}</p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent Actions */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-2xs">
              <h4 className="text-[11px] font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5 mb-3">
                <User className="w-3.5 h-3.5 text-brand-ocean" /> Recent Actions
              </h4>
              <div className="space-y-2.5">
                {recentActions.map(ra => {
                  const cfg = {
                    Approved:           "bg-emerald-50 text-emerald-700 border-emerald-200/40",
                    Rejected:           "bg-rose-50 text-rose-700 border-rose-200/40",
                    Escalated:          "bg-orange-50 text-orange-700 border-orange-200/40",
                    "Changes Requested":"bg-purple-50 text-purple-700 border-purple-200/40"
                  }[ra.action];
                  return (
                    <div key={ra.id} className="flex gap-2.5 text-xs">
                      <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold border whitespace-nowrap ${cfg}`}>
                        {ra.action}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-navy text-[11px] truncate leading-tight">{ra.item}</p>
                        <p className="text-[10px] text-slate font-mono mt-0.5">{ra.by} · {ra.at}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

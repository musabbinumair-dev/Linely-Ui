import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { 
  Users, 
  Activity, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Bell, 
  CheckCircle, 
  ShieldAlert, 
  Plus, 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  Clock, 
  Briefcase, 
  ArrowUpRight, 
  Sparkles, 
  X, 
  ChevronLeft, 
  Download, 
  UserCheck, 
  MapPin, 
  Filter, 
  Check, 
  Trash2, 
  Sliders, 
  AlertTriangle 
} from "lucide-react";
import { StatusPill, PlanBadge } from "./GlobalUI";
import AdminSidebar from "./AdminSidebar";
import PendingApprovalsPage from "./PendingApprovalsPage";
import MRRInvoicesPage from "./MRRInvoicesPage";
import SecurityAlertsPage from "./SecurityAlertsPage";
import GlobalSettingsPage from "./GlobalSettingsPage";

// Type definitions
interface Branch {
  id: string;
  name: string;
  region: "East" | "West" | "Central" | "International";
  status: "Active" | "Maintenance" | "Trial" | "Suspended";
  plan: "Enterprise" | "Professional" | "Starter";
  activeTickets: number;
  slaScore: number; // Percentage
  monthlyValue: number; // Revenue in USD
  managerName: string;
  managerEmail: string;
  alertsCount: number;
  trend: number[]; // 5 sparkline points
}

interface ApprovalRequest {
  id: string;
  branchName: string;
  requestedPlan: "Enterprise" | "Professional" | "Starter";
  region: string;
  managerName: string;
  managerEmail: string;
  timestamp: string;
}

interface CorporateAlert {
  id: string;
  branchName: string;
  severity: "Critical" | "Warning" | "Info";
  message: string;
  time: string;
}

interface CorporateActivity {
  id: string;
  type: "creation" | "approval" | "plan_change" | "billing" | "alert";
  message: string;
  actor: string;
  timestamp: string;
}

// Initial Mock Data
const INITIAL_BRANCHES: Branch[] = [
  {
    id: "br-001",
    name: "Nexus Retail - New York Flagship",
    region: "East",
    status: "Active",
    plan: "Enterprise",
    activeTickets: 42,
    slaScore: 97.4,
    monthlyValue: 12500,
    managerName: "Arthur Dent",
    managerEmail: "a.dent@nexus.com",
    alertsCount: 0,
    trend: [10, 25, 18, 32, 42]
  },
  {
    id: "br-002",
    name: "Nexus Retail - Los Angeles Hub",
    region: "West",
    status: "Active",
    plan: "Enterprise",
    activeTickets: 58,
    slaScore: 91.2,
    monthlyValue: 14000,
    managerName: "Tony Stark",
    managerEmail: "t.stark@nexus.com",
    alertsCount: 2,
    trend: [45, 30, 52, 40, 58]
  },
  {
    id: "br-003",
    name: "Nexus Retail - Chicago Loop",
    region: "Central",
    status: "Active",
    plan: "Professional",
    activeTickets: 22,
    slaScore: 94.8,
    monthlyValue: 4500,
    managerName: "Peter Gibbons",
    managerEmail: "p.gibbons@nexus.com",
    alertsCount: 0,
    trend: [12, 18, 15, 20, 22]
  },
  {
    id: "br-004",
    name: "Nexus Retail - Seattle Waterfront",
    region: "West",
    status: "Active",
    plan: "Professional",
    activeTickets: 19,
    slaScore: 96.5,
    monthlyValue: 4800,
    managerName: "Bruce Wayne",
    managerEmail: "b.wayne@nexus.com",
    alertsCount: 1,
    trend: [8, 14, 11, 24, 19]
  },
  {
    id: "br-005",
    name: "Nexus Retail - Miami Beach",
    region: "East",
    status: "Maintenance",
    plan: "Starter",
    activeTickets: 0,
    slaScore: 82.0,
    monthlyValue: 1200,
    managerName: "Gavin Belson",
    managerEmail: "g.belson@nexus.com",
    alertsCount: 1,
    trend: [15, 8, 4, 0, 0]
  },
  {
    id: "br-006",
    name: "Nexus Retail - London West End",
    region: "International",
    status: "Active",
    plan: "Enterprise",
    activeTickets: 31,
    slaScore: 95.1,
    monthlyValue: 11000,
    managerName: "Albert Wesker",
    managerEmail: "a.wesker@nexus.com",
    alertsCount: 0,
    trend: [22, 29, 25, 35, 31]
  },
  {
    id: "br-007",
    name: "Nexus Retail - Toronto Center",
    region: "International",
    status: "Trial",
    plan: "Starter",
    activeTickets: 8,
    slaScore: 89.4,
    monthlyValue: 1500,
    managerName: "Sol Roth",
    managerEmail: "s.roth@nexus.com",
    alertsCount: 0,
    trend: [2, 5, 4, 9, 8]
  },
  {
    id: "br-008",
    name: "Nexus Retail - Houston Galleria",
    region: "Central",
    status: "Suspended",
    plan: "Professional",
    activeTickets: 0,
    slaScore: 0,
    monthlyValue: 0,
    managerName: "Miles Dyson",
    managerEmail: "m.dyson@nexus.com",
    alertsCount: 3,
    trend: [14, 11, 5, 0, 0]
  }
];

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: "app-101",
    branchName: "Nexus Retail - Boston Downtown",
    requestedPlan: "Enterprise",
    region: "East",
    managerName: "Sarah Connor",
    managerEmail: "s.connor@nexus.com",
    timestamp: "2 hours ago"
  },
  {
    id: "app-102",
    branchName: "Nexus Retail - Austin Tech Ridge",
    requestedPlan: "Professional",
    region: "Central",
    managerName: "Ted Crisp",
    managerEmail: "t.crisp@nexus.com",
    timestamp: "1 day ago"
  },
  {
    id: "app-103",
    branchName: "Nexus Retail - Frankfurt Flughafen",
    requestedPlan: "Starter",
    region: "International",
    managerName: "Jack Donaghy",
    managerEmail: "j.donaghy@nexus.com",
    timestamp: "3 days ago"
  }
];

const INITIAL_ALERTS: CorporateAlert[] = [
  {
    id: "alt-201",
    branchName: "Nexus Retail - Los Angeles Hub",
    severity: "Critical",
    message: "SLA Threshold breached: Average wait time exceeded 25 mins during lunch peak.",
    time: "10 mins ago"
  },
  {
    id: "alt-202",
    branchName: "Nexus Retail - Houston Galleria",
    severity: "Warning",
    message: "Branch suspended: Billing method declined after three automated invoice attempts.",
    time: "1 hour ago"
  },
  {
    id: "alt-203",
    branchName: "Nexus Retail - Miami Beach",
    severity: "Info",
    message: "Maintenance Mode active: Software update v4.2 deployment in progress.",
    time: "3 hours ago"
  }
];

const INITIAL_ACTIVITIES: CorporateActivity[] = [
  {
    id: "act-301",
    type: "creation",
    message: "New branch approved and provisioned: Toronto Center",
    actor: "Enterprise Superadmin",
    timestamp: "4 hours ago"
  },
  {
    id: "act-302",
    type: "plan_change",
    message: "Stark upgraded London West End branch from Pro Access to Enterprise Tenant",
    actor: "Tony Stark",
    timestamp: "1 day ago"
  },
  {
    id: "act-303",
    type: "alert",
    message: "Critical wait alert cleared at Chicago Loop branch",
    actor: "System Monitor",
    timestamp: "1 day ago"
  },
  {
    id: "act-304",
    type: "billing",
    message: "Monthly billing cycle processed successfully ($48,200 total value)",
    actor: "Automated Ledger",
    timestamp: "2 days ago"
  }
];

// Recharts Custom Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#091244] text-white p-3.5 rounded-xl shadow-xl border border-white/10 text-xs font-rethink">
        <p className="font-bold border-b border-white/10 pb-1.5 mb-1.5">{label} Consolidated Performance</p>
        <div className="space-y-1">
          <p className="text-brand-cyan">
            Monthly Value: <span className="font-mono font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          {payload[1] && (
            <p className="text-emerald-400">
              Active Tickets: <span className="font-mono font-bold">{payload[1].value}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface CompanySuperadminDashboardProps {
  onLogout: () => void;
}

export default function CompanySuperadminDashboard({ onLogout }: CompanySuperadminDashboardProps) {
  // Navigation & Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "branches" | "approvals" | "billing" | "alerts" | "settings">("overview");

  // Dynamic States
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [alerts, setAlerts] = useState<CorporateAlert[]>(INITIAL_ALERTS);
  const [activities, setActivities] = useState<CorporateActivity[]>(INITIAL_ACTIVITIES);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<"All" | "East" | "West" | "Central" | "International">("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Active" | "Maintenance" | "Trial" | "Suspended">("All");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("Last 30 Days");

  // Interactive Modals
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  // New Branch Form
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchRegion, setNewBranchRegion] = useState<"East" | "West" | "Central" | "International">("East");
  const [newBranchPlan, setNewBranchPlan] = useState<"Enterprise" | "Professional" | "Starter">("Professional");
  const [newBranchManager, setNewBranchManager] = useState("");
  const [newBranchEmail, setNewBranchEmail] = useState("");

  // Helper: Trigger Toast Notification
  const triggerToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 4000);
  };

  // KPI calculations
  const kpis = useMemo(() => {
    const totalCount = branches.length;
    const activeCount = branches.filter(b => b.status === "Active").length;
    const pendingCount = approvals.length;
    
    const mrrTotal = branches.reduce((acc, b) => acc + b.monthlyValue, 0);
    const alertsCount = alerts.filter(a => a.severity === "Critical").length;
    
    // Average SLA excluding suspended branches
    const activeSlaBranches = branches.filter(b => b.status !== "Suspended");
    const avgSla = activeSlaBranches.length > 0 
      ? Math.round((activeSlaBranches.reduce((acc, b) => acc + b.slaScore, 0) / activeSlaBranches.length) * 10) / 10
      : 0;

    return {
      totalBranches: totalCount,
      activeBranches: activeCount,
      pendingApprovals: pendingCount,
      mrr: mrrTotal,
      openAlerts: alertsCount,
      sla: avgSla
    };
  }, [branches, approvals, alerts]);

  // Main Chart data (Consolidated monthly trend)
  const chartData = [
    { name: "Jan", value: 38000, tickets: 120 },
    { name: "Feb", value: 41000, tickets: 142 },
    { name: "Mar", value: 43200, tickets: 168 },
    { name: "Apr", value: 49500, tickets: 184 },
    { name: "May", value: 52100, tickets: 195 },
    { name: "Jun", value: kpis.mrr, tickets: branches.reduce((sum, b) => sum + b.activeTickets, 0) * 4 }
  ];

  // Top/Low performing lists
  const performingLists = useMemo(() => {
    const sorted = [...branches].filter(b => b.status !== "Suspended").sort((a, b) => b.slaScore - a.slaScore);
    return {
      top: sorted.slice(0, 3),
      low: [...sorted].reverse().slice(0, 3)
    };
  }, [branches]);

  // Handle Approvals
  const handleApproval = (id: string, action: "approve" | "reject") => {
    const request = approvals.find(a => a.id === id);
    if (!request) return;

    if (action === "approve") {
      const newBranch: Branch = {
        id: `br-${Math.floor(100 + Math.random() * 900)}`,
        name: request.branchName,
        region: request.region as any,
        status: "Active",
        plan: request.requestedPlan,
        activeTickets: 0,
        slaScore: 95.0,
        monthlyValue: request.requestedPlan === "Enterprise" ? 10000 : request.requestedPlan === "Professional" ? 4500 : 1200,
        managerName: request.managerName,
        managerEmail: request.managerEmail,
        alertsCount: 0,
        trend: [10, 10, 10, 10, 10]
      };

      setBranches(prev => [newBranch, ...prev]);
      setActivities(prev => [
        {
          id: `act-${Math.floor(1000 + Math.random() * 9000)}`,
          type: "approval",
          message: `Branch Request Approved: ${request.branchName}`,
          actor: "Superadmin",
          timestamp: "Just now"
        },
        ...prev
      ]);
      triggerToast(`Successfully approved and provisioned ${request.branchName}!`, "success");
    } else {
      triggerToast(`Request for ${request.branchName} was rejected.`, "info");
    }

    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  // Add Branch Submit Handler
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchManager.trim() || !newBranchEmail.trim()) {
      triggerToast("Please fill in all required fields", "warning");
      return;
    }

    const newBranch: Branch = {
      id: `br-${Math.floor(100 + Math.random() * 900)}`,
      name: newBranchName,
      region: newBranchRegion,
      status: "Active",
      plan: newBranchPlan,
      activeTickets: 0,
      slaScore: 98.2, // Pristine starting SLA
      monthlyValue: newBranchPlan === "Enterprise" ? 12000 : newBranchPlan === "Professional" ? 4500 : 1500,
      managerName: newBranchManager,
      managerEmail: newBranchEmail,
      alertsCount: 0,
      trend: [5, 10, 8, 12, 15]
    };

    setBranches(prev => [newBranch, ...prev]);
    setActivities(prev => [
      {
        id: `act-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "creation",
        message: `Branch registered manually: ${newBranchName}`,
        actor: "Superadmin",
        timestamp: "Just now"
      },
      ...prev
    ]);

    // Clear form & close
    setNewBranchName("");
    setNewBranchManager("");
    setNewBranchEmail("");
    setIsAddBranchOpen(false);
    triggerToast(`Successfully registered ${newBranchName}!`, "success");
  };

  // Filter Branches based on states
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "All" || b.region === selectedRegion;
      const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;
      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [branches, searchQuery, selectedRegion, selectedStatus]);

  // Handle branch status toggles or delete
  const toggleBranchStatus = (id: string, nextStatus: Branch["status"]) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
    triggerToast(`Updated branch status to ${nextStatus}`, "info");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#FCF9F2] text-brand-navy font-sans antialiased flex flex-row relative facility-clean-font">
      
      {/* 1. BRANDED NAVIGATION SIDEBAR */}
      <AdminSidebar
        isSidebarCollapsed={sidebarCollapsed}
        setIsSidebarCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        profileName="Sébastien Chen"
        profileEmail="superadmin@nexus.com"
        profileInitials="SC"
        badgeLabel="Company Super"
        showPromo={false}
        menuItems={[
          { id: "overview", label: "Dashboard Home", icon: LayoutDashboard },
          { id: "branches", label: "Tenants & Branches", icon: Briefcase },
          { id: "approvals", label: "Pending Approvals", icon: UserCheck },
          { id: "billing", label: "MRR & Invoices", icon: CreditCard },
          { id: "alerts", label: "Security & Alerts", icon: ShieldAlert },
          { id: "settings", label: "Global Settings", icon: Settings }
        ]}
      />

      {/* 2. MAIN SCROLLABLE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP HEADER BLOCK */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          
          {/* Logo & Page Context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-cyan shadow-sm">
              <span className="font-extrabold text-lg">N</span>
            </div>
            <div>
              <h1 className="font-rethink text-lg font-bold text-brand-navy leading-none">
                Company Superadmin Dashboard
              </h1>
              <p className="text-xs text-slate font-medium mt-1">
                Global overview across all tenants, branches & physical offices
              </p>
            </div>
          </div>

          {/* Quick Action & Filters cluster */}
          <div className="flex items-center gap-4">
            
            {/* Search Input bar */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search global branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#F8FAFC] border border-slate-200/60 rounded-full text-xs outline-none focus:border-brand-navy w-56 font-medium transition-all"
              />
            </div>

            {/* Region dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-full text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate" />
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="bg-transparent border-none outline-none font-sans text-xs font-bold cursor-pointer pr-1"
              >
                <option value="All">All Regions</option>
                <option value="East">East Region</option>
                <option value="West">West Region</option>
                <option value="Central">Central Region</option>
                <option value="International">International</option>
              </select>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-full text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-slate" />
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="bg-transparent border-none outline-none font-sans text-xs font-bold cursor-pointer pr-1"
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>

            {/* Quick action button */}
            <button 
              onClick={() => setIsAddBranchOpen(true)}
              className="px-4 py-2 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Branch</span>
            </button>
            
          </div>
        </header>

        {/* CONTAINER SCROLLABLE BODY — tab-conditional */}
        {activeTab === "approvals" ? (
          <PendingApprovalsPage triggerToast={triggerToast} />
        ) : activeTab === "billing" ? (
          <MRRInvoicesPage triggerToast={triggerToast} />
        ) : activeTab === "alerts" ? (
          <SecurityAlertsPage triggerToast={triggerToast} />
        ) : activeTab === "settings" ? (
          <GlobalSettingsPage triggerToast={triggerToast} />
        ) : (
        <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">

          {/* 2. KPI STRIP (Consolidated metrics) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="kpi-strip">
            
            {/* KPI 1: Branches */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Total Offices</span>
                <Briefcase className="w-4 h-4 text-brand-ocean" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-brand-navy font-outfit leading-none">
                  {kpis.totalBranches}
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  {kpis.activeBranches} Locations Online
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">Active Branches</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +1 this mo
                </span>
              </div>
            </div>

            {/* KPI 2: Active Tickets */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Live Tickets</span>
                <Users className="w-4 h-4 text-brand-cyan animate-pulse" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-brand-navy font-outfit leading-none">
                  {branches.reduce((sum, b) => sum + b.activeTickets, 0)}
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  Currently queued
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">Real-time load</span>
                <span className="text-cyan-600 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +12% vs yesterday
                </span>
              </div>
            </div>

            {/* KPI 3: Pending Approvals */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Approvals</span>
                <UserCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <p className={`text-2xl font-black font-outfit leading-none ${kpis.pendingApprovals > 0 ? "text-amber-600" : "text-brand-navy"}`}>
                  {kpis.pendingApprovals}
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  Onboarding pending
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">Action required</span>
                <span className="text-amber-600 font-bold">Review queue</span>
              </div>
            </div>

            {/* KPI 4: Monthly Gross Value */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Business Value</span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-brand-navy font-outfit leading-none">
                  ${(kpis.mrr).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  Current MRR run-rate
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">SaaS run-rate</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +14.2% MoM
                </span>
              </div>
            </div>

            {/* KPI 5: System Alerts */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Critical Alerts</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-3">
                <p className={`text-2xl font-black font-outfit leading-none ${kpis.openAlerts > 0 ? "text-rose-600 animate-pulse" : "text-brand-navy"}`}>
                  {kpis.openAlerts}
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  SLA or connection issues
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">Security status</span>
                <span className={`${kpis.openAlerts > 0 ? "text-rose-600 font-bold" : "text-slate font-semibold"}`}>
                  {kpis.openAlerts > 0 ? "Needs triage" : "Secure"}
                </span>
              </div>
            </div>

            {/* KPI 6: SLA compliance score */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Avg SLA Score</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-brand-navy font-outfit leading-none">
                  {kpis.sla}%
                </p>
                <p className="text-[10px] text-slate font-semibold mt-1 font-mono">
                  Consolidated target
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[9px]">
                <span className="text-slate font-semibold">Goal: &gt;90%</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +0.8% YoY
                </span>
              </div>
            </div>

          </div>

          {/* 3. MAIN OVERVIEW AREA (Two Column layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left main panel: Revenue / Activity chart over time */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-2xs lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                    Consolidated Corporate Growth
                  </h3>
                  <p className="text-xs text-slate mt-0.5">
                    Consolidated gross business value and visitor traffic trend (last 6 months)
                  </p>
                </div>
                <div className="flex gap-2 text-[10px] font-mono font-bold text-slate">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-brand-navy rounded-full inline-block" /> Value Index
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-brand-cyan rounded-full inline-block" /> Ticket Load
                  </span>
                </div>
              </div>

              {/* Chart Component */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D1A5E" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0D1A5E" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C3E3" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00C3E3" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F6" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#0D1A5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="tickets" stroke="#00C3E3" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTickets)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart footer detail */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 text-[10px] font-mono text-slate">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Consolidated SaaS metrics and branch utilization scores are auto-synchronized daily with the primary HA database.</span>
              </div>
            </div>

            {/* Right panel: Alerts & Approvals (Highly action-oriented) */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
              
              {/* Approvals and urgent reviews */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    Pending Approvals
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200/30">
                    {approvals.length} Requests
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                  <AnimatePresence>
                    {approvals.map((req) => (
                      <motion.div 
                        key={req.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="p-3 bg-[#FDFCF9] border border-slate-200/40 rounded-2xl flex flex-col justify-between text-xs hover:shadow-xs transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-extrabold text-brand-navy font-rethink">{req.branchName}</p>
                            <p className="text-[10px] text-slate font-medium mt-0.5">{req.region} • Request by {req.managerName}</p>
                          </div>
                          <span className="text-[9px] uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200/30 shrink-0">
                            {req.requestedPlan}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button 
                            onClick={() => handleApproval(req.id, "reject")}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg active:scale-95 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApproval(req.id, "approve")}
                            className="px-3 py-1 text-[10px] font-bold text-white bg-brand-navy hover:bg-brand-deepnavy rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-brand-cyan" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {approvals.length === 0 && (
                      <div className="p-6 bg-slate-50/50 rounded-2xl text-center">
                        <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate">All clear! No pending branch approvals.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Actionable alerts indicator */}
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Critical Alerts
                  </span>
                  <button 
                    onClick={() => setActiveTab("alerts")}
                    className="text-brand-ocean hover:underline text-[10px] font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-800 leading-normal">
                      SLA Threshold breached at Los Angeles Hub
                    </p>
                    <p className="text-[10px] text-slate mt-1">
                      Customers wait averages exceeded 25 mins. Dispatching staffing advisory notification.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 4. TENANT / BRANCH OVERVIEW */}
          <div className="space-y-4">
            
            {/* Header filters and counts */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 border border-slate-200/60 rounded-3xl">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                  All Tenant Branches ({filteredBranches.length})
                </h3>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                  Region: {selectedRegion}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate">Status filter:</span>
                <div className="flex gap-1">
                  {["All", "Active", "Maintenance", "Trial", "Suspended"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st as any)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedStatus === st
                          ? "bg-brand-navy border-brand-navy text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Branches Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="tenant-overview-grid">
              {filteredBranches.map((branch) => (
                <div 
                  key={branch.id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Header: Name and Status Badge */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-[13px] text-brand-navy tracking-tight leading-tight group-hover:text-brand-ocean transition-colors font-rethink">
                        {branch.name}
                      </h4>
                      <StatusPill status={branch.status} className="scale-90 origin-top-right shrink-0" />
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 space-y-1 text-xs">
                      <p className="text-slate font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate/60 shrink-0" />
                        <span>Region: {branch.region}</span>
                      </p>
                      <p className="text-slate/80 font-medium truncate">
                        Manager: <strong className="font-bold text-slate-800">{branch.managerName}</strong>
                      </p>
                      <p className="text-[10px] text-slate/60 font-mono truncate">{branch.managerEmail}</p>
                    </div>

                    {/* Operational metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate block leading-none">
                          Active Load
                        </span>
                        <span className="text-[13px] font-mono font-black text-brand-navy mt-1.5 block">
                          {branch.activeTickets} Tickets
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate block leading-none">
                          SLA Score
                        </span>
                        <span className={`text-[13px] font-mono font-black mt-1.5 block ${branch.slaScore >= 90 ? "text-emerald-600" : branch.slaScore > 0 ? "text-amber-600" : "text-rose-600"}`}>
                          {branch.slaScore > 0 ? `${branch.slaScore}%` : "Suspended"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline & actions bar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
                    
                    {/* Sparkline drawing */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Wait Time Sparkline</span>
                      <div className="w-24 h-6">
                        <svg className="w-full h-full stroke-brand-ocean stroke-[1.8] fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path 
                            d={`M 0,${30 - branch.trend[0] * 0.5} 
                               C 20,${30 - branch.trend[1] * 0.5} 40,${30 - branch.trend[2] * 0.5} 
                               60,${30 - branch.trend[3] * 0.5} 80,${30 - branch.trend[4] * 0.5} 
                               100,${30 - branch.trend[4] * 0.5}`} 
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Status Toggle control panel */}
                    <div className="flex items-center justify-between mt-1">
                      <PlanBadge plan={branch.plan} className="scale-85 origin-left" />
                      
                      {/* Interactive action buttons */}
                      <div className="flex gap-1 shrink-0">
                        {branch.status === "Suspended" ? (
                          <button 
                            onClick={() => toggleBranchStatus(branch.id, "Active")}
                            className="px-2 py-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200/30 cursor-pointer"
                          >
                            Activate
                          </button>
                        ) : (
                          <button 
                            onClick={() => toggleBranchStatus(branch.id, "Suspended")}
                            className="px-2 py-1 text-[9px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200/30 cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                        <button 
                          onClick={() => toggleBranchStatus(branch.id, "Maintenance")}
                          className="px-2 py-1 text-[9px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200/30 cursor-pointer"
                        >
                          Maint
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* 5. RECENT ACTIVITY & 6. COMPARISON SECTION (Side-by-side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Activity Timeline Feed */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-ocean" />
                  Recent Corporate Operations Activity
                </h3>
                <span className="text-[10px] font-mono text-slate">Consolidated Feed</span>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar">
                {activities.map((act) => {
                  let IconClass = "bg-slate-100 text-slate-600 border-slate-200";
                  if (act.type === "creation") IconClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                  if (act.type === "approval") IconClass = "bg-indigo-50 text-indigo-600 border-indigo-100";
                  if (act.type === "plan_change") IconClass = "bg-cyan-50 text-cyan-600 border-cyan-100";
                  if (act.type === "billing") IconClass = "bg-amber-50 text-amber-600 border-amber-100";
                  if (act.type === "alert") IconClass = "bg-rose-50 text-rose-600 border-rose-100";

                  return (
                    <div key={act.id} className="flex gap-3 text-xs leading-normal">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${IconClass}`}>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-brand-navy">{act.message}</p>
                        <p className="text-[10px] text-slate mt-1 font-mono">
                          Action by {act.actor} • {act.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparison Performance Section */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                    Branch Leaderboard & Comparison
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200/30">
                    SLA Compliance Ranking
                  </span>
                </div>

                <div className="space-y-4">
                  
                  {/* Top Performers */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                      ★ Top Performing Locations
                    </p>
                    <div className="space-y-1.5">
                      {performingLists.top.map((b, idx) => (
                        <div key={b.id} className="flex items-center justify-between text-xs p-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate font-bold text-[10px]">#{idx + 1}</span>
                            <span className="font-extrabold text-brand-navy truncate max-w-44">{b.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${b.slaScore}%` }} />
                            </div>
                            <span className="font-mono font-bold text-emerald-600">{b.slaScore}% SLA</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Performers / Attention Required */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <p className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">
                      ⚠ Attention Required / Low SLA
                    </p>
                    <div className="space-y-1.5">
                      {performingLists.low.map((b, idx) => (
                        <div key={b.id} className="flex items-center justify-between text-xs p-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate font-bold text-[10px]">#{idx + 1}</span>
                            <span className="font-extrabold text-brand-navy truncate max-w-44">{b.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${b.slaScore}%` }} />
                            </div>
                            <span className={`font-mono font-bold ${b.slaScore > 0 ? "text-rose-500" : "text-slate-400"}`}>
                              {b.slaScore > 0 ? `${b.slaScore}% SLA` : "Suspended"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Compare action prompt */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate font-mono">
                <span>View full location comparative matrix logs</span>
                <button 
                  onClick={() => triggerToast("Comparative ledger report compiled and saved to Cloud Storage.", "info")}
                  className="px-2.5 py-1 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-md font-bold transition-all cursor-pointer"
                >
                  Compile Matrix
                </button>
              </div>
            </div>

          </div>

          {/* 7. QUICK ACTIONS BAR */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-brand-navy flex items-center justify-center shrink-0">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-brand-navy uppercase tracking-wider font-rethink">
                  Console Quick Actions Panel
                </p>
                <p className="text-[10px] text-slate font-medium">
                  Perform system wide tenant-level actions instantly
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => setIsAddBranchOpen(true)}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-brand-ocean" />
                <span>Add Branch</span>
              </button>
              <button 
                onClick={() => triggerToast("Corporate superadmin admin invitation links generated.", "success")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-brand-cyan" />
                <span>Invite Admin</span>
              </button>
              <button 
                onClick={() => setActiveTab("approvals")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>View Approvals</span>
              </button>
              <button 
                onClick={() => triggerToast("Comprehensive corporate diagnostic run-rate summary downloaded.", "info")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Open Reports</span>
              </button>
              <button 
                onClick={() => setActiveTab("billing")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Manage Plans</span>
              </button>
              <button 
                onClick={() => setActiveTab("alerts")}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-brand-navy border border-slate-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Review Alerts</span>
              </button>
            </div>
          </div>

        </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* INTERACTIVE FLOATING MODAL: ADD BRANCH WIZARD */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isAddBranchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Background overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddBranchOpen(false)}
              className="absolute inset-0 bg-brand-navy"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden z-20"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-brand-navy flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-rethink text-sm font-extrabold text-brand-navy uppercase tracking-wider">
                      Register Corporate Branch
                    </h3>
                    <p className="text-[10px] text-slate mt-0.5">
                      Provision a new multi-tenant workspace instantly
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddBranchOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate hover:text-brand-navy rounded-lg cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddBranch} className="space-y-4">
                
                {/* Branch Name */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider block">
                    Branch / Location Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Nexus Retail - Seattle Waterfront"
                    required
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-transparent focus:border-brand-navy focus:bg-white rounded-[14px] px-4 py-2.5 outline-none font-medium text-[13px] transition-all"
                  />
                </div>

                {/* Region & Plan Row */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  
                  {/* Region */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider block">
                      Region Location *
                    </label>
                    <select
                      value={newBranchRegion}
                      onChange={(e) => setNewBranchRegion(e.target.value as any)}
                      className="w-full bg-[#F5F5F7] border border-transparent focus:border-brand-navy focus:bg-white rounded-[14px] px-3.5 py-2.5 outline-none font-bold text-[13px] transition-all cursor-pointer"
                    >
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="Central">Central</option>
                      <option value="International">International</option>
                    </select>
                  </div>

                  {/* Plan */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider block">
                      Subscription Tier *
                    </label>
                    <select
                      value={newBranchPlan}
                      onChange={(e) => setNewBranchPlan(e.target.value as any)}
                      className="w-full bg-[#F5F5F7] border border-transparent focus:border-brand-navy focus:bg-white rounded-[14px] px-3.5 py-2.5 outline-none font-bold text-[13px] transition-all cursor-pointer"
                    >
                      <option value="Starter">Starter (Express)</option>
                      <option value="Professional">Professional (Standard)</option>
                      <option value="Enterprise">Enterprise (Flagship)</option>
                    </select>
                  </div>

                </div>

                {/* Manager Name */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider block">
                    Branch Manager Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Arthur Dent"
                    required
                    value={newBranchManager}
                    onChange={(e) => setNewBranchManager(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-transparent focus:border-brand-navy focus:bg-white rounded-[14px] px-4 py-2.5 outline-none font-medium text-[13px] transition-all"
                  />
                </div>

                {/* Manager Email */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider block">
                    Manager Corporate Email *
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. a.dent@company.com"
                    required
                    value={newBranchEmail}
                    onChange={(e) => setNewBranchEmail(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-transparent focus:border-brand-navy focus:bg-white rounded-[14px] px-4 py-2.5 outline-none font-medium text-[13px] transition-all"
                  />
                </div>

                {/* Complete Register Button */}
                <button
                  type="submit"
                  className="w-full bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan py-3 rounded-[14px] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register & Provision Workspace</span>
                </button>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* FLOATING ACTION TOAST NOTIFICATIONS */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isToastOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] liquid-glass-toast bg-[#091244]/95 text-white border border-white/10 px-5 py-4 rounded-2xl flex items-start gap-3 w-80 max-w-full font-rethink select-none"
            id="toast-notification"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-extrabold tracking-wide uppercase text-[9px] text-brand-cyan leading-none mb-1">
                Corporate Ledger Action
              </p>
              <p className="text-slate-200 leading-normal font-medium">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setIsToastOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

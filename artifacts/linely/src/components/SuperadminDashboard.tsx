import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import AdminSidebar from "./AdminSidebar";
import BillingRevenueControlPanel from "./BillingRevenueControlPanel";
import SystemHealthControlPanel from "./SystemHealthControlPanel";
import SuperadminUsersControlPanel from "./SuperadminUsersControlPanel";
import SuperadminSupportControlPanel from "./SuperadminSupportControlPanel";
import SuperadminAuditLogControlPanel from "./SuperadminAuditLogControlPanel";
import SuperadminSettingsControlPanel from "./SuperadminSettingsControlPanel";
import { StatusPill, PlanBadge } from "./GlobalUI";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Users, 
  Activity, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  ShieldAlert, 
  Trash2, 
  Ban, 
  CheckCircle, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut, 
  GitBranch, 
  Layers, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Plus,
  UserPlus,
  Pencil,
  ChevronLeft,
  Download,
  Settings,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  Zap,
  Database,
  Server,
  Cpu,
  ArrowUpRight,
  Sparkles,
  RotateCw,
  Upload,
  Globe,
  Lock,
  Check,
  Briefcase,
  Clock
} from "lucide-react";

// Types matching the specifications
interface Tenant {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  signupDate: string; // YYYY-MM-DD
  status: "Active" | "Trial" | "Suspended" | "Cancelled";
  branchCount: number;
  lastActive: string;
  email: string;
  ownerName: string;
  phone: string;
  // Redesign fields
  legalId?: string;
  country?: string;
  timezone?: string;
  language?: string;
  primaryColor?: string;
  secondaryColor?: string;
  maxWaitTime?: number;
}

interface PlatformAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  severity: "Info" | "Warning" | "Critical";
}

// ============================================================================
// GLOBAL UTILITY COMPONENTS - DESIGN-INHERITED TOKENS (Imported from GlobalUI)
// ============================================================================

const INITIAL_TENANTS: Tenant[] = [
  {
    id: "ten-001",
    name: "Acme Corporation",
    plan: "Professional",
    signupDate: "2026-05-15",
    status: "Active",
    branchCount: 12,
    lastActive: "2 mins ago",
    email: "billing@acme.com",
    ownerName: "Arthur Dent",
    phone: "+1 (555) 019-2834"
  },
  {
    id: "ten-002",
    name: "Stark Industries",
    plan: "Enterprise",
    signupDate: "2026-03-10",
    status: "Active",
    branchCount: 45,
    lastActive: "Just now",
    email: "pepper.potts@stark.com",
    ownerName: "Tony Stark",
    phone: "+1 (555) 902-1234"
  },
  {
    id: "ten-003",
    name: "Initech LLC",
    plan: "Starter",
    signupDate: "2026-06-20",
    status: "Trial",
    branchCount: 2,
    lastActive: "1 day ago",
    email: "peter.gibbons@initech.com",
    ownerName: "Peter Gibbons",
    phone: "+1 (555) 345-6789"
  },
  {
    id: "ten-004",
    name: "Wayne Enterprises",
    plan: "Enterprise",
    signupDate: "2025-11-04",
    status: "Active",
    branchCount: 38,
    lastActive: "15 mins ago",
    email: "lucius.fox@wayne.corp",
    ownerName: "Bruce Wayne",
    phone: "+1 (555) 789-0123"
  },
  {
    id: "ten-005",
    name: "Hooli",
    plan: "Professional",
    signupDate: "2026-01-18",
    status: "Suspended",
    branchCount: 24,
    lastActive: "12 days ago",
    email: "gavin.belson@hooli.xyz",
    ownerName: "Gavin Belson",
    phone: "+1 (555) 555-0100"
  },
  {
    id: "ten-006",
    name: "Umbrella Corporation",
    plan: "Professional",
    signupDate: "2026-04-02",
    status: "Cancelled",
    branchCount: 8,
    lastActive: "30 days ago",
    email: "albert.wesker@umbrella.com",
    ownerName: "Albert Wesker",
    phone: "+1 (555) 666-1998"
  },
  {
    id: "ten-007",
    name: "Soylent Green Co",
    plan: "Starter",
    signupDate: "2026-06-28",
    status: "Trial",
    branchCount: 1,
    lastActive: "4 hours ago",
    email: "sol.roth@soylent.org",
    ownerName: "Robert Thorn",
    phone: "+1 (555) 891-2345"
  },
  {
    id: "ten-008",
    name: "Cyberdyne Systems",
    plan: "Professional",
    signupDate: "2026-02-14",
    status: "Active",
    branchCount: 14,
    lastActive: "5 mins ago",
    email: "miles.dyson@cyberdyne.io",
    ownerName: "Miles Dyson",
    phone: "+1 (555) 800-1997"
  },
  {
    id: "ten-009",
    name: "Tyrell Corporation",
    plan: "Enterprise",
    signupDate: "2026-06-29",
    status: "Trial",
    branchCount: 15,
    lastActive: "10 mins ago",
    email: "elden.tyrell@tyrell.com",
    ownerName: "Elden Tyrell",
    phone: "+1 (555) 444-2019"
  },
  {
    id: "ten-010",
    name: "Massive Dynamic",
    plan: "Enterprise",
    signupDate: "2026-01-12",
    status: "Active",
    branchCount: 30,
    lastActive: "1 hour ago",
    email: "nina.sharp@massivedynamic.com",
    ownerName: "Nina Sharp",
    phone: "+1 (555) 123-9876"
  },
  {
    id: "ten-011",
    name: "Oscorp Industries",
    plan: "Professional",
    signupDate: "2026-05-18",
    status: "Suspended",
    branchCount: 11,
    lastActive: "4 days ago",
    email: "norman.osborn@oscorp.com",
    ownerName: "Norman Osborn",
    phone: "+1 (555) 412-5896"
  },
  {
    id: "ten-012",
    name: "Virtucon Inc",
    plan: "Starter",
    signupDate: "2026-02-28",
    status: "Cancelled",
    branchCount: 3,
    lastActive: "2 months ago",
    email: "dr.evil@virtucon.net",
    ownerName: "Douglas Powers",
    phone: "+1 (555) 999-6666"
  },
  {
    id: "ten-013",
    name: "LexCorp",
    plan: "Enterprise",
    signupDate: "2025-09-14",
    status: "Active",
    branchCount: 29,
    lastActive: "3 mins ago",
    email: "lex.luthor@lexcorp.com",
    ownerName: "Lex Luthor",
    phone: "+1 (555) 200-2020"
  },
  {
    id: "ten-014",
    name: "Globex Corporation",
    plan: "Professional",
    signupDate: "2026-04-19",
    status: "Active",
    branchCount: 18,
    lastActive: "18 mins ago",
    email: "hank.scorpio@globex.co",
    ownerName: "Hank Scorpio",
    phone: "+1 (555) 888-0001"
  },
  {
    id: "ten-015",
    name: "Wonka Industries",
    plan: "Professional",
    signupDate: "2026-07-02",
    status: "Trial",
    branchCount: 7,
    lastActive: "4 mins ago",
    email: "willy@wonkachoc.com",
    ownerName: "Willy Wonka",
    phone: "+1 (555) 111-2222"
  },
  {
    id: "ten-016",
    name: "Gekko & Co",
    plan: "Starter",
    signupDate: "2026-03-24",
    status: "Active",
    branchCount: 4,
    lastActive: "3 hours ago",
    email: "gordon.gekko@gekkoco.com",
    ownerName: "Gordon Gekko",
    phone: "+1 (555) 555-1987"
  },
  {
    id: "ten-017",
    name: "Halcyon Holding",
    plan: "Professional",
    signupDate: "2026-05-30",
    status: "Active",
    branchCount: 9,
    lastActive: "2 days ago",
    email: "ceo@halcyon.com",
    ownerName: "Kendall Roy",
    phone: "+1 (555) 678-4321"
  },
  {
    id: "ten-018",
    name: "Oceanic Airlines",
    plan: "Starter",
    signupDate: "2026-06-12",
    status: "Suspended",
    branchCount: 1,
    lastActive: "12 days ago",
    email: "manifest@oceanic815.com",
    ownerName: "Hugo Reyes",
    phone: "+1 (555) 108-4232"
  },
  {
    id: "ten-019",
    name: "Veer Logistics",
    plan: "Starter",
    signupDate: "2026-07-01",
    status: "Trial",
    branchCount: 2,
    lastActive: "5 hours ago",
    email: "contact@veerlog.com",
    ownerName: "Devendra Veer",
    phone: "+91 (987) 654-3210"
  },
  {
    id: "ten-020",
    name: "Blue Star Maritime",
    plan: "Professional",
    signupDate: "2026-02-20",
    status: "Active",
    branchCount: 15,
    lastActive: "22 mins ago",
    email: "operations@bluestarmaritime.com",
    ownerName: "Nisha Patel",
    phone: "+44 (207) 123-4567"
  },
  {
    id: "ten-021",
    name: "Reynholm Industries",
    plan: "Starter",
    signupDate: "2026-01-05",
    status: "Active",
    branchCount: 3,
    lastActive: "1 week ago",
    email: "douglas@reynholm.co.uk",
    ownerName: "Douglas Reynholm",
    phone: "+44 (208) 888-9999"
  },
  {
    id: "ten-022",
    name: "Veridian Dynamics",
    plan: "Enterprise",
    signupDate: "2026-04-15",
    status: "Active",
    branchCount: 22,
    lastActive: "6 mins ago",
    email: "ted.crisp@veridiandynamics.com",
    ownerName: "Ted Crisp",
    phone: "+1 (555) 765-4321"
  },
  {
    id: "ten-023",
    name: "Prestige Worldwide",
    plan: "Starter",
    signupDate: "2026-07-05",
    status: "Trial",
    branchCount: 1,
    lastActive: "Just now",
    email: "brennan@prestigeworldwide.io",
    ownerName: "Brennan Huff",
    phone: "+1 (555) 444-5555"
  },
  {
    id: "ten-024",
    name: "Sheinhardt Wig Company",
    plan: "Professional",
    signupDate: "2025-10-30",
    status: "Cancelled",
    branchCount: 5,
    lastActive: "4 weeks ago",
    email: "jack@sheinhardt.com",
    ownerName: "Jack Donaghy",
    phone: "+1 (555) 303-3030"
  },
  {
    id: "ten-025",
    name: "E-Corp",
    plan: "Enterprise",
    signupDate: "2026-05-01",
    status: "Active",
    branchCount: 50,
    lastActive: "2 mins ago",
    email: "phillip.price@ecorp.com",
    ownerName: "Phillip Price",
    phone: "+1 (555) 101-0101"
  }
];

const INITIAL_AUDIT_LOGS: PlatformAuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-07-06 14:22:15",
    actor: "sarah.connor@linely.com",
    action: "Suspended account due to outstanding invoice over 90 days",
    target: "Hooli",
    severity: "Critical"
  },
  {
    id: "aud-002",
    timestamp: "2026-07-06 11:05:40",
    actor: "sarah.connor@linely.com",
    action: "Upgraded plan tier from Professional to Enterprise",
    target: "Stark Industries",
    severity: "Info"
  },
  {
    id: "aud-003",
    timestamp: "2026-07-05 09:30:12",
    actor: "sarah.connor@linely.com",
    action: "Initiated supervisor impersonation session to resolve billing desk issue",
    target: "Acme Corporation",
    severity: "Warning"
  },
  {
    id: "aud-004",
    timestamp: "2026-07-05 09:45:33",
    actor: "sarah.connor@linely.com",
    action: "Terminated supervisor impersonation session",
    target: "Acme Corporation",
    severity: "Info"
  },
  {
    id: "aud-005",
    timestamp: "2026-07-04 16:10:00",
    actor: "sarah.connor@linely.com",
    action: "Reactivated suspended account after successful Stripe verification",
    target: "Veer Logistics",
    severity: "Info"
  },
  {
    id: "aud-006",
    timestamp: "2026-07-03 13:55:12",
    actor: "sarah.connor@linely.com",
    action: "Permanent deletion of outdated trial tenant environment",
    target: "Omni Consumer Products",
    severity: "Critical"
  },
  {
    id: "aud-007",
    timestamp: "2026-07-02 10:20:45",
    actor: "sarah.connor@linely.com",
    action: "Modified tenant status parameter to active for completed onboarding",
    target: "Globex Corporation",
    severity: "Info"
  }
];

interface SuperadminDashboardProps {
  onLogout: () => void;
}

export default function SuperadminDashboard({ onLogout }: SuperadminDashboardProps) {
  // Page state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tenants" | "billing" | "health" | "support" | "logs" | "settings" | "users">("overview");
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Interactive System Health Diagnostics State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ name: string; status: "success" | "warning" | "pending"; desc: string }[]>([]);

  // Interactive Billing Simulation State
  const [starterRate, setStarterRate] = useState(49);
  const [professionalRate, setProfessionalRate] = useState(149);
  const [enterpriseRate, setEnterpriseRate] = useState(499);

  // Interactive Settings State
  const [slaWarningThreshold, setSlaWarningThreshold] = useState(15);
  const [slaTargetTime, setSlaTargetTime] = useState(10);
  const [allowSlaOverrides, setAllowSlaOverrides] = useState(true);
  const [maxStarterBranches, setMaxStarterBranches] = useState(5);

  // Global operations simulation state
  const [utilizationRate, setUtilizationRate] = useState(94.6);
  const [dbLatency, setDbLatency] = useState(12);
  const [redisStatus, setRedisStatus] = useState<"Active" | "Idle" | "Throttled">("Active");
  const [gatewayThroughput, setGatewayThroughput] = useState(99.96);
  const [loadBurstActive, setLoadBurstActive] = useState(false);
  const [totalTokensToday, setTotalTokensToday] = useState(142320);
  const [simulatedLoadSpeed, setSimulatedLoadSpeed] = useState<"Normal" | "Accelerated">("Normal");

  const getTabDisplayName = (tab: string) => {
    switch (tab) {
      case "overview": return "Platform Overview";
      case "users": return "Users & Membership";
      case "tenants": return "Company Management";
      case "billing": return "Billing & Revenue";
      case "health": return "System Health";
      case "support": return "Support Desk";
      case "logs": return "Platform Audit Log";
      case "settings": return "Settings";
      default: return "Dashboard";
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "overview": return "Real-time key business performance and administrative operations snapshot.";
      case "users": return "Manage cross-tenant identities, assign security profiles, audit authentication standards, and bypass credentials with monitored session overrides.";
      case "tenants": return "Configure active merchant workspaces, track real-time SLA metrics, and execute platform-level admin operations.";
      case "billing": return "Track subscription renewals, MRR growth, and invoicing parameters.";
      case "health": return "Monitor platform uptime, API response latencies, and database replica synchronization status.";
      case "support": return "Review customer escalation queues, active tickets, and service level targets.";
      case "logs": return "Complete historical ledger of all superadmin administrative operations and safety checks.";
      case "settings": return "Configure global thresholds, security policies, and administrative boundaries.";
      default: return "";
    }
  };

  // Filter toolbar states (Staged vs Committed as requested in §4)
  const [stagedPlanFilter, setStagedPlanFilter] = useState<string>("All");
  const [stagedStatusFilter, setStagedStatusFilter] = useState<string>("All");
  const [stagedDateRangeFilter, setStagedDateRangeFilter] = useState<string>("All");

  const [committedPlanFilter, setCommittedPlanFilter] = useState<string>("All");
  const [committedStatusFilter, setCommittedStatusFilter] = useState<string>("All");
  const [committedDateRangeFilter, setCommittedDateRangeFilter] = useState<string>("All");

  // Secondary text search specifically for filtering table live by business name
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dropdown states for toolbar
  const [activeDropdown, setActiveDropdown] = useState<"plan" | "status" | "date" | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Tenant | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Row edit sub-dropdown panel state (Pencil dropdown)
  const [pencilDropdownTenantId, setPencilDropdownTenantId] = useState<string | null>(null);

  // Selected tenant for detail modal
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Sensitive action modal states
  const [impersonatingTenant, setImpersonatingTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>("");

  // Plan modification modal states
  const [tenantToChangePlan, setTenantToChangePlan] = useState<Tenant | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<"Starter" | "Professional" | "Enterprise">("Starter");

  // Suspend/Reactivate modal states
  const [tenantToToggleStatus, setTenantToToggleStatus] = useState<Tenant | null>(null);

  // Add new tenant modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [newName, setNewName] = useState<string>("");
  const [newPlan, setNewPlan] = useState<"Starter" | "Professional" | "Enterprise">("Starter");
  const [newStatus, setNewStatus] = useState<"Active" | "Trial" | "Suspended" | "Cancelled">("Active");
  const [newBranchCount, setNewBranchCount] = useState<number>(1);
  const [newOwner, setNewOwner] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  
  // New redesign states
  const [newLegalId, setNewLegalId] = useState<string>("");
  const [newCountry, setNewCountry] = useState<string>("United States");
  const [newTimezone, setNewTimezone] = useState<string>("EST (UTC-5)");
  const [newLanguage, setNewLanguage] = useState<string>("English (US)");
  const [newPrimaryColor, setNewPrimaryColor] = useState<string>("#0f172a");
  const [newSecondaryColor, setNewSecondaryColor] = useState<string>("#06b6d4");
  const [logoFileName, setLogoFileName] = useState<string>("");
  const [autoGeneratePassword, setAutoGeneratePassword] = useState<boolean>(true);
  const [newMaxWaitTime, setNewMaxWaitTime] = useState<number>(15);

  // Deployment wizard simulation states
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentStepText, setDeploymentStepText] = useState<string>("");
  const [deploymentProgress, setDeploymentProgress] = useState<number>(0);

  // Compact Actions Dropdown state
  const [actionsDropdownTenantId, setActionsDropdownTenantId] = useState<string | null>(null);

  // Reset Environment simulation handler
  const handleResetEnvironment = (tenant: Tenant) => {
    addAuditLog(`Initiated full system-wide environment reset and cleared cache buffers`, tenant.name, "Warning");
    triggerToast(`Environment reset successful for "${tenant.name}". Redis caches purged.`, "success");
  };

  // Pagination state (Page size = 5)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning" | "error">("success");

  // Current logged in Superadmin profile metadata
  const currentAdminEmail = "sarah.connor@linely.com";

  // Trigger Toast Notification
  const triggerToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to add log entry
  const addAuditLog = (action: string, target: string, severity: "Info" | "Warning" | "Critical" = "Info") => {
    const now = new Date();
    const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);
    const newEntry: PlatformAuditLogEntry = {
      id: `aud-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timestampStr,
      actor: currentAdminEmail,
      action,
      target,
      severity
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Sorting triggers
  const handleSort = (field: keyof Tenant) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset page on sort
  };

  // 30 days check helper
  const isWithinLast30Days = (dateStr: string): boolean => {
    const today = new Date("2026-07-07"); // Reference date as July 7, 2026
    const targetDate = new Date(dateStr);
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  };

  // 7 days check helper
  const isWithinLast7Days = (dateStr: string): boolean => {
    const today = new Date("2026-07-07"); // Reference date as July 7, 2026
    const targetDate = new Date(dateStr);
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  // Filter & Search Logic (Independent text search & committed dropdown filters)
  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => {
      // 1. Live secondary search specifically for searching by business name
      const matchesSearch = searchQuery.trim() === "" || 
                            tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tenant.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tenant.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Committed Plan Tier Filter
      const matchesPlan = committedPlanFilter === "All" || tenant.plan === committedPlanFilter;

      // 3. Committed Status Filter
      const matchesStatus = committedStatusFilter === "All" || tenant.status === committedStatusFilter;

      // 4. Committed Date range Filter
      let matchesDate = true;
      if (committedDateRangeFilter === "Last 7 days") {
        matchesDate = isWithinLast7Days(tenant.signupDate);
      } else if (committedDateRangeFilter === "Last 30 days") {
        matchesDate = isWithinLast30Days(tenant.signupDate);
      }

      return matchesSearch && matchesPlan && matchesStatus && matchesDate;
    }).sort((a, b) => {
      if (!sortField) return 0;
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tenants, searchQuery, committedPlanFilter, committedStatusFilter, committedDateRangeFilter, sortField, sortDirection]);

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  
  // Safe page indexing
  const paginatedTenants = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTenants.slice(startIdx, startIdx + pageSize);
  }, [filteredTenants, currentPage]);

  // Dynamic live stat computations from active tenants data as specified
  const stats = useMemo(() => {
    const total = tenants.length;
    const newSignups = tenants.filter(t => isWithinLast30Days(t.signupDate)).length;
    const atRisk = tenants.filter(t => t.status === "Suspended" || t.status === "Cancelled").length;
    const totalBranches = tenants.reduce((acc, t) => acc + t.branchCount, 0);

    return {
      total,
      newSignups,
      atRisk,
      totalBranches
    };
  }, [tenants]);

  // Dropdown filter triggers
  const handleApplyDropdownFilters = () => {
    setCommittedPlanFilter(stagedPlanFilter);
    setCommittedStatusFilter(stagedStatusFilter);
    setCommittedDateRangeFilter(stagedDateRangeFilter);
    setCurrentPage(1); // Reset page to first
    triggerToast("Filters applied successfully", "success");
  };

  const handleClearAllFilters = () => {
    setStagedPlanFilter("All");
    setStagedStatusFilter("All");
    setStagedDateRangeFilter("All");
    setCommittedPlanFilter("All");
    setCommittedStatusFilter("All");
    setCommittedDateRangeFilter("All");
    setSearchQuery("");
    setCurrentPage(1);
    triggerToast("All filters and searches cleared", "info");
  };

  const handleRemovePlanChip = () => {
    setStagedPlanFilter("All");
    setCommittedPlanFilter("All");
    setCurrentPage(1);
  };

  const handleRemoveStatusChip = () => {
    setStagedStatusFilter("All");
    setCommittedStatusFilter("All");
    setCurrentPage(1);
  };

  const handleRemoveDateRangeChip = () => {
    setStagedDateRangeFilter("All");
    setCommittedDateRangeFilter("All");
    setCurrentPage(1);
  };

  // Truncated page range helper matching spec "e.g. 1 2 3 … 8 9 10"
  const getPageNumbers = () => {
    const range: (number | string)[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        range.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        range.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return range;
  };

  // Sensitive Actions Execution
  const handleConfirmDelete = () => {
    if (!tenantToDelete) return;
    if (deleteConfirmationText !== tenantToDelete.name) {
      triggerToast("Input must match the business name exactly", "error");
      return;
    }

    // Process deletion
    setTenants(prev => prev.filter(t => t.id !== tenantToDelete.id));
    addAuditLog(`Permanently deleted business account and all client records`, tenantToDelete.name, "Critical");
    triggerToast(`Account for "${tenantToDelete.name}" was permanently purged`, "success");
    setTenantToDelete(null);
    setDeleteConfirmationText("");
    
    // Ensure current page does not become empty
    const newTotalPages = Math.ceil((tenants.length - 1) / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleConfirmStatusToggle = () => {
    if (!tenantToToggleStatus) return;
    const isCurrentlySuspended = tenantToToggleStatus.status === "Suspended";
    const newStatus = isCurrentlySuspended ? "Active" : "Suspended";

    setTenants(prev => prev.map(t => {
      if (t.id === tenantToToggleStatus.id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    const actionText = isCurrentlySuspended ? "Reactivated business account" : "Suspended business account and locked operational console access";
    const severity = isCurrentlySuspended ? "Info" : "Critical";

    addAuditLog(actionText, tenantToToggleStatus.name, severity as any);
    triggerToast(`"${tenantToToggleStatus.name}" has been ${isCurrentlySuspended ? "reactivated" : "suspended"}`, "success");
    setTenantToToggleStatus(null);
  };

  const handleConfirmPlanChange = () => {
    if (!tenantToChangePlan) return;
    const oldPlan = tenantToChangePlan.plan;
    
    setTenants(prev => prev.map(t => {
      if (t.id === tenantToChangePlan.id) {
        return { ...t, plan: selectedNewPlan };
      }
      return t;
    }));

    addAuditLog(`Changed platform plan tier from ${oldPlan} to ${selectedNewPlan}`, tenantToChangePlan.name, "Info");
    triggerToast(`Successfully modified subscription plan to ${selectedNewPlan}`, "success");
    setTenantToChangePlan(null);
  };

  const handleStartImpersonate = (tenant: Tenant) => {
    setImpersonatingTenant(tenant);
    addAuditLog("Initiated supervisor impersonation session (login-as)", tenant.name, "Warning");
    triggerToast(`Impersonation mode active. Accessing console as "${tenant.name}"`, "info");
    setPencilDropdownTenantId(null);
  };

  const handleStopImpersonate = () => {
    if (!impersonatingTenant) return;
    const tenantName = impersonatingTenant.name;
    setImpersonatingTenant(null);
    addAuditLog("Terminated supervisor impersonation session", tenantName, "Info");
    triggerToast("Returned to Master Superadmin profile", "success");
  };

  const startOnboardingDeployment = () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentStepText("Allocating tenant partition on shard-01...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        setDeploymentProgress(100);
        setDeploymentStepText("Workspace deployed successfully!");
        setTimeout(() => {
          setIsDeploying(false);
          handleCreateTenant();
        }, 800);
      } else {
        setDeploymentProgress(progress);
        if (progress < 25) {
          setDeploymentStepText("Allocating tenant partition on shard-01...");
        } else if (progress < 50) {
          setDeploymentStepText("Provisioning isolated database indexes & tables...");
        } else if (progress < 75) {
          setDeploymentStepText("Securing access tokens & TLS certificates...");
        } else {
          setDeploymentStepText("Verifying multi-tenant isolation boundaries...");
        }
      }
    }, 100);
  };

  const handleCreateTenant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) {
      triggerToast("Please provide a valid business name", "error");
      return;
    }
    if (!newOwner.trim()) {
      triggerToast("Please specify the primary account owner", "error");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      triggerToast("Please provide a valid registration email", "error");
      return;
    }

    const brandNewTenant: Tenant = {
      id: `ten-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      plan: newPlan,
      signupDate: new Date().toISOString().substring(0, 10),
      status: newStatus,
      branchCount: Number(newBranchCount) || 1,
      lastActive: "Just now",
      email: newEmail,
      ownerName: newOwner,
      phone: newPhone || "+1 (555) 000-0000",
      // New redesign fields
      legalId: newLegalId || `US-${Math.floor(10000000 + Math.random() * 90000000)}`,
      country: newCountry,
      timezone: newTimezone,
      language: newLanguage,
      primaryColor: newPrimaryColor,
      secondaryColor: newSecondaryColor,
      maxWaitTime: Number(newMaxWaitTime) || 15
    };

    setTenants(prev => [brandNewTenant, ...prev]);
    addAuditLog(`Created new tenant workspace with plan ${newPlan}`, newName, "Info");
    triggerToast(`Workspace for "${newName}" successfully provisioned!`, "success");
    
    // Clear state
    setNewName("");
    setNewPlan("Starter");
    setNewStatus("Active");
    setNewBranchCount(1);
    setNewOwner("");
    setNewEmail("");
    setNewPhone("");
    
    // Clear redesign wizard states
    setNewLegalId("");
    setNewCountry("United States");
    setNewTimezone("EST (UTC-5)");
    setNewLanguage("English (US)");
    setNewPrimaryColor("#0f172a");
    setNewSecondaryColor("#06b6d4");
    setLogoFileName("");
    setAutoGeneratePassword(true);
    setNewMaxWaitTime(15);
    setOnboardingStep(1);

    setShowAddModal(false);
    setCurrentPage(1); // Jump to first page to see the new tenant
  };

  return (
    <div className="h-screen overflow-hidden bg-[#FDFCF9] text-brand-navy font-sans antialiased flex flex-col relative facility-clean-font">
      
      {/* 1. IMPERSONATION PERSISTENT BANNER (§5) */}
      <AnimatePresence>
        {impersonatingTenant && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "48px", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-600 text-white font-medium text-sm flex items-center justify-between px-6 z-50 sticky top-0 shrink-0 shadow-sm transition-all"
            id="impersonation-persistent-banner"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>You are viewing as <strong className="font-bold">{impersonatingTenant.name}</strong></span>
            </div>
            <button 
              onClick={handleStopImpersonate}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 active:bg-white/35 rounded-md text-xs font-bold transition-all border border-white/20 uppercase tracking-wider cursor-pointer"
              id="exit-impersonation-btn"
            >
              Exit Impersonation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-row flex-1 relative overflow-hidden h-full">
        
        {/* 2. FIXED COLLAPSIBLE SIDEBAR (§3) */}
        <AdminSidebar
          isSidebarCollapsed={sidebarCollapsed}
          setIsSidebarCollapsed={setSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          profileName="Sarah Connor"
          profileEmail="sarah@linely.com"
          profileInitials="SC"
          badgeLabel="Platform"
          showPromo={false}
          menuItems={[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "users", label: "Users & Membership", icon: Users },
            { id: "tenants", label: "Company Management", icon: Briefcase },
            { id: "billing", label: "Billing & Revenue", icon: CreditCard },
            { id: "health", label: "System Health", icon: Activity },
            { id: "logs", label: "Platform Audit Log", icon: ShieldAlert }
          ]}
        />

        {/* 3. MAIN WORKSPACE CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" id="main-workspace">
          
          {/* Top Navbar (§3) */}
          <header 
            className="sticky top-0 z-50 bg-white border-b border-slate-100 w-full h-14 flex items-center justify-between px-6 shrink-0"
            id="superadmin-navbar"
          >
            {/* Left Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 font-mono" id="breadcrumbs">
              <span>Superadmin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-brand-navy font-bold">{getTabDisplayName(activeTab)}</span>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-4" id="navbar-right-cluster">
              {/* Live badge */}
              <StatusPill status="Master Console" className="hidden sm:inline-flex" />

              {/* Server indicator */}
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-mono font-bold text-slate-400 leading-none">DATABASE SERVER</p>
                <p className="text-xs font-semibold text-brand-navy mt-0.5 leading-none font-mono">db-primary-ha-01</p>
              </div>

              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-cream flex items-center justify-center font-bold text-xs select-none">
                M
              </div>
            </div>
          </header>

          {/* Main scrollable body */}
          <div className="flex-1 h-full overflow-y-auto p-6 space-y-6" id="dashboard-viewport">
            
            {/* Page Header and Nav Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="view-header-row">
              <div>
                <h1 className="font-outfit text-3xl font-bold tracking-tight text-brand-navy leading-none">
                  {getTabDisplayName(activeTab)}
                </h1>
                <p className="text-slate font-medium text-sm mt-1">
                  {getTabDescription(activeTab)}
                </p>
              </div>
            </div>

            {/* TAB 0: OVERVIEW/HOME */}
            {activeTab === "overview" && (() => {
              // Dynamic Calculations
              const activePayingCount = tenants.filter(t => t.status === "Active").length;
              const activeTrialCount = tenants.filter(t => t.status === "Trial").length;
              const totalActiveMerchants = activePayingCount + activeTrialCount;

              const mrrSum = tenants.reduce((acc, t) => {
                if (t.status !== "Active" && t.status !== "Trial") return acc;
                const rates = { Starter: starterRate, Professional: professionalRate, Enterprise: enterpriseRate };
                return acc + (rates[t.plan] || 0);
              }, 0);
              const arrSum = mrrSum * 12;

              // Chart data - last 6 months correlating revenue & API load tokens
              const chartData = [
                { name: "Jan", revenue: 41000, tokens: 92000 },
                { name: "Feb", revenue: 49000, tokens: 104000 },
                { name: "Mar", revenue: 58000, tokens: 111000 },
                { name: "Apr", revenue: 64000, tokens: 128000 },
                { name: "May", revenue: 73000, tokens: 135000 },
                { name: "Jun", revenue: mrrSum, tokens: totalTokensToday }
              ];

              // Pie data - plan distribution count from active state
              const starterCount = tenants.filter(t => t.plan === "Starter" && t.status !== "Cancelled").length;
              const proCount = tenants.filter(t => t.plan === "Professional" && t.status !== "Cancelled").length;
              const enterpriseCount = tenants.filter(t => t.plan === "Enterprise" && t.status !== "Cancelled").length;

              const planDistribution = [
                { name: "Starter Tier", value: starterCount, color: "#06b6d4" },     // Cyan-500
                { name: "Professional Tier", value: proCount, color: "#3b82f6" },   // Blue-500
                { name: "Enterprise Tier", value: enterpriseCount, color: "#0f172a" } // Slate-900
              ];

              // Top 5 recent onboarding companies
              const recentMerchantsList = [...tenants]
                .sort((a, b) => b.signupDate.localeCompare(a.signupDate))
                .slice(0, 5);

              // Direct toggle helper for suspension
              const toggleTenantSuspensionDirectly = (tenant: Tenant) => {
                const isSuspended = tenant.status === "Suspended";
                const targetStatus = isSuspended ? "Active" : "Suspended";
                
                setTenants(prev => prev.map(t => {
                  if (t.id === tenant.id) {
                    return { ...t, status: targetStatus };
                  }
                  return t;
                }));

                addAuditLog(
                  isSuspended ? "Reactivated business workspace account" : "Suspended business workspace and revoked administrator credentials",
                  tenant.name,
                  isSuspended ? "Info" : "Critical"
                );
                
                triggerToast(
                  `Tenant "${tenant.name}" has been successfully ${isSuspended ? "reactivated" : "suspended"}.`,
                  isSuspended ? "success" : "info"
                );
              };

              const handleTriggerLoadBurst = () => {
                if (loadBurstActive) {
                  // Normalize
                  setLoadBurstActive(false);
                  setUtilizationRate(74.2);
                  setDbLatency(11);
                  setRedisStatus("Active");
                  setGatewayThroughput(99.96);
                  addAuditLog("Terminated system-wide simulated load test and returned to baseline utilization parameters", "Global Systems", "Info");
                  triggerToast("Simulation normalized. All gateway services fully operational.", "success");
                } else {
                  // Burst
                  setLoadBurstActive(true);
                  setUtilizationRate(98.8);
                  setDbLatency(54);
                  setRedisStatus("Throttled");
                  setGatewayThroughput(98.45);
                  setTotalTokensToday(prev => prev + 45000);
                  addAuditLog("Initiated superadmin load burst simulation. Injecting 45k parallel worker tokens.", "Global Systems", "Warning");
                  triggerToast("Load burst simulation active. System utilization spike detected (98.8%)!", "info");
                }
              };

              const handleClearQueueCache = () => {
                triggerToast("Purging Redis task buffers and executing GC clean on heap...", "info");
                setTimeout(() => {
                  setTotalTokensToday(124100);
                  setUtilizationRate(prev => Math.max(65.0, prev - 12));
                  setDbLatency(prev => Math.max(8, prev - 4));
                  addAuditLog("Cleared system cache buffers and rebooted Redis background task workers", "Edge Cache", "Info");
                  triggerToast("Redis task queues successfully cleaned. Cache hit rate at 99.4%.", "success");
                }, 800);
              };

              const CustomChartTooltip = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs font-mono">
                      <p className="font-bold mb-1 border-b border-white/10 pb-1">{label} Snapshot</p>
                      <div className="space-y-1 mt-1">
                        <p className="text-cyan-400">
                          MRR: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
                        </p>
                        <p className="text-emerald-400">
                          Tokens: <span className="font-bold">{payload[1]?.value.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div className="space-y-6 animate-fade-in" id="overview-tab-view">
                  
                  {/* METRIC BANNER (The Shopify "At-a-Glance" Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-stats-grid">
                    
                    {/* Card 1: Global Revenue (MRR/ARR) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200" id="overview-stat-mrr">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold font-mono tracking-wider uppercase">
                          <span>Global Gross Revenue</span>
                          <CreditCard className="w-4 h-4 text-cyan-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-brand-navy mt-2 font-outfit leading-none">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(mrrSum)}
                          <span className="text-xs text-slate-400 font-mono font-medium ml-1">/ mo</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold font-mono leading-none">ARR RUN RATE</span>
                          <span className="text-[11px] text-brand-navy font-bold font-mono mt-1">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(arrSum)}
                          </span>
                        </div>
                        {/* Micro-sparkline SVG */}
                        <div className="w-20 h-8 self-end" title="Revenue MoM growth trend">
                          <svg className="w-full h-full stroke-emerald-500 stroke-[1.5] fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C10,23 20,28 30,18 C40,8 50,15 60,10 C70,5 80,12 90,2 C100,5 100,5 100,5" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Monthly run-rate index</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> +14.2% MoM
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Active Merchants (Total Active vs. Trial) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200" id="overview-stat-active-tenants">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold font-mono tracking-wider uppercase">
                          <span>Active Merchants</span>
                          <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-brand-navy mt-2 font-outfit leading-none">
                          {totalActiveMerchants}
                          <span className="text-xs text-slate-400 font-sans font-medium ml-1">accounts</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold font-mono leading-none">ACTIVE VS TRIAL</span>
                          <span className="text-[11px] text-brand-navy font-bold font-mono mt-1">
                            {activePayingCount} paying <span className="text-slate-300">•</span> {activeTrialCount} trial
                          </span>
                        </div>
                        {/* Micro-sparkline SVG */}
                        <div className="w-20 h-8 self-end">
                          <svg className="w-full h-full stroke-cyan-500 stroke-[1.5] fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,28 C15,25 25,12 40,18 C55,24 65,5 80,8 C90,10 100,2 100,2" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Retention health index</span>
                        <span className="text-cyan-600 font-bold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> +8.4% YoY
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Platform Utilization Rate */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200" id="overview-stat-uptime">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold font-mono tracking-wider uppercase">
                          <span>Platform Utilization</span>
                          <Cpu className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-brand-navy mt-2 font-outfit leading-none">
                          {utilizationRate.toFixed(1)}%
                          <span className="text-xs text-slate-400 font-mono font-medium ml-1">load</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold font-mono leading-none">ACTIVE WORKERS</span>
                          <span className="text-[11px] text-brand-navy font-bold font-mono mt-1">
                            {Math.round(utilizationRate * 2.8)} concurrent tasks
                          </span>
                        </div>
                        {/* Micro-sparkline SVG */}
                        <div className="w-20 h-8 self-end">
                          <svg className="w-full h-full stroke-purple-500 stroke-[1.5] fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,15 C20,18 30,25 45,5 C60,15 70,22 85,12 C95,2 100,22 100,22" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Base limit relative score</span>
                        <span className="text-purple-600 font-bold font-mono">
                          92.4% historical avg
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Gateway Throughput Uptime */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200" id="overview-stat-gateway-throughput">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold font-mono tracking-wider uppercase">
                          <span>Gateway Throughput</span>
                          <Activity className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-brand-navy mt-2 font-outfit leading-none">
                          {gatewayThroughput.toFixed(2)}%
                          <span className="text-xs text-slate-400 font-sans font-medium ml-1">delivery</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold font-mono leading-none">SENT TODAY</span>
                          <span className="text-[11px] text-brand-navy font-bold font-mono mt-1">
                            {totalTokensToday.toLocaleString()} API events
                          </span>
                        </div>
                        {/* Micro-sparkline SVG */}
                        <div className="w-20 h-8 self-end">
                          <svg className="w-full h-full stroke-emerald-500 stroke-[1.5] fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,5 C10,6 20,4 30,5 C40,6 50,5 60,6 C70,4 80,5 90,3 C100,4 100,4 100,4" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">SLA status summary</span>
                        <StatusPill status="OPTIMAL" />
                      </div>
                    </div>

                  </div>

                  {/* SANDBOX SIMULATION CONTROL CENTER (The Stripe-styled Dashboard Sandbox Panel) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="simulation-panel">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black font-mono tracking-wider text-slate-700 uppercase">Interactive Simulation Deck</h4>
                          <StatusPill status="Sandbox" variant="warning" />
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          Inject global traffic bursts, toggle background workers, and observe real-time SLA metrics.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => setSimulatedLoadSpeed(prev => prev === "Normal" ? "Accelerated" : "Normal")}
                        className={`px-3 h-9 text-xs font-bold rounded-lg transition-all border flex items-center gap-1.5 cursor-pointer ${
                          simulatedLoadSpeed === "Accelerated"
                            ? "bg-purple-600 text-white border-purple-700 hover:bg-purple-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                        title="Simulate continuous background events"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${simulatedLoadSpeed === "Accelerated" ? "animate-spin" : ""}`} />
                        <span>{simulatedLoadSpeed === "Accelerated" ? "Accelerated (+100x)" : "Normal Speed"}</span>
                      </button>

                      <button 
                        onClick={handleTriggerLoadBurst}
                        className={`px-3.5 h-9 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          loadBurstActive 
                            ? "bg-rose-600 text-white hover:bg-rose-700" 
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        <Zap className={`w-3.5 h-3.5 ${loadBurstActive ? "text-amber-400 fill-amber-400" : ""}`} />
                        <span>{loadBurstActive ? "Normalize Load Rate" : "Trigger Load Burst"}</span>
                      </button>
                    </div>
                  </div>

                  {/* CORE ANALYTICS ENGINE (Side-by-Side View) */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-6" id="overview-analytics-engine">
                    
                    {/* Left: Platform Growth & Activity (70% width) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-7 flex flex-col shadow-xs" id="growth-chart-card">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <h3 className="font-outfit text-lg font-bold text-brand-navy">Platform Growth & Resource Consumption</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Correlation analysis of Gross MRR run rate and global API Gateway tokens.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-blue-500 rounded" />
                            <span className="text-slate-500">Gross MRR ($)</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-emerald-500 border-t-2 border-emerald-500" />
                            <span className="text-slate-500">Tokens Served (Load)</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={chartData} margin={{ top: 10, right: -5, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#64748b" 
                              fontSize={11} 
                              fontFamily="JetBrains Mono" 
                              tickLine={false} 
                              axisLine={false}
                            />
                            <YAxis 
                              yAxisId="left" 
                              stroke="#3b82f6" 
                              fontSize={11} 
                              fontFamily="JetBrains Mono"
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(v) => `$${v / 1000}k`}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              stroke="#10b981" 
                              fontSize={11} 
                              fontFamily="JetBrains Mono"
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(v) => `${v / 1000}k`}
                            />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Bar 
                              yAxisId="left" 
                              dataKey="revenue" 
                              name="Gross Monthly Revenue" 
                              fill="#3b82f6" 
                              fillOpacity={0.9}
                              radius={[4, 4, 0, 0]} 
                              maxBarSize={45} 
                            />
                            <Line 
                              yAxisId="right" 
                              type="monotone" 
                              dataKey="tokens" 
                              name="Tokens Served" 
                              stroke="#10b981" 
                              strokeWidth={3} 
                              dot={{ r: 4, strokeWidth: 1 }} 
                              activeDot={{ r: 6 }} 
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right: Plan Distribution & Churn Risk (30% width) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-3 flex flex-col justify-between shadow-xs" id="plan-distribution-card">
                      <div>
                        <div className="pb-4 border-b border-slate-100">
                          <h3 className="font-outfit text-lg font-bold text-brand-navy">Merchant Distribution</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Live database partition segment tiering.</p>
                        </div>

                        <div className="relative flex items-center justify-center mt-4">
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={planDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={72}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {planDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} Tenants`, "Distribution"]} />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Inner Label for total active tenants */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black font-outfit text-brand-navy leading-none">
                              {tenants.filter(t => t.status !== "Cancelled").length}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold mt-1">
                              TENANTS
                            </span>
                          </div>
                        </div>

                        {/* Plan Distribution Legend */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-[11px]" id="plan-legend">
                          {planDistribution.map((d, idx) => (
                            <div key={idx} className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="font-bold text-brand-navy">{d.value}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">{d.name.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Churn Risk & Indicator Block */}
                      <div className="pt-4 mt-4 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Platform Churn Rate</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-black rounded uppercase tracking-wider">
                            LOW RISK
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-2xl font-black text-brand-navy font-outfit">1.82%</span>
                          <span className="text-[10px] text-emerald-600 font-bold font-mono">-0.24% YoY</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          Healthy SaaS boundary &lt;3.5%. AI predictive model scores renewal pipeline health at 98.4/100 index.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* INFRASTRUCTURE & RECENT OPERATIONS (Bottom Section) */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-6" id="overview-bottom-infrastructure">
                    
                    {/* Left: Live Merchant Onboarding Stream (70% width) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-7 flex flex-col shadow-xs" id="merchant-stream-card">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <h3 className="font-outfit text-lg font-bold text-brand-navy">Live Merchant Onboarding Stream</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Real-time status of newly created databases and live resource usage indicators.</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                          TOP 5 NEW
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse" id="recent-onboarding-table">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                              <th className="pb-2.5">Merchant</th>
                              <th className="pb-2.5">Plan Tier</th>
                              <th className="pb-2.5">Gateway Load</th>
                              <th className="pb-2.5">Node Status</th>
                              <th className="pb-2.5 text-right">Administrative Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {recentMerchantsList.map((tenant) => {
                              // Dynamic computed Load and Node status representation
                              const tokenVolume = tenant.plan === "Enterprise" ? 114500 : tenant.plan === "Professional" ? 22800 : 1400;
                              const isSuspended = tenant.status === "Suspended";

                              return (
                                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                  {/* Merchant Column */}
                                  <td className="py-3">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-brand-navy font-sans text-sm">{tenant.name}</span>
                                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        Owner: {tenant.ownerName} • Signed up: {tenant.signupDate}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Plan Tier Column */}
                                  <td className="py-3">
                                    <PlanBadge plan={tenant.plan} />
                                  </td>

                                  {/* Gateway Load Column */}
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${tenant.plan === "Enterprise" ? "bg-purple-500" : tenant.plan === "Professional" ? "bg-blue-500" : "bg-cyan-500"}`}
                                          style={{ width: tenant.plan === "Enterprise" ? "85%" : tenant.plan === "Professional" ? "45%" : "15%" }}
                                        />
                                      </div>
                                      <span className="font-mono text-[10px] font-bold text-slate-500">
                                        {tokenVolume.toLocaleString()} tokens
                                      </span>
                                    </div>
                                  </td>

                                  {/* Node Status Column */}
                                  <td className="py-3">
                                    <StatusPill status={isSuspended ? "REVOKED" : tenant.status === "Trial" ? "ACTIVE (TRIAL)" : "ONLINE"} />
                                  </td>

                                  {/* Actions Column */}
                                  <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleStartImpersonate(tenant)}
                                        disabled={isSuspended}
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all border cursor-pointer ${
                                          isSuspended
                                            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                                            : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20"
                                        }`}
                                        title={`Launch administrative impersonation console for ${tenant.name}`}
                                      >
                                        Impersonate
                                      </button>
                                      <button
                                        onClick={() => toggleTenantSuspensionDirectly(tenant)}
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all border cursor-pointer ${
                                          isSuspended
                                            ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border-rose-500/20"
                                        }`}
                                      >
                                        {isSuspended ? "Reactivate" : "Suspend"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Global Service Health & Edge Diagnostics (30% width) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-3 flex flex-col shadow-xs" id="infrastructure-health-card">
                      <div className="pb-4 border-b border-slate-100 mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-outfit text-lg font-bold text-brand-navy">Service Health Status</h3>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Real-time edge diagnostic parameters.</p>
                      </div>

                      <div className="space-y-4 flex-1">
                                        {/* DB Cluster Latency */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
                            <span className="text-slate-400 uppercase">Database Cluster Latency</span>
                            <StatusPill status={dbLatency > 30 ? "WARNING" : "OPTIMAL"} />
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-brand-navy font-mono">
                              <span className="font-sans font-semibold">db-primary-ha-01</span>
                              <span className="font-bold">{dbLatency}ms</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-brand-navy font-mono">
                              <span className="font-sans font-semibold">db-replica-sync-02</span>
                              <span className="text-slate-400">Lag: 0.4s</span>
                            </div>

                            {/* Incremental Latency Simulators for user testing */}
                            <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-100">
                              <span className="text-[9px] text-slate-400 font-semibold font-mono mr-auto">TEST SLA:</span>
                              <button 
                                onClick={() => setDbLatency(prev => Math.max(5, prev - 10))}
                                className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                -10ms
                              </button>
                              <button 
                                onClick={() => setDbLatency(prev => Math.min(120, prev + 10))}
                                className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                +10ms
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Notification Gateways */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
                            <span className="text-slate-400 uppercase">Gateway Connections</span>
                            <StatusPill status="99.98% UPTIME" variant="success" />
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs font-mono">
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-semibold text-slate-600">Twilio SMS API</span>
                              <StatusPill status="ONLINE" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-semibold text-slate-600">Mailgun SMTP Node</span>
                              <StatusPill status="ONLINE" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-semibold text-slate-600">WhatsApp Business Node</span>
                              <StatusPill status="99.91% ONLINE" variant="success" />
                            </div>
                          </div>
                        </div>

                        {/* Redis Queue Workers */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
                            <span className="text-slate-400 uppercase">Redis Queue Cluster</span>
                            <StatusPill status={redisStatus.toUpperCase()} />
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-sans font-semibold text-slate-600">Task Workers Online</span>
                              <span className="text-brand-navy font-bold">8 workers active</span>
                            </div>
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-sans font-semibold text-slate-600">Pending Job Backlog</span>
                              <StatusPill 
                                status={loadBurstActive ? "184 Jobs Queueing" : "0 Tasks Pending"} 
                                variant={loadBurstActive ? "warning" : "success"}
                              />
                            </div>

                            <button
                              onClick={handleClearQueueCache}
                              className="w-full mt-2 h-7 bg-white hover:bg-slate-100 border border-slate-200 text-brand-navy text-[10px] font-mono font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3 text-slate-500" />
                              <span>Purge Buffer & GC Core</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })()}

            {/* TAB 1: TENANTS */}
            {activeTab === "tenants" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200" id="tenants-tab-view">
                
                {/* 1. Action header with "Create New Company" button */}
                <div className="flex justify-end border-b border-slate-100 pb-5" id="tenants-header-section">
                  <button 
                    onClick={() => {
                      setOnboardingStep(1);
                      setShowAddModal(true);
                    }}
                    className="h-9 px-4 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    id="create-new-company-btn"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Create New Company</span>
                  </button>
                </div>

                {/* 2. Live Telemetry Row featuring high-density cards with explicit conditional status badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-cards-grid">
                  
                  {/* Telemetry Card 1: Active Merchants */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between" id="telemetry-card-1">
                    <div className="flex items-center justify-between text-slate text-[10px] font-bold font-mono tracking-wider uppercase">
                      <span>Active Merchants</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping" />
                        Stable
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[#0F172A] mt-2 font-outfit leading-none">
                      {stats.total - stats.atRisk} <span className="text-xs text-slate-400 font-medium">/ {stats.total} total</span>
                    </p>
                    <div className="text-[10px] text-slate font-semibold font-mono mt-2.5">
                      {tenants.filter(t => t.status === "Active").length} Paying • {tenants.filter(t => t.status === "Trial").length} Trial
                    </div>
                  </div>

                  {/* Telemetry Card 2: Active Tokens / Load */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between" id="telemetry-card-2">
                    <div className="flex items-center justify-between text-slate text-[10px] font-bold font-mono tracking-wider uppercase">
                      <span>Active Tokens / Volume</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block animate-pulse" />
                        Optimal
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[#0F172A] mt-2 font-outfit leading-none">
                      {totalTokensToday.toLocaleString()}
                    </p>
                    <div className="text-[10px] text-slate font-semibold font-mono mt-2.5">
                      Live client transaction dispatch count
                    </div>
                  </div>

                  {/* Telemetry Card 3: Avg Wait Time */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between" id="telemetry-card-3">
                    <div className="flex items-center justify-between text-slate text-[10px] font-bold font-mono tracking-wider uppercase">
                      <span>Avg Wait Duration</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
                        Normal Load
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[#0F172A] mt-2 font-outfit leading-none">
                      12m 44s
                    </p>
                    <div className="text-[10px] text-slate font-semibold font-mono mt-2.5">
                      Target threshold: {slaTargetTime}m (SLA warning: {slaWarningThreshold}m)
                    </div>
                  </div>

                  {/* Telemetry Card 4: Database Latency */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between" id="telemetry-card-4">
                    <div className="flex items-center justify-between text-slate text-[10px] font-bold font-mono tracking-wider uppercase">
                      <span>Database Latency</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                        Excellent
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[#0F172A] mt-2 font-outfit leading-none">
                      {dbLatency}ms
                    </p>
                    <div className="text-[10px] text-slate font-semibold font-mono mt-2.5">
                      db-primary-ha-01 replication sync delay
                    </div>
                  </div>

                </div>

                {/* 3. Toolbar containing combinations of filters and searching */}
                <div 
                  className="bg-white p-5 border border-slate-200 rounded-xl space-y-4"
                  id="tenants-toolbar"
                >
                  {/* Staged dropdown filters row */}
                  <div className="flex flex-wrap items-end gap-4" id="dropdown-filter-row">
                    
                    {/* Plan Tier */}
                    <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                      <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Plan Tier</span>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === "plan" ? null : "plan")}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy hover:bg-slate-50 transition-all h-9 cursor-pointer"
                        id="filter-plan-btn"
                      >
                        <span>{stagedPlanFilter}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                      {activeDropdown === "plan" && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            {["All", "Starter", "Professional", "Enterprise"].map(plan => (
                              <button 
                                key={plan} 
                                onClick={() => { setStagedPlanFilter(plan); setActiveDropdown(null); }} 
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-all cursor-pointer ${stagedPlanFilter === plan ? "font-bold text-brand-cyan" : "text-slate-700"}`}
                              >
                                {plan}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Status */}
                    <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                      <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Status</span>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy hover:bg-slate-50 transition-all h-9 cursor-pointer"
                        id="filter-status-btn"
                      >
                        <span>{stagedStatusFilter}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                      {activeDropdown === "status" && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            {["All", "Active", "Trial", "Suspended", "Cancelled"].map(status => (
                              <button 
                                key={status} 
                                onClick={() => { setStagedStatusFilter(status); setActiveDropdown(null); }} 
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-all cursor-pointer ${stagedStatusFilter === status ? "font-bold text-brand-cyan" : "text-slate-700"}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Signup Date Range */}
                    <div className="relative flex-1 min-w-[150px] max-w-[220px]">
                      <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Signup Date Range</span>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy hover:bg-slate-50 transition-all h-9 cursor-pointer"
                        id="filter-date-btn"
                      >
                        <span>{stagedDateRangeFilter}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                      {activeDropdown === "date" && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            {["All", "Last 7 days", "Last 30 days"].map(range => (
                              <button 
                                key={range} 
                                onClick={() => { setStagedDateRangeFilter(range); setActiveDropdown(null); }} 
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-all cursor-pointer ${stagedDateRangeFilter === range ? "font-bold text-brand-cyan" : "text-slate-700"}`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Prominent Navy Search Trigger & Clear All Link */}
                    <div className="flex items-center gap-3 h-9 shrink-0">
                      <button
                        onClick={handleApplyDropdownFilters}
                        className="h-9 px-5 bg-brand-navy hover:bg-brand-deepnavy text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-sm font-sans uppercase tracking-wider"
                        id="apply-filters-search-btn"
                      >
                        Search
                      </button>

                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs font-bold text-slate hover:text-brand-navy hover:underline transition-colors cursor-pointer"
                        id="clear-all-filters-btn"
                      >
                        Clear All
                      </button>
                    </div>

                  </div>

                  {/* Active chips row */}
                  {(committedPlanFilter !== "All" || committedStatusFilter !== "All" || committedDateRangeFilter !== "All") && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100" id="active-chips-row">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">Active:</span>
                      
                      {committedPlanFilter !== "All" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-brand-navy text-[11px] font-semibold rounded-md border border-slate-200">
                          <span>Plan: {committedPlanFilter}</span>
                          <button onClick={handleRemovePlanChip} className="text-slate hover:text-red-600 font-bold ml-1 cursor-pointer">✕</button>
                        </span>
                      )}

                      {committedStatusFilter !== "All" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-brand-navy text-[11px] font-semibold rounded-md border border-slate-200">
                          <span>Status: {committedStatusFilter}</span>
                          <button onClick={handleRemoveStatusChip} className="text-slate hover:text-red-600 font-bold ml-1 cursor-pointer">✕</button>
                        </span>
                      )}

                      {committedDateRangeFilter !== "All" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-brand-navy text-[11px] font-semibold rounded-md border border-slate-200">
                          <span>Signup: {committedDateRangeFilter}</span>
                          <button onClick={handleRemoveDateRangeChip} className="text-slate hover:text-red-600 font-bold ml-1 cursor-pointer">✕</button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Secondary table search specifically for searching table live by business name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="table-search-row">
                    
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Live business name filter..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan transition-all text-brand-navy shadow-xs h-9"
                        id="secondary-table-search-input"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-brand-navy font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Action buttons row (above the table) */}
                    <div className="flex items-center gap-2" id="action-buttons-row">
                      <button
                        onClick={() => triggerToast("Report export completed. Secure server copy downloaded.", "success")}
                        className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        id="export-report-btn"
                      >
                        <Download className="w-4 h-4 text-slate" />
                        <span>Export Report</span>
                      </button>
                      
                      <button
                        onClick={() => triggerToast("Bulk parameters locked. Access superadmin operations pool.", "info")}
                        className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        id="bulk-actions-btn"
                      >
                        <Settings className="w-4 h-4 text-slate" />
                        <span>Bulk Actions</span>
                      </button>
                    </div>

                  </div>

                </div>

                {/* Tenant Table (Shopify / Linear style) */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="tenant-table-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" id="tenant-data-table">
                      <thead>
                        <tr className="bg-slate-50 text-slate font-bold text-xs border-b border-slate-200 h-10 select-none">
                          
                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("name")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              BUSINESS NAME
                              {sortField === "name" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("plan")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              PLAN TIER
                              {sortField === "plan" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("signupDate")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              SIGNUP DATE
                              {sortField === "signupDate" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("status")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              STATUS
                              {sortField === "status" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("branchCount")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              BRANCH COUNT
                              {sortField === "branchCount" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1">
                            <button 
                              onClick={() => handleSort("lastActive")}
                              className="flex items-center gap-1 hover:text-brand-navy cursor-pointer uppercase"
                            >
                              LAST ACTIVE
                              {sortField === "lastActive" && (
                                sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" /> : <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
                              )}
                            </button>
                          </th>

                          <th className="px-4 font-bold font-mono py-1 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[13px] text-brand-navy font-sans">
                        <AnimatePresence mode="popLayout">
                          {paginatedTenants.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate font-medium">
                                No tenants found matching search query or combined filter selection.
                              </td>
                            </tr>
                          ) : (
                            paginatedTenants.map((tenant) => (
                              <motion.tr 
                                key={tenant.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="hover:bg-slate-50/70 transition-colors h-14"
                              >
                                {/* Business name */}
                                <td className="px-4 py-2 font-bold font-outfit">
                                  <div className="flex flex-col">
                                    <span>{tenant.name}</span>
                                    <span className="text-[10px] text-slate font-mono font-semibold">{tenant.id}</span>
                                  </div>
                                </td>

                                {/* Plan tier */}
                                <td className="px-4 py-2">
                                  <PlanBadge plan={tenant.plan} />
                                </td>

                                {/* Signup date */}
                                <td className="px-4 py-2 text-slate font-medium font-mono text-xs">
                                  {tenant.signupDate}
                                </td>

                                {/* Status colored pill badges */}
                                <td className="px-4 py-2">
                                  <StatusPill status={tenant.status} />
                                </td>

                                {/* Branch count */}
                                <td className="px-4 py-2 font-bold font-mono text-left">
                                  {tenant.branchCount}
                                </td>

                                {/* Last active */}
                                <td className="px-4 py-2 text-slate font-medium text-xs">
                                  {tenant.lastActive}
                                </td>

                                {/* Compact Actions dropdown menu */}
                                <td className="px-4 py-2 relative">
                                  <div className="flex items-center justify-end" id={`actions-container-${tenant.id}`}>
                                    <button
                                      onClick={() => setActionsDropdownTenantId(actionsDropdownTenantId === tenant.id ? null : tenant.id)}
                                      className={`h-8 px-3 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                        actionsDropdownTenantId === tenant.id
                                          ? "bg-slate-100 text-brand-navy border-slate-300"
                                          : "bg-white text-brand-navy border-slate-200 hover:bg-slate-50"
                                      }`}
                                      id={`actions-trigger-${tenant.id}`}
                                    >
                                      <span>Actions</span>
                                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${actionsDropdownTenantId === tenant.id ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Floating Actions Dropdown */}
                                    {actionsDropdownTenantId === tenant.id && (
                                      <>
                                        <div className="fixed inset-0 z-30" onClick={() => setActionsDropdownTenantId(null)} />
                                        <div className="absolute right-4 top-10 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-40 py-1 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                                          <div className="px-3 py-1 border-b border-slate-100 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                                            Platform Operations
                                          </div>

                                          {/* View Details */}
                                          <button
                                            onClick={() => {
                                              setSelectedTenant(tenant);
                                              setShowDetailModal(true);
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-brand-navy hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                            id={`view-details-${tenant.id}`}
                                          >
                                            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>View Details Profile</span>
                                          </button>

                                          {/* Impersonate */}
                                          <button
                                            onClick={() => {
                                              handleStartImpersonate(tenant);
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                                            id={`impersonate-${tenant.id}`}
                                          >
                                            <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                            <span>Impersonate Workspace</span>
                                          </button>

                                          {/* Change Plan */}
                                          <button
                                            onClick={() => {
                                              setTenantToChangePlan(tenant);
                                              setSelectedNewPlan(tenant.plan);
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-brand-navy hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                            id={`change-plan-${tenant.id}`}
                                          >
                                            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>Change Subscription</span>
                                          </button>

                                          {/* Suspend / Reactivate */}
                                          <button
                                            onClick={() => {
                                              setTenantToToggleStatus(tenant);
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-brand-navy hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                            id={`toggle-status-${tenant.id}`}
                                          >
                                            <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{tenant.status === "Suspended" ? "Reactivate Workspace" : "Suspend Account"}</span>
                                          </button>

                                          {/* Reset Environment */}
                                          <button
                                            onClick={() => {
                                              handleResetEnvironment(tenant);
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                                            id={`reset-env-${tenant.id}`}
                                          >
                                            <RotateCw className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span>Reset Environment</span>
                                          </button>

                                          <div className="border-t border-slate-100 my-1" />

                                          {/* Purge Workspace */}
                                          <button
                                            onClick={() => {
                                              setTenantToDelete(tenant);
                                              setDeleteConfirmationText("");
                                              setActionsDropdownTenantId(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-bold cursor-pointer"
                                            id={`purge-workspace-${tenant.id}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            <span>Purge Workspace</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </td>

                              </motion.tr>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controller with dynamic truncation logic */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between" id="pagination-panel">
                    <span className="text-xs text-slate font-medium">
                      Showing <strong className="text-brand-navy">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-brand-navy">{Math.min(currentPage * pageSize, filteredTenants.length)}</strong> of <strong className="text-brand-navy">{filteredTenants.length}</strong> tenants
                    </span>

                    <div className="flex items-center gap-1" id="pagination-controls">
                      {/* Previous button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`h-9 px-3 border border-slate-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                          currentPage === 1
                            ? "text-slate-400 bg-slate-100 cursor-not-allowed border-slate-200"
                            : "text-brand-navy bg-white hover:bg-slate-50 cursor-pointer shadow-xs"
                        }`}
                        id="prev-page-btn"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {/* Numeric page triggers with truncations */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum, idx) => {
                          if (pageNum === "...") {
                            return (
                              <span 
                                key={`ellipsis-${idx}`} 
                                className="h-9 w-9 flex items-center justify-center text-slate font-bold font-mono"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => setCurrentPage(pageNum as number)}
                              className={`h-9 min-w-9 px-2 text-xs font-bold font-mono rounded-lg transition-all border ${
                                currentPage === pageNum
                                  ? "bg-brand-navy text-white border-brand-navy shadow-xs"
                                  : "bg-white text-brand-navy border-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`h-9 px-3 border border-slate-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                          currentPage === totalPages
                            ? "text-slate-400 bg-slate-100 cursor-not-allowed border-slate-200"
                            : "text-brand-navy bg-white hover:bg-slate-50 cursor-pointer shadow-xs"
                        }`}
                        id="next-page-btn"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 1.5: USERS DIRECTORY */}
            {activeTab === "users" && (
              <SuperadminUsersControlPanel
                tenants={tenants}
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

            {/* TAB 2: BILLING & REVENUE */}
            {activeTab === "billing" && (
              <BillingRevenueControlPanel
                tenants={tenants}
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

            {/* TAB 3: SYSTEM HEALTH */}
            {activeTab === "health" && (
              <SystemHealthControlPanel
                tenants={tenants}
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

            {/* TAB 4: SUPPORT DESK */}
            {activeTab === "support" && (
              <SuperadminSupportControlPanel
                tenants={tenants}
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

            {/* TAB 5: PLATFORM SETTINGS */}
            {activeTab === "settings" && (
              <SuperadminSettingsControlPanel
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

            {/* TAB 6: PLATFORM AUDIT LOG (§4) */}
            {activeTab === "logs" && (
              <SuperadminAuditLogControlPanel
                tenants={tenants}
                addAuditLog={addAuditLog}
                triggerToast={triggerToast}
              />
            )}

          </div>

        </main>
      </div>

      {/* --- MODALS & PANELS (Floated elements - shadows permitted here) --- */}

      {/* 1. VIEW DETAILS MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs" 
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-xl border border-slate-200 w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
              id="tenant-detail-modal"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-brand-navy text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-brand-cyan font-bold font-mono">Tenant Context Profile</span>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-outfit text-2xl font-bold text-brand-navy leading-none">{selectedTenant.name}</h3>
                    <p className="text-xs text-slate font-mono font-bold mt-1.5">Tenant ID: {selectedTenant.id}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
                    selectedTenant.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    selectedTenant.status === "Trial" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    selectedTenant.status === "Suspended" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-slate-100 text-slate-700 border-slate-300"
                  }`}>
                    {selectedTenant.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <p className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Plan Subscription</p>
                    <p className="text-sm font-bold text-brand-navy mt-0.5">{selectedTenant.plan} Edition</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Active Branch Desks</p>
                    <p className="text-sm font-bold text-brand-navy mt-0.5">{selectedTenant.branchCount} Active Locations</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Signup Date</p>
                    <p className="text-sm font-bold text-slate-600 mt-0.5 font-mono">{selectedTenant.signupDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Last Activity Time</p>
                    <p className="text-sm font-bold text-slate-600 mt-0.5">{selectedTenant.lastActive}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Contact & Ownership Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate font-semibold leading-none">Primary Owner</p>
                      <p className="font-bold text-brand-navy mt-1">{selectedTenant.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-slate font-semibold leading-none">Telephone Contact</p>
                      <p className="font-bold text-brand-navy mt-1 font-mono">{selectedTenant.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate font-semibold leading-none">Registered Email Address</p>
                      <p className="font-bold text-brand-navy mt-1 font-mono">{selectedTenant.email}</p>
                    </div>
                    <div>
                      <p className="text-slate font-semibold leading-none">Legal Entity ID</p>
                      <p className="font-bold text-brand-navy mt-1 font-mono">{selectedTenant.legalId || "US-98310452"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider">Localization & Branding Config</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate font-semibold leading-none">Regional Context</p>
                      <p className="font-semibold text-slate-600 mt-1 font-mono">
                        {selectedTenant.country || "United States"} • {selectedTenant.timezone || "EST (UTC-5)"} ({selectedTenant.language || "English (US)"})
                      </p>
                    </div>
                    <div>
                      <p className="text-slate font-semibold leading-none">Custom Theme Swatches</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-4.5 h-4.5 rounded-full border border-slate-200 inline-block shadow-xs" style={{ backgroundColor: selectedTenant.primaryColor || "#0f172a" }} title="Primary Color" />
                        <span className="w-4.5 h-4.5 rounded-full border border-slate-200 inline-block shadow-xs" style={{ backgroundColor: selectedTenant.secondaryColor || "#06b6d4" }} title="Secondary Color" />
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">{selectedTenant.primaryColor || "#0f172a"} / {selectedTenant.secondaryColor || "#06b6d4"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 leading-normal space-y-1">
                  <p className="font-bold text-brand-navy">Performance Threshold Telemetry (Last 30 Days):</p>
                  <p>• Avg Wait Duration: <strong className="text-brand-navy">12 mins 44s</strong></p>
                  <p>• Total Tickets Dispatched: <strong className="text-brand-navy">12,450 tokens</strong></p>
                  <p>• Platform SLA Compliance: <strong className="text-brand-navy text-emerald-600">94.2% (Target: &gt;90%)</strong></p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 active:bg-slate-100 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Close Details
                </button>
                <button 
                  onClick={() => {
                    handleStartImpersonate(selectedTenant);
                    setShowDetailModal(false);
                  }}
                  className="h-9 px-4 bg-brand-navy hover:bg-brand-deepnavy text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Impersonate Tenant</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. PLAN MODIFICATION MODAL */}
      <AnimatePresence>
        {tenantToChangePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs" 
              onClick={() => setTenantToChangePlan(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
              id="plan-modification-modal"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-brand-navy text-white flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-brand-cyan font-bold font-mono">Modify Subscription Tier</h3>
                <button onClick={() => setTenantToChangePlan(null)} className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-normal">
                  Upgrading or downgrading plans modifies platform limits, branch threshold constraints, and live ticket analytics streams.
                </p>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate font-mono font-bold uppercase block">ACTIVE CLIENT</span>
                  <p className="font-outfit text-base font-bold text-brand-navy mt-0.5">{tenantToChangePlan.name}</p>
                  <p className="text-xs text-slate mt-1.5 font-mono">Current Plan: <strong className="text-brand-navy">{tenantToChangePlan.plan}</strong></p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider block">Select New Plan Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Starter", "Professional", "Enterprise"] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setSelectedNewPlan(plan)}
                        className={`p-2.5 text-center border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedNewPlan === plan 
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 text-[11px] rounded-lg border border-blue-100">
                  <strong className="block mb-0.5">Plan Limit Rules:</strong>
                  • Starter: max 2 branches, 3 active operators.<br />
                  • Professional: max 25 branches, 20 active operators.<br />
                  • Enterprise: unlimited branches, dedicated server pool.
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  onClick={() => setTenantToChangePlan(null)}
                  className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmPlanChange}
                  className="h-9 px-4 bg-brand-navy hover:bg-brand-deepnavy text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Save Subscription Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. SUSPEND / REACTIVATE DIALOG */}
      <AnimatePresence>
        {tenantToToggleStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs" 
              onClick={() => setTenantToToggleStatus(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl relative z-10 overflow-hidden"
              id="suspend-reactivate-modal"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-brand-navy text-white flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-brand-cyan font-bold font-mono">
                  {tenantToToggleStatus.status === "Suspended" ? "Reactivate Tenant" : "Suspend Tenant Account"}
                </h3>
                <button onClick={() => setTenantToToggleStatus(null)} className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500 leading-normal">
                  {tenantToToggleStatus.status === "Suspended" 
                    ? `Are you sure you want to reactivate ${tenantToToggleStatus.name}? This will instantly restore access to all counters, terminals, and TV displays.`
                    : `Are you sure you want to suspend ${tenantToToggleStatus.name}? This will block all operator desk consoles, kiosk terminals, and active customer waitlists immediately.`
                  }
                </p>

                <div className="p-3 rounded-lg border bg-slate-50 border-slate-200">
                  <p className="text-xs font-bold text-brand-navy">{tenantToToggleStatus.name}</p>
                  <p className="text-[10px] text-slate font-mono mt-0.5">Email: {tenantToToggleStatus.email}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  onClick={() => setTenantToToggleStatus(null)}
                  className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmStatusToggle}
                  className={`h-9 px-4 text-white text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tenantToToggleStatus.status === "Suspended"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {tenantToToggleStatus.status === "Suspended" ? "Confirm Reactivation" : "Confirm Suspension"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SENSITIVE DELETE CONFIRMATION MODAL (§5 & §7) */}
      <AnimatePresence>
        {tenantToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs" 
              onClick={() => setTenantToDelete(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
              id="delete-confirmation-modal"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-red-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="text-xs uppercase tracking-widest font-bold font-mono">CRITICAL: Purge Workspace</h3>
                </div>
                <button onClick={() => setTenantToDelete(null)} className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-normal">
                  You are preparing to permanently delete <strong className="text-brand-navy">{tenantToDelete.name}</strong> from Linely. This operation is <strong className="text-red-600">irreversible</strong> and will purge all branches, departments, wait logs, analytics, and active accounts.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate font-mono font-bold uppercase tracking-wider block">
                    Type business name to confirm deletion
                  </label>
                  
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-center select-none cursor-default font-mono text-xs font-bold text-slate-600">
                    {tenantToDelete.name}
                  </div>

                  <input 
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type the business name exactly"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-red-500 text-brand-navy h-9"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  onClick={() => setTenantToDelete(null)}
                  className="h-9 px-4 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationText !== tenantToDelete.name}
                  className={`h-9 px-4 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    deleteConfirmationText === tenantToDelete.name
                      ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                  id="confirm-delete-action-btn"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Workspace</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ADD TENANT MODAL (4-STEP ONBOARDING WIZARD) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs" 
              onClick={() => {
                if (!isDeploying) setShowAddModal(false);
              }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#FDFCF9] rounded-xl border border-slate-200 w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
              id="add-tenant-modal"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-brand-navy text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-brand-cyan animate-pulse" />
                  <div>
                    <h3 className="text-sm uppercase tracking-widest font-bold font-mono">Tenant Provisioning Wizard</h3>
                    <p className="text-[10px] text-brand-cyan/80 font-medium">Step {onboardingStep} of 4 • Configure & Deploy</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (!isDeploying) setShowAddModal(false);
                  }} 
                  disabled={isDeploying}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Deployment Overlay Screen */}
              {isDeploying && (
                <div className="absolute inset-0 bg-brand-navy/95 z-50 flex flex-col items-center justify-center p-8 text-white">
                  <div className="max-w-md w-full space-y-6 text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin" />
                      <Database className="w-8 h-8 text-brand-cyan absolute animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-brand-cyan uppercase tracking-widest">DEPLOYMENT PIPELINE IN PROGRESS</p>
                      <h4 className="text-lg font-bold font-outfit text-white">{deploymentStepText}</h4>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          className="h-full bg-brand-cyan rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${deploymentProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>CLUSTER US-EAST-1</span>
                        <span>{deploymentProgress}%</span>
                      </div>
                    </div>

                    {/* Infrastructure checklist */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-left space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 ${deploymentProgress >= 25 ? "text-brand-cyan" : "text-white/20"}`} />
                        <span className={deploymentProgress >= 25 ? "text-white" : "text-white/40"}>Docker Container Provisioning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 ${deploymentProgress >= 50 ? "text-brand-cyan" : "text-white/20"}`} />
                        <span className={deploymentProgress >= 50 ? "text-white" : "text-white/40"}>Drizzle Relational Migration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 ${deploymentProgress >= 75 ? "text-brand-cyan" : "text-white/20"}`} />
                        <span className={deploymentProgress >= 75 ? "text-white" : "text-white/40"}>Vault TLS & CSR Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 ${deploymentProgress >= 95 ? "text-brand-cyan" : "text-white/20"}`} />
                        <span className={deploymentProgress >= 95 ? "text-white" : "text-white/40"}>Bespoke Theme Ingestion</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stepper Progress Bar Row */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 select-none">
                {[
                  { nr: 1, label: "General & Region" },
                  { nr: 2, label: "Branding" },
                  { nr: 3, label: "Access & Owner" },
                  { nr: 4, label: "Plan & SLA" }
                ].map((step, idx) => (
                  <React.Fragment key={step.nr}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border transition-all ${
                        onboardingStep === step.nr 
                          ? "bg-brand-navy text-white border-brand-navy ring-4 ring-slate-100" 
                          : onboardingStep > step.nr 
                            ? "bg-emerald-600 text-white border-emerald-600" 
                            : "bg-white text-slate-400 border-slate-200"
                      }`}>
                        {onboardingStep > step.nr ? <Check className="w-3.5 h-3.5" /> : step.nr}
                      </div>
                      <span className={`text-[11px] font-bold hidden sm:inline ${
                        onboardingStep === step.nr ? "text-brand-navy" : "text-slate-400"
                      }`}>{step.label}</span>
                    </div>
                    {idx < 3 && <div className={`flex-1 h-[2px] mx-2 hidden sm:block ${onboardingStep > step.nr ? "bg-emerald-600" : "bg-slate-200"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Scrollable Form Body Container */}
              <div className="p-6 overflow-y-auto flex-1 font-sans space-y-6">
                
                {/* STEP 1: GENERAL & LOCALIZATION */}
                {onboardingStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy font-mono uppercase tracking-wider mb-1.5">Business Fundamentals</h4>
                      <p className="text-[11px] text-slate leading-normal">Specify the core legal identity, desk count, and primary language settings of the brand.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Legal Business Name *</label>
                        <input 
                          type="text" 
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Wayne Enterprises Inc."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Lobby Desk Desks Count</label>
                        <input 
                          type="number" 
                          min={1}
                          value={newBranchCount}
                          onChange={(e) => setNewBranchCount(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Domicile Country</label>
                        <select 
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="India">India</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">System Timezone</label>
                        <select 
                          value={newTimezone}
                          onChange={(e) => setNewTimezone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        >
                          <option value="EST (UTC-5)">EST (UTC-5)</option>
                          <option value="CST (UTC-6)">CST (UTC-6)</option>
                          <option value="PST (UTC-8)">PST (UTC-8)</option>
                          <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                          <option value="CET (UTC+1)">CET (UTC+1)</option>
                          <option value="IST (UTC+5.30)">IST (UTC+5.30)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Primary Language</label>
                        <select 
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        >
                          <option value="English (US)">English (US)</option>
                          <option value="Spanish (ES)">Spanish (ES)</option>
                          <option value="French (FR)">French (FR)</option>
                          <option value="German (DE)">German (DE)</option>
                          <option value="English (UK)">English (UK)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: BRANDING */}
                {onboardingStep === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy font-mono uppercase tracking-wider mb-1.5">Visual Identity Config</h4>
                      <p className="text-[11px] text-slate leading-normal">Upload your company emblem and assign responsive brand colors that flow across your live queue tickets and displays.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Brand Asset Upload and Swatch Picker */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-navy mb-1.5">Brand Emblem Logo</label>
                          <div 
                            className="border-2 border-dashed border-slate-200 hover:border-brand-cyan bg-slate-50/50 hover:bg-slate-50 p-5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all relative group"
                            onClick={() => setLogoFileName("logo-emblem-vector.svg")}
                          >
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-cyan mb-2 transition-colors" />
                            {logoFileName ? (
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-brand-navy">{logoFileName}</p>
                                <p className="text-[10px] text-emerald-600 font-mono font-bold uppercase">FILE LOADED SUCCESSFULLY</p>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-brand-navy">Click or Drop brand vector</p>
                                <p className="text-[10px] text-slate-400">Supports SVG, PNG (Max 1.5MB)</p>
                              </div>
                            )}
                            {logoFileName && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLogoFileName("");
                                }}
                                className="absolute top-2 right-2 p-1 bg-white hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-all border border-slate-200"
                                title="Remove File"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Colors Swatch Presets */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-brand-navy">Theme Palette Swatches</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: "Classic", primary: "#0f172a", secondary: "#06b6d4" },
                              { label: "Ocean", primary: "#0D1A5E", secondary: "#3b82f6" },
                              { label: "Forest", primary: "#064E3B", secondary: "#10b981" },
                              { label: "Ember", primary: "#7F1D1D", secondary: "#F59E0B" }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setNewPrimaryColor(preset.primary);
                                  setNewSecondaryColor(preset.secondary);
                                }}
                                className="p-2 border border-slate-200 hover:border-slate-300 rounded-lg bg-white flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <div className="flex gap-0.5">
                                  <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: preset.primary }} />
                                  <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: preset.secondary }} />
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-500">{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Color Swatches */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate mb-1">Primary Color</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="color" 
                                value={newPrimaryColor}
                                onChange={(e) => setNewPrimaryColor(e.target.value)}
                                className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-transparent shrink-0"
                              />
                              <input 
                                type="text"
                                value={newPrimaryColor}
                                onChange={(e) => setNewPrimaryColor(e.target.value)}
                                className="w-full text-xs font-mono font-bold text-brand-navy px-2 py-1.5 border border-slate-200 rounded bg-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate mb-1">Secondary Color</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="color" 
                                value={newSecondaryColor}
                                onChange={(e) => setNewSecondaryColor(e.target.value)}
                                className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-transparent shrink-0"
                              />
                              <input 
                                type="text"
                                value={newSecondaryColor}
                                onChange={(e) => setNewSecondaryColor(e.target.value)}
                                className="w-full text-xs font-mono font-bold text-brand-navy px-2 py-1.5 border border-slate-200 rounded bg-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Queue Ticket Mockup Preview Container */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-2">LIVE REAL-TIME SWATCH PREVIEW</span>
                          
                          {/* Simulated Phone Ticket Mockup */}
                          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col max-w-[240px] mx-auto">
                            {/* Branded Header */}
                            <div className="p-3 text-white text-center space-y-1" style={{ backgroundColor: newPrimaryColor }}>
                              <div className="w-5 h-5 rounded bg-white/20 mx-auto flex items-center justify-center font-bold text-[9px] uppercase">
                                {newName ? newName.charAt(0) : "L"}
                              </div>
                              <p className="text-[10px] font-bold font-outfit uppercase truncate">{newName || "Linely Demo"}</p>
                            </div>
                            {/* Branded Ticket Body */}
                            <div className="p-4 text-center space-y-3 font-sans">
                              <div>
                                <span className="text-[9px] text-slate font-bold uppercase tracking-wider block">Your Queue Number</span>
                                <span className="text-3xl font-black font-outfit" style={{ color: newPrimaryColor }}>A-402</span>
                              </div>
                              <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-100 text-[10px]">
                                <p className="text-slate font-medium">Estimated wait duration:</p>
                                <p className="font-bold text-brand-navy" style={{ color: newSecondaryColor }}>~12 mins remaining</p>
                              </div>
                              <button 
                                type="button"
                                className="w-full py-1.5 text-[10px] text-white font-bold rounded-md transition-all uppercase tracking-wider"
                                style={{ backgroundColor: newSecondaryColor }}
                              >
                                Cancel Ticket
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center leading-snug mt-3">Mockups automatically inherit primary/secondary hex values seamlessly.</p>
                      </div>

                    </div>
                  </div>
                )}

                {/* STEP 3: ACCESS & OWNERSHIP */}
                {onboardingStep === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy font-mono uppercase tracking-wider mb-1.5">Access & Owner Credentials</h4>
                      <p className="text-[11px] text-slate leading-normal">Setup the primary administrator workspace credentials and legal corporate reference registration ID.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Primary Owner Name *</label>
                        <input 
                          type="text" 
                          required
                          value={newOwner}
                          onChange={(e) => setNewOwner(e.target.value)}
                          placeholder="e.g. Bruce Wayne"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Registration Email Address *</label>
                        <input 
                          type="email" 
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="e.g. bruce@wayne.com"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                        {newEmail && !newEmail.includes("@") && (
                          <span className="text-[10px] text-red-500 font-semibold block mt-1">Please enter a valid email format</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Telephone Contact</label>
                        <input 
                          type="text" 
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 019-2834"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Legal Entity ID / Tax Registration</label>
                        <input 
                          type="text" 
                          value={newLegalId}
                          onChange={(e) => setNewLegalId(e.target.value)}
                          placeholder="e.g. US-81930415"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-cyan text-brand-navy h-10 shadow-xs"
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-3 bg-slate-50 border border-slate-150 p-3.5 rounded-xl mt-1">
                        <input 
                          type="checkbox" 
                          id="auto-generate-pass"
                          checked={autoGeneratePassword}
                          onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                          className="w-4 h-4 text-brand-cyan border-slate-200 rounded focus:ring-brand-cyan cursor-pointer"
                        />
                        <div className="select-none">
                          <label htmlFor="auto-generate-pass" className="text-xs font-bold text-brand-navy uppercase font-mono tracking-wider cursor-pointer block leading-none">Auto-generate secure operational passcode</label>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">Forces auto-password generation sent directly to the owner registered email address above.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: SUBSCRIPTION & SLA */}
                {onboardingStep === 4 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy font-mono uppercase tracking-wider mb-1.5">Subscription & SLA Targets</h4>
                      <p className="text-[11px] text-slate leading-normal">Select the plan tier constraints and configure target SLA parameters for performance warnings.</p>
                    </div>

                    {/* Pricing Cards Layout Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { tier: "Starter", label: "Merchant", price: "$49", limits: "Max 2 Branches, 3 operators, standard SLA limits", desc: "For boutique counters" },
                        { tier: "Professional", label: "Pro Access", price: "$149", limits: "Max 25 Branches, 20 operators, custom branding", desc: "For growing facilities" },
                        { tier: "Enterprise", label: "Enterprise Tenant", price: "$499", limits: "Unlimited branches, dedicated nodes, priority SLA", desc: "For global logistics" }
                      ].map((p) => (
                        <button
                          key={p.tier}
                          type="button"
                          onClick={() => setNewPlan(p.tier as any)}
                          className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer h-40 ${
                            newPlan === p.tier 
                              ? "bg-brand-navy text-white border-brand-navy shadow-lg ring-2 ring-brand-cyan" 
                              : "bg-white text-brand-navy border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60">{p.label}</span>
                              {newPlan === p.tier && <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />}
                            </div>
                            <p className="text-2xl font-black font-outfit mt-1.5 leading-none">{p.price}<span className="text-[11px] font-mono font-medium opacity-60">/mo</span></p>
                            <p className="text-[10px] opacity-70 mt-1 leading-snug">{p.desc}</p>
                          </div>
                          <p className="text-[10px] font-mono border-t border-slate-100/15 pt-2 mt-2 leading-tight opacity-80">{p.limits}</p>
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-brand-navy font-mono uppercase tracking-wider">SLA Wait Target Duration</label>
                        <span className="text-xs font-black text-brand-cyan font-mono">{newMaxWaitTime} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={5}
                        max={45}
                        value={newMaxWaitTime}
                        onChange={(e) => setNewMaxWaitTime(parseInt(e.target.value))}
                        className="w-full accent-brand-cyan cursor-pointer"
                      />
                      <span className="block text-[10px] text-slate-400 font-medium pl-1 leading-normal">Maximum target wait time allowed before superadmin escalation queues route automated triage protocols.</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer buttons (Sticky) */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                
                {/* Back Button */}
                <div>
                  {onboardingStep > 1 ? (
                    <button 
                      type="button"
                      onClick={() => setOnboardingStep(prev => prev - 1)}
                      className="h-9 px-3.5 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="h-9 px-3.5 bg-white border border-slate-200 text-brand-navy hover:bg-slate-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Cancel Onboarding
                    </button>
                  )}
                </div>

                {/* Forward/Submit button */}
                <div>
                  {onboardingStep < 4 ? (
                    <button 
                      type="button"
                      onClick={() => {
                        // Validate inputs before advancing step
                        if (onboardingStep === 1) {
                          if (!newName.trim()) {
                            triggerToast("Business Name is required to proceed", "error");
                            return;
                          }
                        }
                        if (onboardingStep === 3) {
                          if (!newOwner.trim()) {
                            triggerToast("Owner Name is required to proceed", "error");
                            return;
                          }
                          if (!newEmail.trim() || !newEmail.includes("@")) {
                            triggerToast("A valid registration email address is required to proceed", "error");
                            return;
                          }
                        }
                        setOnboardingStep(prev => prev + 1);
                      }}
                      className="h-9 px-4 bg-brand-navy hover:bg-brand-deepnavy text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4 text-brand-cyan" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={startOnboardingDeployment}
                      className="h-9 px-5 bg-brand-navy hover:bg-brand-deepnavy text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                      <span>Deploy Tenant Instance</span>
                    </button>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border w-full max-w-md flex items-start gap-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 ${
              toastType === "success"
                ? "bg-[#EEF9F1]/95 border-emerald-500/30 text-emerald-950"
                : toastType === "error"
                  ? "bg-[#FDF2F2]/95 border-rose-500/30 text-rose-950"
                  : toastType === "warning" as any
                    ? "bg-[#FFF9E6]/95 border-amber-500/30 text-amber-950"
                    : "bg-[#EEF4FF]/95 border-blue-500/30 text-blue-950"
            }`}
            id="superadmin-toast"
          >
            {/* Left Status Icon */}
            <div className="shrink-0 mt-0.5">
              {toastType === "success" && (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
              {toastType === "error" && (
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-sm">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              )}
              {(toastType === "info" || (toastType as any) === "warning") && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold font-sans">
                {toastType === "success" && "Success Action"}
                {toastType === "error" && "System Error"}
                {toastType === "info" && "Platform Notification"}
                {(toastType as any) === "warning" && "System Warning"}
              </p>
              <p className="text-xs font-medium font-mono opacity-90 mt-0.5 leading-relaxed">{toastMessage}</p>
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-100/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

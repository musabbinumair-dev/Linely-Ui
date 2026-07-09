import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  X, 
  Check, 
  Plus, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Eye, 
  Shield, 
  Key, 
  Users, 
  Mail, 
  Calendar, 
  Building, 
  Unlock, 
  Lock, 
  UserPlus, 
  Pencil, 
  Activity, 
  FileText, 
  HelpCircle, 
  Fingerprint, 
  UserCheck, 
  Compass, 
  FileSpreadsheet, 
  Power,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
  Send,
  UserX,
  History,
  XCircle,
  Copy,
  Info
} from "lucide-react";

// Types matching high-end specs
export interface SaasUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: "Tenant Owner" | "Admin" | "Operator" | "Auditor" | "Superadmin";
  status: "Active" | "Suspended" | "Pending";
  mfaEnabled: boolean;
  mfaType: "Authenticator App" | "FIDO2 WebAuthn" | "SMS Backup" | "None";
  lastLogin: string; // formatted date-time or relative
  lastLoginRaw: string; // ISO string for calculations
  createdDate: string; // YYYY-MM-DD
  avatarUrl: string;
  phone: string;
  failedLoginAttempts: number;
  ipAddress: string;
  browser: string;
  permissions: string[];
  lastPasswordChange: string; // YYYY-MM-DD
  supportNotes: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  tenantName: string;
  role: string;
  invitedBy: string;
  sentAt: string;
  expiresAt: string;
  status: "Pending" | "Expired" | "Resent";
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  device: string;
}

// Initial Mock Datasets
const INITIAL_USERS: SaasUser[] = [
  {
    id: "usr-101",
    name: "Thomas Anderson",
    email: "t.anderson@stark.com",
    tenantId: "ten-002",
    tenantName: "Stark Industries",
    role: "Tenant Owner",
    status: "Active",
    mfaEnabled: true,
    mfaType: "FIDO2 WebAuthn",
    lastLogin: "2 mins ago",
    lastLoginRaw: "2026-07-08T05:25:00Z",
    createdDate: "2026-03-10",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 902-1234",
    failedLoginAttempts: 0,
    ipAddress: "192.168.1.45",
    browser: "Chrome v124 (macOS)",
    permissions: ["Full Workspace Administration", "Billing Access", "API Key Provisioning", "User Write"],
    lastPasswordChange: "2026-06-05",
    supportNotes: "Primary enterprise contact. Do not change SLA limits without contacting accounting first."
  },
  {
    id: "usr-102",
    name: "Ellen Ripley",
    email: "e.ripley@acme.com",
    tenantId: "ten-001",
    tenantName: "Acme Corporation",
    role: "Admin",
    status: "Active",
    mfaEnabled: true,
    mfaType: "Authenticator App",
    lastLogin: "15 mins ago",
    lastLoginRaw: "2026-07-08T05:12:00Z",
    createdDate: "2026-05-15",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 019-2834",
    failedLoginAttempts: 1,
    ipAddress: "84.22.110.15",
    browser: "Safari v17.4 (iOS)",
    permissions: ["User Write", "Queue Management", "Branch Customization", "Operator Schedule Setup"],
    lastPasswordChange: "2026-05-15",
    supportNotes: "Requires assistance with automated SMS dispatch settings. Setup bypass for off-duty hours."
  },
  {
    id: "usr-103",
    name: "John Connor",
    email: "j.connor@stark.com",
    tenantId: "ten-002",
    tenantName: "Stark Industries",
    role: "Operator",
    status: "Active",
    mfaEnabled: true,
    mfaType: "Authenticator App",
    lastLogin: "1 hr ago",
    lastLoginRaw: "2026-07-08T04:27:00Z",
    createdDate: "2026-04-12",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 902-8871",
    failedLoginAttempts: 0,
    ipAddress: "192.168.1.109",
    browser: "Firefox v125 (Linux)",
    permissions: ["Queue Ticket Execution", "Live Chat Access", "Shift Checkin"],
    lastPasswordChange: "2026-04-12",
    supportNotes: "Trained operator for main automated assembly lines. Active on night shifts."
  },
  {
    id: "usr-104",
    name: "Peter Gibbons",
    email: "peter.gibbons@initech.com",
    tenantId: "ten-003",
    tenantName: "Initech LLC",
    role: "Tenant Owner",
    status: "Suspended",
    mfaEnabled: false,
    mfaType: "None",
    lastLogin: "12 days ago",
    lastLoginRaw: "2026-06-26T14:10:00Z",
    createdDate: "2026-06-20",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 345-6789",
    failedLoginAttempts: 5,
    ipAddress: "12.44.92.204",
    browser: "Chrome v124 (Windows 11)",
    permissions: ["Full Workspace Administration", "Billing Access"],
    lastPasswordChange: "2026-06-20",
    supportNotes: "Suspended due to repeated billing delinquencies on starter tier. Do not reinstate manually."
  },
  {
    id: "usr-105",
    name: "Dana Scully",
    email: "d.scully@wayne.corp",
    tenantId: "ten-004",
    tenantName: "Wayne Enterprises",
    role: "Auditor",
    status: "Active",
    mfaEnabled: true,
    mfaType: "FIDO2 WebAuthn",
    lastLogin: "Just now",
    lastLoginRaw: "2026-07-08T05:27:00Z",
    createdDate: "2025-11-04",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 789-0123",
    failedLoginAttempts: 0,
    ipAddress: "172.16.89.2",
    browser: "Chrome v124 (ChromeOS)",
    permissions: ["Audit Log Read Only", "Export Analytics Data", "View Sensitive Security Metrics"],
    lastPasswordChange: "2026-05-01",
    supportNotes: "Global compliance officer. Frequently runs security audit log exports."
  },
  {
    id: "usr-106",
    name: "Milton Waddams",
    email: "milton@initech.com",
    tenantId: "ten-003",
    tenantName: "Initech LLC",
    role: "Operator",
    status: "Pending",
    mfaEnabled: false,
    mfaType: "None",
    lastLogin: "Never",
    lastLoginRaw: "",
    createdDate: "2026-07-01",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 123-4567",
    failedLoginAttempts: 0,
    ipAddress: "N/A",
    browser: "N/A",
    permissions: ["Queue Ticket Execution"],
    lastPasswordChange: "N/A",
    supportNotes: "Awaiting activation. Mentioned something about a missing red stapler."
  },
  {
    id: "usr-107",
    name: "Gavin Belson",
    email: "gavin.belson@hooli.xyz",
    tenantId: "ten-005",
    tenantName: "Hooli",
    role: "Tenant Owner",
    status: "Suspended",
    mfaEnabled: true,
    mfaType: "SMS Backup",
    lastLogin: "18 days ago",
    lastLoginRaw: "2026-06-20T09:12:00Z",
    createdDate: "2026-01-18",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 555-0100",
    failedLoginAttempts: 0,
    ipAddress: "4.21.31.25",
    browser: "Chrome v124 (macOS)",
    permissions: ["Full Workspace Administration", "Billing Access", "Enterprise Custom Integrations"],
    lastPasswordChange: "2026-01-18",
    supportNotes: "Hooli account fully suspended until corporate buyout terms are finalized."
  },
  {
    id: "usr-108",
    name: "Albert Wesker",
    email: "albert.wesker@umbrella.com",
    tenantId: "ten-006",
    tenantName: "Umbrella Corporation",
    role: "Tenant Owner",
    status: "Suspended",
    mfaEnabled: true,
    mfaType: "Authenticator App",
    lastLogin: "30 days ago",
    lastLoginRaw: "2026-06-08T23:44:00Z",
    createdDate: "2026-04-02",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 666-1998",
    failedLoginAttempts: 3,
    ipAddress: "131.2.45.99",
    browser: "Edge v123 (Windows Server)",
    permissions: ["Full Workspace Administration", "Bio-metrics Sync API Access"],
    lastPasswordChange: "2026-04-02",
    supportNotes: "Critical quarantine active. Flagged by system administrators for suspicious multi-region logins."
  },
  {
    id: "usr-109",
    name: "Sarah Connor",
    email: "sarah.connor@linely.com",
    tenantId: "SYSTEM",
    tenantName: "Linely Platform Staff",
    role: "Superadmin",
    status: "Active",
    mfaEnabled: true,
    mfaType: "FIDO2 WebAuthn",
    lastLogin: "Just now",
    lastLoginRaw: "2026-07-08T05:27:00Z",
    createdDate: "2025-01-01",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80",
    phone: "+1 (555) 000-0199",
    failedLoginAttempts: 0,
    ipAddress: "10.0.0.1",
    browser: "Firefox Dev Edition (Debian)",
    permissions: ["All System Settings", "Database Raw Query Read/Write", "Tenant Provisioning", "Impersonate Any User"],
    lastPasswordChange: "2026-06-01",
    supportNotes: "Active superadministrator of the global Linely SaaS platform instance."
  }
];

const INITIAL_INVITATIONS: UserInvitation[] = [
  { id: "inv-001", email: "richard.hendricks@piedpiper.io", tenantName: "Pied Piper LLC", role: "Tenant Owner", invitedBy: "Sarah Connor", sentAt: "2026-07-06 14:32", expiresAt: "2026-07-09 14:32", status: "Pending" },
  { id: "inv-002", email: "laurie.bream@raviga.com", tenantName: "Raviga Capital", role: "Admin", invitedBy: "Sarah Connor", sentAt: "2026-07-07 09:15", expiresAt: "2026-07-10 09:15", status: "Pending" },
  { id: "inv-003", email: "jared.dunn@piedpiper.io", tenantName: "Pied Piper LLC", role: "Operator", invitedBy: "Richard Hendricks", sentAt: "2026-07-01 10:00", expiresAt: "2026-07-04 10:00", status: "Expired" },
  { id: "inv-004", email: "bruce.wayne@wayne.corp", tenantName: "Wayne Enterprises", role: "Tenant Owner", invitedBy: "Sarah Connor", sentAt: "2026-07-08 01:22", expiresAt: "2026-07-11 01:22", status: "Pending" }
];

const INITIAL_ACTIVITY_LOGS: UserActivityLog[] = [
  { id: "act-101", userId: "usr-101", userName: "Thomas Anderson", action: "User Impersonation login initiated by Sarah Connor", ipAddress: "10.0.0.1", location: "Global Admin Terminal", timestamp: "3 mins ago", device: "Linely CLI Client" },
  { id: "act-102", userId: "usr-102", userName: "Ellen Ripley", action: "Reset MFA Device Credentials", ipAddress: "84.22.110.15", location: "San Francisco, US", timestamp: "22 mins ago", device: "Safari iOS" },
  { id: "act-103", userId: "usr-105", userName: "Dana Scully", action: "Exported 3,420 Security Audit logs to CSV format", ipAddress: "172.16.89.2", location: "Washington DC, US", timestamp: "45 mins ago", device: "ChromeOS v124" },
  { id: "act-104", userId: "usr-104", userName: "Peter Gibbons", action: "Account Suspended automatically - Payment Overdue", ipAddress: "SYSTEM", location: "Stripe Billing Webhook", timestamp: "12 days ago", device: "Linely Autopilot Engine" },
  { id: "act-105", userId: "usr-109", userName: "Sarah Connor", action: "Global configuration setting modified: SLA_WARNING_THRESHOLD=15m", ipAddress: "10.0.0.1", location: "Global Admin Terminal", timestamp: "1 hr ago", device: "Firefox Developer Linux" }
];

interface SuperadminUsersControlPanelProps {
  tenants: any[];
  addAuditLog: (action: string, target: string, severity: "Info" | "Warning" | "Critical") => void;
  triggerToast: (message: string, type: "success" | "info" | "warning" | "error") => void;
}

export default function SuperadminUsersControlPanel({ 
  tenants, 
  addAuditLog, 
  triggerToast 
}: SuperadminUsersControlPanelProps) {
  
  // Operational Simulation States
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [isSimulatingEmpty, setIsSimulatingEmpty] = useState(false);
  const [simulationErrorMessage, setSimulationErrorMessage] = useState("VPC Active Directory connection failed - Network peer handshake timed out.");

  // Main UI States
  const [activeTabSub, setActiveTabSub] = useState<"users" | "invitations" | "activity" | "audit">("users");
  const [users, setUsers] = useState<SaasUser[]>(INITIAL_USERS);
  const [invitations, setInvitations] = useState<UserInvitation[]>(INITIAL_INVITATIONS);
  const [activities, setActivities] = useState<UserActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantFilter, setSelectedTenantFilter] = useState("All");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedMfaFilter, setSelectedMfaFilter] = useState("All");
  const [selectedLoginFilter, setSelectedLoginFilter] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState<keyof SaasUser>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Selection & Bulk Action States
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Drawer States
  const [selectedUser, setSelectedUser] = useState<SaasUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [supportNoteText, setSupportNoteText] = useState("");

  // Impersonation State
  const [impersonateReason, setImpersonateReason] = useState("");
  const [impersonateError, setImpersonateError] = useState("");
  const [activeImpersonatedUser, setActiveImpersonatedUser] = useState<SaasUser | null>(null);

  // Modals confirmation
  const [modalAction, setModalAction] = useState<{
    type: "delete" | "suspend" | "unsuspend" | "reset_mfa" | "bulk_suspend" | "bulk_unsuspend" | "bulk_mfa" | "create_user" | "resend_invite";
    targetId?: string;
    targetName?: string;
  } | null>(null);

  // User form (for creating new user)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    tenantId: "",
    role: "Operator" as SaasUser["role"],
    phone: "",
    mfaEnabled: true,
    mfaType: "Authenticator App" as SaasUser["mfaType"]
  });

  // Unique lists for filters
  const uniqueTenants = useMemo(() => {
    const list = new Set(users.map(u => u.tenantName));
    return ["All", ...Array.from(list).filter(t => t !== "Linely Platform Staff")];
  }, [users]);

  // Handle Sort Toggle
  const handleSort = (field: keyof SaasUser) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Sort Pipeline
  const filteredUsers = useMemo(() => {
    if (isSimulatingEmpty) return [];

    return users.filter(user => {
      // Search
      const s = searchQuery.toLowerCase().trim();
      const matchesSearch = s === "" || 
        user.name.toLowerCase().includes(s) || 
        user.email.toLowerCase().includes(s) ||
        user.id.toLowerCase().includes(s) ||
        user.tenantName.toLowerCase().includes(s);

      // Tenant
      const matchesTenant = selectedTenantFilter === "All" || user.tenantName === selectedTenantFilter;

      // Role
      const matchesRole = selectedRoleFilter === "All" || user.role === selectedRoleFilter;

      // Status
      const matchesStatus = selectedStatusFilter === "All" || user.status === selectedStatusFilter;

      // MFA
      const matchesMfa = selectedMfaFilter === "All" || 
        (selectedMfaFilter === "Enabled" && user.mfaEnabled) ||
        (selectedMfaFilter === "Disabled" && !user.mfaEnabled);

      // Login Recency
      let matchesLogin = true;
      if (selectedLoginFilter !== "All") {
        if (selectedLoginFilter === "Active < 24h") {
          matchesLogin = user.lastLogin.includes("min") || user.lastLogin.includes("hr") || user.lastLogin.includes("Just now");
        } else if (selectedLoginFilter === "Active < 7d") {
          matchesLogin = user.lastLogin.includes("min") || user.lastLogin.includes("hr") || user.lastLogin.includes("Just now") || (user.lastLogin.includes("day") && parseInt(user.lastLogin) < 7);
        } else if (selectedLoginFilter === "Inactive > 30d") {
          matchesLogin = user.lastLogin.includes("Never") || (user.lastLogin.includes("days") && parseInt(user.lastLogin) >= 30);
        }
      }

      // Created Date Preset
      let matchesCreated = true;
      if (selectedDateRange !== "All") {
        const year = parseInt(user.createdDate.split("-")[0]);
        if (selectedDateRange === "2026 Only") {
          matchesCreated = year === 2026;
        } else if (selectedDateRange === "Legacy (<2026)") {
          matchesCreated = year < 2026;
        }
      }

      return matchesSearch && matchesTenant && matchesRole && matchesStatus && matchesMfa && matchesLogin && matchesCreated;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "boolean") {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, selectedTenantFilter, selectedRoleFilter, selectedStatusFilter, selectedMfaFilter, selectedLoginFilter, selectedDateRange, sortField, sortDirection, isSimulatingEmpty]);

  // Metrics (KPIs)
  const stats = useMemo(() => {
    const total = users.length;
    const active30d = users.filter(u => u.status === "Active" && !u.lastLogin.includes("Never") && (!u.lastLogin.includes("days") || parseInt(u.lastLogin) < 30)).length;
    const pendingInv = invitations.filter(i => i.status === "Pending").length;
    const mfaEnabledCount = users.filter(u => u.mfaEnabled).length;
    const mfaRate = total > 0 ? Math.round((mfaEnabledCount / total) * 100) : 0;
    const suspended = users.filter(u => u.status === "Suspended").length;
    const superadmins = users.filter(u => u.role === "Superadmin").length;

    return { total, active30d, pendingInv, mfaRate, suspended, superadmins };
  }, [users, invitations]);

  // Select all rows handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  // Select single row handler
  const handleSelectRow = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRowIds(prev => [...prev, userId]);
    } else {
      setSelectedRowIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Open detailed drawer
  const handleOpenDrawer = (user: SaasUser) => {
    setSelectedUser(user);
    setSupportNoteText(user.supportNotes || "");
    setImpersonateReason("");
    setImpersonateError("");
    setIsDrawerOpen(true);
  };

  // Save support note update
  const handleSaveSupportNote = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, supportNotes: supportNoteText } : u));
    setSelectedUser(prev => prev ? { ...prev, supportNotes: supportNoteText } : null);
    addAuditLog(`Updated internal support notes for superadmin user profile`, selectedUser.name, "Info");
    triggerToast(`Notes saved for user ${selectedUser.name}.`, "success");
  };

  // Confirm and Execute actions
  const executeModalAction = () => {
    if (!modalAction) return;

    const { type, targetId, targetName } = modalAction;

    if (type === "delete" && targetId) {
      setUsers(prev => prev.filter(u => u.id !== targetId));
      if (selectedUser?.id === targetId) {
        setIsDrawerOpen(false);
        setSelectedUser(null);
      }
      setSelectedRowIds(prev => prev.filter(id => id !== targetId));
      addAuditLog(`Permanently deleted user credentials & session metadata`, targetName || targetId, "Critical");
      triggerToast(`Successfully deleted user "${targetName}".`, "success");
    } 
    
    else if (type === "suspend" && targetId) {
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, status: "Suspended" } : u));
      if (selectedUser?.id === targetId) {
        setSelectedUser(prev => prev ? { ...prev, status: "Suspended" } : null);
      }
      addAuditLog(`Manually suspended user account and revoked active tokens`, targetName || targetId, "Warning");
      triggerToast(`Account for "${targetName}" suspended.`, "info");
    } 

    else if (type === "unsuspend" && targetId) {
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, status: "Active" } : u));
      if (selectedUser?.id === targetId) {
        setSelectedUser(prev => prev ? { ...prev, status: "Active" } : null);
      }
      addAuditLog(`Reinstated suspended user account to active status`, targetName || targetId, "Info");
      triggerToast(`Account for "${targetName}" reinstated to Active.`, "success");
    }

    else if (type === "reset_mfa" && targetId) {
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, mfaEnabled: false, mfaType: "None" } : u));
      if (selectedUser?.id === targetId) {
        setSelectedUser(prev => prev ? { ...prev, mfaEnabled: false, mfaType: "None" } : null);
      }
      addAuditLog(`Forced reset of MFA credentials. User required to enroll next login.`, targetName || targetId, "Warning");
      triggerToast(`MFA configuration cleared for "${targetName}".`, "info");
    }

    else if (type === "resend_invite" && targetId) {
      setInvitations(prev => prev.map(inv => inv.id === targetId ? { ...inv, status: "Resent", sentAt: "Just now (Resent)" } : inv));
      addAuditLog(`Resent pending system invitation request`, targetName || targetId, "Info");
      triggerToast(`Invitation email successfully resent to ${targetName}.`, "success");
    }

    else if (type === "bulk_suspend") {
      setUsers(prev => prev.map(u => selectedRowIds.includes(u.id) ? { ...u, status: "Suspended" } : u));
      addAuditLog(`Bulk suspended ${selectedRowIds.length} user accounts via superadmin controls`, `${selectedRowIds.length} Users`, "Warning");
      triggerToast(`Bulk action: Suspended ${selectedRowIds.length} accounts.`, "info");
      setSelectedRowIds([]);
    }

    else if (type === "bulk_unsuspend") {
      setUsers(prev => prev.map(u => selectedRowIds.includes(u.id) ? { ...u, status: "Active" } : u));
      addAuditLog(`Bulk unsuspended ${selectedRowIds.length} user accounts via superadmin controls`, `${selectedRowIds.length} Users`, "Info");
      triggerToast(`Bulk action: Activated ${selectedRowIds.length} accounts.`, "success");
      setSelectedRowIds([]);
    }

    else if (type === "bulk_mfa") {
      setUsers(prev => prev.map(u => selectedRowIds.includes(u.id) ? { ...u, mfaEnabled: false, mfaType: "None" } : u));
      addAuditLog(`Bulk reset MFA enrollments for ${selectedRowIds.length} users`, `${selectedRowIds.length} Users`, "Warning");
      triggerToast(`Bulk action: Reset MFA for ${selectedRowIds.length} accounts.`, "info");
      setSelectedRowIds([]);
    }

    setModalAction(null);
  };

  // Submit User creation
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.tenantId) {
      triggerToast("Please populate all required fields.", "error");
      return;
    }

    const matchedTenant = tenants.find(t => t.id === newUser.tenantId);
    const tenantName = matchedTenant ? matchedTenant.name : "System Staff";

    const added: SaasUser = {
      id: `usr-${Date.now().toString().slice(-3)}`,
      name: newUser.name,
      email: newUser.email,
      tenantId: newUser.tenantId,
      tenantName: tenantName,
      role: newUser.role,
      status: "Pending", // Awaiting invite confirmation
      mfaEnabled: newUser.mfaEnabled,
      mfaType: newUser.mfaEnabled ? newUser.mfaType : "None",
      lastLogin: "Never",
      lastLoginRaw: "",
      createdDate: new Date().toISOString().split("T")[0],
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
      phone: newUser.phone || "+1 (555) 000-0000",
      failedLoginAttempts: 0,
      ipAddress: "N/A",
      browser: "N/A",
      permissions: newUser.role === "Tenant Owner" 
        ? ["Full Workspace Administration", "Billing Access"] 
        : newUser.role === "Admin" 
          ? ["User Write", "Queue Management"] 
          : ["Queue Ticket Execution"],
      lastPasswordChange: "Awaiting Setup",
      supportNotes: "Onboarded manually via global Superadmin directory."
    };

    setUsers(prev => [added, ...prev]);
    setShowCreateForm(false);
    
    // Add to invitations too
    const newInv: UserInvitation = {
      id: `inv-${Date.now().toString().slice(-3)}`,
      email: added.email,
      tenantName: added.tenantName,
      role: added.role,
      invitedBy: "Sarah Connor (Superadmin)",
      sentAt: "Just now",
      expiresAt: "In 72 hours",
      status: "Pending"
    };
    setInvitations(prev => [newInv, ...prev]);

    addAuditLog(`Manually onboarded user & issued welcome invitation`, added.email, "Info");
    triggerToast(`User ${added.name} successfully created & invited.`, "success");
    
    // Reset state
    setNewUser({
      name: "",
      email: "",
      tenantId: "",
      role: "Operator",
      phone: "",
      mfaEnabled: true,
      mfaType: "Authenticator App"
    });
  };

  // Impersonate Action
  const handleImpersonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    if (impersonateReason.trim().length < 8) {
      setImpersonateError("Mandatory compliance log: reason must be at least 8 characters.");
      return;
    }

    setImpersonateError("");
    setActiveImpersonatedUser(selectedUser);
    setIsDrawerOpen(false);

    addAuditLog(`Initiated active superadmin security impersonation override (Reason: ${impersonateReason})`, selectedUser.name, "Critical");
    triggerToast(`Impersonation mode activated for ${selectedUser.name}.`, "warning");
  };

  // Exit Impersonation Mode
  const exitImpersonation = () => {
    if (!activeImpersonatedUser) return;
    addAuditLog(`Superadmin closed compliance-logged user impersonation session`, activeImpersonatedUser.name, "Info");
    triggerToast(`Impersonation session terminated. Restored superadmin terminal context.`, "success");
    setActiveImpersonatedUser(null);
  };

  // Manual trigger for refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast("Directory synced successfully with active directory pool.", "success");
    }, 850);
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans" id="superadmin-users-panel-root">
      
      {/* Impersonation Banner Alert */}
      {activeImpersonatedUser && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-lg border border-amber-400 gap-4"
          id="impersonation-active-banner"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-950"></span>
            </span>
            <div className="text-xs sm:text-sm">
              <span className="uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 font-mono text-[9px] mr-2 font-black">ACTIVE OVERRIDE</span>
              Currently viewing console workspace as <strong className="underline">{activeImpersonatedUser.name}</strong> ({activeImpersonatedUser.email}) at <strong className="font-mono text-xs">{activeImpersonatedUser.tenantName}</strong>. All console triggers are logged under compliance context.
            </div>
          </div>
          <button 
            onClick={exitImpersonation}
            className="px-3.5 py-1.5 bg-slate-950 text-amber-400 rounded-lg hover:bg-slate-900 transition-all text-xs font-black shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Power className="w-3.5 h-3.5" />
            EXIT SESSION
          </button>
        </motion.div>
      )}

      {/* DYNAMIC METRIC & LOADING STATE SIMULATOR BAR */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-3xs" id="simulation-panel">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">Developer Simulation Tools</span>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <span className="text-[11px] text-slate-400">Toggle states to test UI reactivity:</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => {
              setIsSimulatingLoading(prev => !prev);
              if (!isSimulatingLoading) triggerToast("Loading state preview enabled.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingLoading 
                ? "bg-indigo-600 text-white border-indigo-700" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isSimulatingLoading ? "● Loading: ON" : "Loading State"}
          </button>
          
          <button 
            onClick={() => {
              setIsSimulatingError(prev => !prev);
              if (!isSimulatingError) triggerToast("Network error simulation loaded.", "warning");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingError 
                ? "bg-rose-600 text-white border-rose-700" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50"
            }`}
          >
            {isSimulatingError ? "● Error: ON" : "Error State"}
          </button>

          <button 
            onClick={() => {
              setIsSimulatingEmpty(prev => !prev);
              triggerToast(isSimulatingEmpty ? "Restored mock data records." : "Cleared active user directory records.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingEmpty 
                ? "bg-slate-800 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isSimulatingEmpty ? "● Empty DB: ON" : "Empty Directory State"}
          </button>
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black font-outfit text-brand-navy tracking-tight">Multi-Tenant User Directory</h1>
            <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
              Global Superadmin
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
            Configure cross-tenant permissions, audit security profiles, bypass locks via audited impersonations, and resend onboarding invitations.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleManualRefresh}
            className={`h-9 w-9 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer shadow-3xs ${isRefreshing ? "animate-spin" : ""}`}
            title="Refresh directory cache"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["ID,Name,Email,Tenant,Role,Status,MFA,LastLogin"].join("\n") + "\n" +
                users.map(u => `${u.id},"${u.name}",${u.email},"${u.tenantName}",${u.role},${u.status},${u.mfaEnabled},"${u.lastLogin}"`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `linely_superadmin_users_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              triggerToast("Exported directory CSV compilation.", "success");
            }}
            className="h-9 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button 
            onClick={() => setShowCreateForm(true)}
            className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Onboard User
          </button>
        </div>
      </div>

      {/* KPI METRIC SUMMARY ROW (SIX CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4" id="kpi-metric-cards-row">
        {/* Card 1: Total Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Managed</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-brand-navy font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0" : stats.total}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Cross-tenant identities</p>
          </div>
        </div>

        {/* Card 2: Active (30d) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Active (30d)</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-emerald-600 font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0" : stats.active30d}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              {stats.total > 0 ? `${Math.round((stats.active30d / stats.total) * 100)}% active engagement` : "0% engagement"}
            </p>
          </div>
        </div>

        {/* Card 3: Invited Pending */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Invitations</span>
            <Mail className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-amber-600 font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0" : stats.pendingInv}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Awaiting registration</p>
          </div>
        </div>

        {/* Card 4: MFA Coverage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">MFA Security</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-indigo-600 font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0%" : `${stats.mfaRate}%`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Enrolled MFA policies</p>
          </div>
        </div>

        {/* Card 5: Suspended */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Suspended</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-rose-600 font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0" : stats.suspended}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Credentials revoked</p>
          </div>
        </div>

        {/* Card 6: Platform Admins */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Superadmins</span>
            <Shield className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-slate-800 font-outfit leading-none tabular-nums">
              {isSimulatingEmpty ? "0" : stats.superadmins}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Full root system context</p>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden" id="filter-wrapper-card">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h3 className="font-outfit text-sm font-bold text-slate-700">Search & Filter Directories</h3>
          </div>
          <button 
            onClick={() => setIsFiltersCollapsed(prev => !prev)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
          >
            {isFiltersCollapsed ? "Expand Advanced Controls" : "Collapse Filters"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!isFiltersCollapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
                
                {/* Search query */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Text Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search ID, name, email or tenant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Tenant selection */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Tenant Pool</label>
                  <select 
                    value={selectedTenantFilter} 
                    onChange={(e) => setSelectedTenantFilter(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All Tenants</option>
                    {uniqueTenants.filter(t => t !== "All").map(tenant => (
                      <option key={tenant} value={tenant}>{tenant}</option>
                    ))}
                  </select>
                </div>

                {/* Role selection */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Workspace Role</label>
                  <select 
                    value={selectedRoleFilter} 
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All Roles</option>
                    <option value="Tenant Owner">Tenant Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>

                {/* Status selection */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Status</label>
                  <select 
                    value={selectedStatusFilter} 
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* MFA status selection */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">MFA Status</label>
                  <select 
                    value={selectedMfaFilter} 
                    onChange={(e) => setSelectedMfaFilter(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All MFA Settings</option>
                    <option value="Enabled">MFA Enabled</option>
                    <option value="Disabled">MFA Disabled</option>
                  </select>
                </div>

                {/* Login activity selection */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Login Status</label>
                  <select 
                    value={selectedLoginFilter} 
                    onChange={(e) => setSelectedLoginFilter(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="All">All Login Activity</option>
                    <option value="Active < 24h">Active last 24h</option>
                    <option value="Active < 7d">Active last 7 days</option>
                    <option value="Inactive > 30d">Inactive &gt; 30 days</option>
                  </select>
                </div>

              </div>

              {/* Reset/Clear bar */}
              {(searchQuery || selectedTenantFilter !== "All" || selectedRoleFilter !== "All" || selectedStatusFilter !== "All" || selectedMfaFilter !== "All" || selectedLoginFilter !== "All" || selectedDateRange !== "All") && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Filter pipeline active. Showing <strong className="text-[#0F172A]">{filteredUsers.length}</strong> matching records out of <strong className="text-[#0F172A]">{users.length}</strong> total users.
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTenantFilter("All");
                      setSelectedRoleFilter("All");
                      setSelectedStatusFilter("All");
                      setSelectedMfaFilter("All");
                      setSelectedLoginFilter("All");
                      setSelectedDateRange("All");
                      triggerToast("Filter parameters cleared.", "info");
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    Clear Filter Parameters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMPONENT SUB-SECTIONS / TAB ROW */}
      <div className="border-b border-slate-200 flex items-center justify-between" id="sub-panel-tabs">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTabSub("users")}
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer relative ${
              activeTabSub === "users" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Directory List ({filteredUsers.length})
            {activeTabSub === "users" && <motion.div layoutId="subtab_underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
          </button>
          
          <button 
            onClick={() => setActiveTabSub("invitations")}
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer relative ${
              activeTabSub === "invitations" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending Invites ({invitations.filter(i => i.status === "Pending").length})
            {activeTabSub === "invitations" && <motion.div layoutId="subtab_underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
          </button>

          <button 
            onClick={() => setActiveTabSub("activity")}
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer relative ${
              activeTabSub === "activity" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Live Activity ({activities.length})
            {activeTabSub === "activity" && <motion.div layoutId="subtab_underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium pb-3 hidden sm:block">
          Database replica status: <span className="font-mono text-emerald-600 font-bold">Optimal (4ms)</span>
        </div>
      </div>

      {/* CORE RENDER ACCORDING TO SUB-TAB */}
      <AnimatePresence mode="wait">
        
        {/* TAB: DIRECTORY LIST */}
        {activeTabSub === "users" && (
          <motion.div 
            key="users_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* BULK ACTION BAR */}
            {selectedRowIds.length > 0 && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-950 text-white rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md border border-indigo-900"
                id="bulk-action-bar"
              >
                <div className="flex items-center gap-2 px-1 text-xs">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>
                    Selected <strong className="text-indigo-300 font-black">{selectedRowIds.length}</strong> user records. Choose bulk operation:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setModalAction({ type: "bulk_suspend" })}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Ban className="w-3 h-3" />
                    Suspend Accounts
                  </button>
                  <button 
                    onClick={() => setModalAction({ type: "bulk_unsuspend" })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Activate Accounts
                  </button>
                  <button 
                    onClick={() => setModalAction({ type: "bulk_mfa" })}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Unlock className="w-3 h-3" />
                    Reset MFA Config
                  </button>
                  <div className="h-4 w-px bg-indigo-800 mx-1 hidden md:block"></div>
                  <button 
                    onClick={() => setSelectedRowIds([])}
                    className="px-3 py-1.5 bg-transparent hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold rounded-md transition-all cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </motion.div>
            )}

            {/* ERROR SIMULATION BOX */}
            {isSimulatingError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center" id="error-simulation-box">
                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="text-sm font-bold text-rose-900 mt-2">Database Directory Load Error</h4>
                <p className="text-xs text-rose-600 mt-1 max-w-lg mx-auto">{simulationErrorMessage}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button 
                    onClick={() => handleManualRefresh()}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry LDAP sync
                  </button>
                  <button 
                    onClick={() => setIsSimulatingError(false)}
                    className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Bypass Error
                  </button>
                </div>
              </div>
            )}

            {/* LOADING SIMULATION BOX */}
            {isSimulatingLoading && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-3xs" id="loading-simulation-box">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold font-mono uppercase tracking-widest mt-4">Syncing AD catalogs...</p>
                <p className="text-[11px] text-slate-400 mt-1">Acquiring authentication tokens and matching cross-tenant identities</p>
              </div>
            )}

            {/* CORE USERS TABLE (Only show if not error or loading) */}
            {!isSimulatingError && !isSimulatingLoading && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs" id="directory-table-card">
                
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center" id="no-results-state">
                    <Search className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700 mt-2">No Directory Records Found</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      No user records matched the current filter constraints. Clear filters or add a new onboarding welcome invitation.
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      <button 
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedTenantFilter("All");
                          setSelectedRoleFilter("All");
                          setSelectedStatusFilter("All");
                          setSelectedMfaFilter("All");
                          setSelectedLoginFilter("All");
                          setSelectedDateRange("All");
                        }}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Reset Filters
                      </button>
                      <button 
                        onClick={() => setShowCreateForm(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Invite New Identity
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto relative" id="table-scroll-container">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      
                      {/* Sticky Header */}
                      <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-200 sticky top-0 z-10" id="table-header">
                        <tr>
                          {/* Selection Checkbox */}
                          <th className="py-3 px-4 w-10">
                            <input 
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={filteredUsers.length > 0 && selectedRowIds.length === filteredUsers.length}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("name")}>
                            <div className="flex items-center gap-1">
                              User / Identity
                              {sortField === "name" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("tenantName")}>
                            <div className="flex items-center gap-1">
                              Tenant Workspace
                              {sortField === "tenantName" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("role")}>
                            <div className="flex items-center gap-1">
                              System Role
                              {sortField === "role" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("status")}>
                            <div className="flex items-center gap-1">
                              Status
                              {sortField === "status" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("mfaEnabled")}>
                            <div className="flex items-center gap-1">
                              MFA Security
                              {sortField === "mfaEnabled" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort("lastLogin")}>
                            <div className="flex items-center gap-1">
                              Last Activity
                              {sortField === "lastLogin" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 cursor-pointer select-none hidden xl:table-cell" onClick={() => handleSort("createdDate")}>
                            <div className="flex items-center gap-1">
                              Created Date
                              {sortField === "createdDate" ? (sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>

                      {/* Table Rows */}
                      <tbody className="divide-y divide-slate-100 font-sans" id="table-body">
                        {filteredUsers.map((user) => {
                          const isSelected = selectedRowIds.includes(user.id);
                          return (
                            <tr 
                              key={user.id} 
                              className={`group hover:bg-slate-50/70 transition-colors ${
                                isSelected ? "bg-indigo-50/40 hover:bg-indigo-50/60" : ""
                              } ${user.status === "Suspended" ? "opacity-75" : ""}`}
                            >
                              {/* Selection Checkbox */}
                              <td className="py-3 px-4">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleSelectRow(user.id, e.target.checked)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                />
                              </td>

                              {/* Identity profile */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={user.avatarUrl} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full border border-slate-200 shrink-0 object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <button 
                                        onClick={() => handleOpenDrawer(user)}
                                        className="font-bold text-slate-800 hover:text-indigo-600 transition-colors text-left bg-transparent border-none outline-none cursor-pointer"
                                      >
                                        {user.name}
                                      </button>
                                      {user.role === "Superadmin" && (
                                        <Shield className="w-3 h-3 text-indigo-600 shrink-0" aria-label="Linely Root Superadmin" />
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{user.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Tenant */}
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                                  user.tenantId === "SYSTEM" 
                                    ? "bg-purple-50 text-purple-700 border border-purple-100" 
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  <Building className="w-2.5 h-2.5 text-slate-400" />
                                  {user.tenantName}
                                </span>
                              </td>

                              {/* Role */}
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black border uppercase tracking-wider ${
                                  user.role === "Superadmin" 
                                    ? "bg-purple-900/10 text-purple-700 border-purple-200"
                                    : user.role === "Tenant Owner" 
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                      : user.role === "Admin"
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : user.role === "Auditor"
                                          ? "bg-slate-100 text-slate-700 border-slate-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                }`}>
                                  {user.role}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.status === "Active" 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : user.status === "Suspended"
                                      ? "bg-rose-50 text-rose-700 border border-rose-100"
                                      : "bg-amber-50 text-amber-700"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    user.status === "Active" 
                                      ? "bg-emerald-500" 
                                      : user.status === "Suspended"
                                        ? "bg-rose-500"
                                        : "bg-amber-500"
                                  }`} />
                                  {user.status}
                                </span>
                              </td>

                              {/* MFA */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  {user.mfaEnabled ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold" title={user.mfaType}>
                                      <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                      Secured
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-mono font-bold" title="No MFA enrolled">
                                      <Unlock className="w-2.5 h-2.5 text-rose-400" />
                                      Vulnerable
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Last activity */}
                              <td className="py-3 px-4 font-mono font-bold text-slate-500">
                                {user.lastLogin}
                              </td>

                              {/* Created Date */}
                              <td className="py-3 px-4 font-mono font-bold text-slate-400 hidden xl:table-cell">
                                {user.createdDate}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right relative">
                                <div className="flex items-center justify-end gap-1">
                                  
                                  <button 
                                    onClick={() => handleOpenDrawer(user)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="View credentials & session metadata"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  <button 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setModalAction({
                                        type: user.status === "Suspended" ? "unsuspend" : "suspend",
                                        targetId: user.id,
                                        targetName: user.name
                                      });
                                    }}
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      user.status === "Suspended" 
                                        ? "text-emerald-500 hover:bg-emerald-50" 
                                        : "text-rose-500 hover:bg-rose-50"
                                    }`}
                                    title={user.status === "Suspended" ? "Reinstate Account" : "Suspend Account"}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>

                                  <button 
                                    onClick={() => {
                                      setModalAction({
                                        type: "delete",
                                        targetId: user.id,
                                        targetName: user.name
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Delete Identity Credentials"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>
                )}

                {/* Dense Footer details */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono text-slate-500" id="table-footer-meta">
                  <div className="flex items-center gap-3">
                    <span>Page 1 of 1</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Total matching: {filteredUsers.length} records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-400">Directory Connection:</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px]">LDAP Sync Active</span>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* TAB: PENDING INVITATIONS */}
        {activeTabSub === "invitations" && (
          <motion.div 
            key="invitations_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs" id="invitations-table-wrapper">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-sm font-bold text-slate-800">Pending Registration Outbox</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Invitations generated by staff. Active welcome sequences expire in 72 hours.</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-mono font-bold rounded-md border border-amber-200">
                  {invitations.filter(i => i.status === "Pending").length} PENDING LINK CONTEXTS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Target Email</th>
                      <th className="py-3 px-5">Tenant Target</th>
                      <th className="py-3 px-5">Assigned Role</th>
                      <th className="py-3 px-5">Invited By</th>
                      <th className="py-3 px-5">Dispatched At</th>
                      <th className="py-3 px-5">Expires</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-xs">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-800 font-mono">
                          {inv.email}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-slate-600">{inv.tenantName}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-sm font-mono text-[9px] uppercase font-bold border border-slate-200">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium">
                          {inv.invitedBy}
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 font-mono">
                          {inv.sentAt}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                            inv.status === "Expired" 
                              ? "bg-rose-50 text-rose-600" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {inv.expiresAt}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setModalAction({
                                  type: "resend_invite",
                                  targetId: inv.id,
                                  targetName: inv.email
                                });
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                              disabled={inv.status === "Expired"}
                            >
                              Resend Welcome Mail
                            </button>
                            <button 
                              onClick={() => {
                                setInvitations(prev => prev.filter(i => i.id !== inv.id));
                                addAuditLog(`Revoked pending invitation and link expiration`, inv.email, "Warning");
                                triggerToast("Onboarding link revoked.", "info");
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Revoke Invitation link"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: LIVE ACTIVITY */}
        {activeTabSub === "activity" && (
          <motion.div 
            key="activity_tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs" id="activity-logs-table-wrapper">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-sm font-bold text-slate-800">Operational Security Event Log</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time trace of token acquisitions, metadata updates, and support bypass triggers.</p>
                </div>
                <button 
                  onClick={() => {
                    setActivities([
                      {
                        id: `act-${Date.now().toString().slice(-3)}`,
                        userId: "usr-109",
                        userName: "Sarah Connor",
                        action: "Initiated manual directory LDAP resynchronization pool",
                        ipAddress: "10.0.0.1",
                        location: "Global Admin Terminal",
                        timestamp: "Just now",
                        device: "Firefox Dev Linux"
                      },
                      ...activities
                    ]);
                    triggerToast("Simulated audit action injected.", "info");
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simulate Activity Audit
                </button>
              </div>

              <div className="divide-y divide-slate-100 font-sans" id="activities-event-list">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 sm:p-5 hover:bg-slate-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-normal">{act.action}</p>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400 mt-1 font-mono">
                          <span className="font-sans font-semibold text-slate-500">Actor: {act.userName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>IP: {act.ipAddress}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Locale: {act.location}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Agent: {act.device}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-[11px] text-slate-400 font-bold">
                      {act.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* COMPACT CREATE ONBOARDING MODAL/FORM */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
              id="create-user-modal-box"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-base font-bold text-brand-navy">Onboard New Tenant Identity</h3>
                  <p className="text-[11px] text-slate-400">Issues security credentials and generates welcome link flow.</p>
                </div>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs font-sans">
                
                {/* Full name */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter user's first and last name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Corporate Email *</label>
                  <input 
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Select Tenant */}
                  <div>
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Workspace Tenant *</label>
                    <select 
                      required
                      value={newUser.tenantId}
                      onChange={(e) => setNewUser(prev => ({ ...prev, tenantId: e.target.value }))}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Choose target...</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>
                      ))}
                    </select>
                  </div>

                  {/* System Role */}
                  <div>
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">System Role *</label>
                    <select 
                      required
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as SaasUser["role"] }))}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      <option value="Tenant Owner">Tenant Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Operator">Operator</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Superadmin">Superadmin</option>
                    </select>
                  </div>

                </div>

                {/* Optional Phone */}
                <div>
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">Phone Number</label>
                  <input 
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* MFA Enrollment setting */}
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center justify-between">
                  <div className="pr-4">
                    <p className="font-bold text-slate-700 leading-none">Enforce Initial MFA</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">Requires authenticator loop setup during initial profile password definition.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={newUser.mfaEnabled}
                    onChange={(e) => setNewUser(prev => ({ ...prev, mfaEnabled: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {newUser.mfaEnabled && (
                  <div>
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase block mb-1">MFA Method Selection</label>
                    <select 
                      value={newUser.mfaType}
                      onChange={(e) => setNewUser(prev => ({ ...prev, mfaType: e.target.value as SaasUser["mfaType"] }))}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      <option value="Authenticator App">Authenticator App (TOTP)</option>
                      <option value="FIDO2 WebAuthn">FIDO2 Hardware Key (WebAuthn)</option>
                      <option value="SMS Backup">SMS Backup Code OTP</option>
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="h-9 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    Generate & Send Invite
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {modalAction && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full overflow-hidden shadow-2xl"
              id="confirm-modal-box"
            >
              <div className="p-5 flex items-start gap-3">
                <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-full shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-outfit text-sm font-bold text-[#0F172A] leading-tight">
                    {modalAction.type === "delete" && "Confirm Permanent Credentials Deletion"}
                    {modalAction.type === "suspend" && "Confirm Credentials Suspension"}
                    {modalAction.type === "unsuspend" && "Confirm Workspace Reinstation"}
                    {modalAction.type === "reset_mfa" && "Confirm Security MFA Flush"}
                    {modalAction.type === "resend_invite" && "Resend Welcome Invite Invitation"}
                    {modalAction.type === "bulk_suspend" && `Bulk Suspend ${selectedRowIds.length} Accounts`}
                    {modalAction.type === "bulk_unsuspend" && `Bulk Activate ${selectedRowIds.length} Accounts`}
                    {modalAction.type === "bulk_mfa" && `Bulk Reset MFA for ${selectedRowIds.length} Accounts`}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-sans">
                    {modalAction.type === "delete" && `Are you absolutely sure you want to permanently delete credentials for "${modalAction.targetName}"? This completely revokes active login contexts and flushes local logs.`}
                    {modalAction.type === "suspend" && `This will immediately terminate all active sessions, invalidate current JWT payloads, and lock login attempts for "${modalAction.targetName}".`}
                    {modalAction.type === "unsuspend" && `This will restore the credentials for "${modalAction.targetName}" back to active status, allowing immediate authentication.`}
                    {modalAction.type === "reset_mfa" && `This flushes the registered multi-factor authenticator token for "${modalAction.targetName}". The user will be required to enroll a new credential upon next login.`}
                    {modalAction.type === "resend_invite" && `Generates a new welcome token and dispatches a verification invite to ${modalAction.targetName}. Stale invite codes will be invalidated.`}
                    {modalAction.type.startsWith("bulk_") && `This action will process ${selectedRowIds.length} users and is audited under compliance rules. Confirm to commit state transitions.`}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button 
                  onClick={() => setModalAction(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeModalAction}
                  className={`px-3.5 py-1.5 text-white font-black rounded-lg transition-all cursor-pointer shadow-3xs ${
                    modalAction.type === "unsuspend" || modalAction.type === "resend_invite" || modalAction.type === "bulk_unsuspend"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER DETAIL SIDE DRAWER (PREMIUM CONTROL PANEL) */}
      <AnimatePresence>
        {isDrawerOpen && selectedUser && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-3xs z-40" 
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Side Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col z-40 outline-hidden"
              id="user-detail-drawer"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-outfit text-base font-bold text-brand-navy">Identity Management Profile</h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
                
                {/* 1. PROFILE SUMMARY HEADER */}
                <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                  <img 
                    src={selectedUser.avatarUrl} 
                    alt={selectedUser.name} 
                    className="w-16 h-16 rounded-full border border-slate-200 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-outfit text-lg font-black text-brand-navy leading-snug">{selectedUser.name}</h4>
                    <p className="text-slate-500 font-medium font-mono leading-none mt-1">{selectedUser.email}</p>
                    
                    {/* User ID copy row */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 font-bold select-all">
                        ID: {selectedUser.id}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedUser.id);
                          triggerToast("User ID copied to clipboard.", "success");
                        }}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        title="Copy User ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. SECURITY STATUS BADGE GRID */}
                <div className="grid grid-cols-2 gap-3" id="drawer-security-summary">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">MFA ENROLLMENT</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {selectedUser.mfaEnabled ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-emerald-700 font-sans">{selectedUser.mfaType}</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-500" />
                          <span className="font-bold text-rose-700 font-sans">None (Vulnerable)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">CREDENTIAL AGE</p>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedUser.lastPasswordChange}</span>
                    </div>
                  </div>
                </div>

                {/* 3. TENANT MEMBERSHIP */}
                <div>
                  <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2">Workspace context</h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A] leading-none">{selectedUser.tenantName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Workspace ID: {selectedUser.tenantId}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full font-mono text-[9px] font-bold uppercase tracking-wide">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {/* 4. EXPLICIT ROLE & PERMISSIONS MAPPING */}
                <div>
                  <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2">Assigned IAM Claims</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {selectedUser.permissions.map((perm, idx) => (
                      <div key={idx} className="p-2.5 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono text-[11px] text-slate-600 font-bold">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. ACTIVE SESSION DATA */}
                <div>
                  <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2">Metadata / Last Session Log</h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">IP Address</span>
                      <span className="text-slate-700 font-bold">{selectedUser.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Client Agent</span>
                      <span className="text-slate-700 font-bold truncate max-w-[240px]" title={selectedUser.browser}>{selectedUser.browser}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Failed Authentication Counts</span>
                      <span className={`font-bold ${selectedUser.failedLoginAttempts > 2 ? "text-rose-600" : "text-slate-700"}`}>
                        {selectedUser.failedLoginAttempts} failed attempts
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. COMPLIANCE IMPERSONATION OVERRIDE */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 leading-none">Security Impersonation Pipeline</p>
                      <p className="text-[10px] text-amber-700 mt-1 leading-snug">
                        Simulates a secure token hijack, allowing superadmins to act as this user. Legal compliance requires documenting an audited reason beforehand.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleImpersonateSubmit} className="space-y-2">
                    <input 
                      type="text"
                      placeholder="e.g., ticket-9102 resolution confirmation..."
                      value={impersonateReason}
                      onChange={(e) => {
                        setImpersonateReason(e.target.value);
                        if (e.target.value.trim().length >= 8) setImpersonateError("");
                      }}
                      className="w-full h-8 px-3 bg-white border border-slate-200 rounded-md text-[11px] font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-amber-500 transition-colors"
                    />
                    {impersonateError && (
                      <p className="text-[10px] text-rose-600 font-semibold">{impersonateError}</p>
                    )}
                    <button 
                      type="submit"
                      disabled={selectedUser.status === "Suspended"}
                      className={`w-full h-8 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs text-[11px]`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Audited Impersonate Session
                    </button>
                  </form>
                </div>

                {/* 7. SUPPORT NOTES (CS TEAM COLLAB) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">Internal CS Collaborations</h4>
                    <span className="text-[10px] text-slate-400">Restricted to Superadmin / Support Staff</span>
                  </div>
                  <textarea 
                    rows={3}
                    placeholder="Enter customer support notes, special bypass configurations, or warning logs here..."
                    value={supportNoteText}
                    onChange={(e) => setSupportNoteText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={handleSaveSupportNote}
                    className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-3xs"
                  >
                    Save Notes Meta
                  </button>
                </div>

                {/* 8. PROFILE AUDIT ACTIONS BUTTONS */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2">Destructive Security Controls</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setModalAction({
                        type: selectedUser.status === "Suspended" ? "unsuspend" : "suspend",
                        targetId: selectedUser.id,
                        targetName: selectedUser.name
                      })}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-3xs ${
                        selectedUser.status === "Suspended" 
                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"
                      }`}
                    >
                      {selectedUser.status === "Suspended" ? "Reactivate Workspace Account" : "Suspend Active Credentials"}
                    </button>

                    <button 
                      onClick={() => setModalAction({
                        type: "reset_mfa",
                        targetId: selectedUser.id,
                        targetName: selectedUser.name
                      })}
                      className="px-3.5 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg transition-all cursor-pointer shadow-3xs"
                      disabled={!selectedUser.mfaEnabled}
                    >
                      Bypass & Reset MFA
                    </button>

                    <button 
                      onClick={() => setModalAction({
                        type: "delete",
                        targetId: selectedUser.id,
                        targetName: selectedUser.name
                      })}
                      className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-600 rounded-lg transition-all cursor-pointer shadow-3xs"
                    >
                      Permanently Purge Profile
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

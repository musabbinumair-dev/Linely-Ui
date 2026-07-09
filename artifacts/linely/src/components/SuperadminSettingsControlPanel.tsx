import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Languages,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Cpu,
  Sliders,
  Info,
  ChevronRight,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Check,
  Search,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  SlidersHorizontal,
  LogOut,
  UserCheck
} from "lucide-react";

// Types for settings categories
export type SettingsTabId =
  | "account"
  | "org"
  | "notifications"
  | "security"
  | "lang"
  | "appearance"
  | "permissions"
  | "integrations"
  | "advanced"
  | "about";

interface SettingsCategory {
  id: SettingsTabId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  currentValLabel?: string;
  colorClass: string;
}

interface SuperadminSettingsControlPanelProps {
  addAuditLog: (action: string, target: string, severity: "Info" | "Warning" | "Critical") => void;
  triggerToast: (message: string, type: "success" | "info" | "warning" | "error") => void;
}

export default function SuperadminSettingsControlPanel({
  addAuditLog,
  triggerToast
}: SuperadminSettingsControlPanelProps) {
  // Navigation & Screen state
  // On desktop, we display side-by-side list & subscreen. On mobile, we slide to the subscreen.
  const [selectedCategoryId, setSelectedCategoryId] = useState<SettingsTabId>("account");
  const [isMobileSubscreenOpen, setIsMobileSubscreenOpen] = useState<boolean>(false);

  // Settings State Data
  // 1. Account State
  const [profileName, setProfileName] = useState("Sarah Connor");
  const [profileEmail, setProfileEmail] = useState("sarah.connor@linely.com");
  const [profilePhone, setProfilePhone] = useState("+1 (555) 349-1090");
  const [profilePassword, setProfilePassword] = useState("••••••••••••••••");
  const [connectedDevices, setConnectedDevices] = useState([
    { id: "dev-1", name: "Apple MacBook Pro M3 (San Francisco, CA)", active: true },
    { id: "dev-2", name: "Google Pixel 8 Pro (Seattle, WA)", active: false }
  ]);

  // 2. Organization State
  const [orgName, setOrgName] = useState("Linely Technologies QMS");
  const [orgLogoUrl, setOrgLogoUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80");
  const [supportEmail, setSupportEmail] = useState("support@linely.com");
  const [contactPhone, setContactPhone] = useState("+1 (800) 555-0199");
  const [timezone, setTimezone] = useState("UTC -07:00 (Pacific Time)");
  const [countryRegion, setCountryRegion] = useState("United States");
  const [defaultLanguage, setDefaultLanguage] = useState("English (US)");

  // 3. Notifications State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [ticketAlerts, setTicketAlerts] = useState(true);
  const [billingAlerts, setBillingAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(false);
  const [notificationSound, setNotificationSound] = useState("Crystal Wave");
  const [quietHours, setQuietHours] = useState(true);

  // 4. Security State
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [requireStrongPassword, setRequireStrongPassword] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginAttemptsLimit, setLoginAttemptsLimit] = useState(5);
  const [trustedDevices, setTrustedDevices] = useState(true);
  const [ipAllowlist, setIpAllowlist] = useState("192.168.1.1, 10.0.0.0/16");
  const [activeSessionsCount, setActiveSessionsCount] = useState(2);

  // 5. Language & Region State
  const [appLanguage, setAppLanguage] = useState("English (US)");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState("12-Hour (AM/PM)");
  const [currency, setCurrency] = useState("USD ($)");
  const [weekStart, setWeekStart] = useState("Monday");
  const [locale, setLocale] = useState("en-US");

  // 6. Appearance State
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [sidebarDensity, setSidebarDensity] = useState<"Classic" | "Condensed" | "Minimal">("Classic");
  const [fontSize, setFontSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [accentColor, setAccentColor] = useState<"blue" | "emerald" | "indigo" | "rose">("blue");
  const [compactMode, setCompactMode] = useState(true);

  // 7. Permissions State
  const [defaultRoleNewUsers, setDefaultRoleNewUsers] = useState<"Viewer" | "Operator" | "Quality Manager">("Quality Manager");
  const [invitationApprovalRequired, setInvitationApprovalRequired] = useState(true);
  const [roleAssignmentRules, setRoleAssignmentRules] = useState("Strict-Policy-Lock");
  const [adminAccessControls, setAdminAccessControls] = useState("Dual-Signature-Verify");
  const [tenantScope, setTenantScope] = useState("Restricted-Isolated");

  // 8. Integrations State
  const [emailProvider, setEmailProvider] = useState("SendGrid SMTP");
  const [smsProvider, setSmsProvider] = useState("Twilio Gateway");
  const [whatsappProvider, setWhatsappProvider] = useState("Twilio API");
  const [paymentGateway, setPaymentGateway] = useState("Stripe Connect");
  const [webhooksCount, setWebhooksCount] = useState(3);
  const [apiAccessEnabled, setApiAccessEnabled] = useState(true);

  // 9. Advanced State
  const [apiKey, setApiKey] = useState("sk_live_51O2aB2F891h2jKls902Klsa8912JskL");
  const [showApiKey, setShowApiKey] = useState(false);
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    triggerToast("API Key copied to clipboard.", "success");
  };
  const [isAiAssistanceEnabled, setIsAiAssistanceEnabled] = useState(true);
  const [isExpImpersonationEnabled, setIsExpImpersonationEnabled] = useState(false);
  const [developerLogsEnabled, setDeveloperLogsEnabled] = useState(false);
  const [developerToolsEnabled, setDeveloperToolsEnabled] = useState(false);

  // Interface State Switchers (requested boundary states)
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const [isSimulatingEmpty, setIsSimulatingEmpty] = useState(false);
  const [isSimulatingValidationError, setIsSimulatingValidationError] = useState(false);
  const [isSimulatingSaveSuccess, setIsSimulatingSaveSuccess] = useState(false);
  const [isSimulatingSaveFailure, setIsSimulatingSaveFailure] = useState(false);
  const [isSimulatingPermissionDenied, setIsSimulatingPermissionDenied] = useState(false);

  // Confirmations Modals
  const [confirmModalType, setConfirmModalType] = useState<"delete_account" | "reset_system" | "clear_cache" | "logout_devices" | null>(null);

  // Filter categories search
  const [searchQuery, setSearchQuery] = useState("");

  // Category List configuration
  const categories: SettingsCategory[] = [
    {
      id: "account",
      title: "Account",
      subtitle: "Profile name, email, credentials, password",
      icon: User,
      currentValLabel: "Sarah Connor",
      colorClass: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: "org",
      title: "Organization",
      subtitle: "Company parameters, timezone, default country",
      icon: Building2,
      currentValLabel: orgName,
      colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Push alerts, system notifications, quiet hours",
      icon: Bell,
      currentValLabel: pushEnabled ? "Active" : "Paused",
      colorClass: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      id: "security",
      title: "Security & Encryption",
      subtitle: "Multifactor auth, password standards, IP locks",
      icon: Shield,
      currentValLabel: mfaEnabled ? "MFA Secure" : "Unsecure",
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      id: "lang",
      title: "Language & Region",
      subtitle: "Default locale, date formats, currencies",
      icon: Languages,
      currentValLabel: "en-US",
      colorClass: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      id: "appearance",
      title: "Appearance",
      subtitle: "Interface theme, font weights, sidebar layouts",
      icon: Eye,
      currentValLabel: "Light Mode",
      colorClass: "bg-pink-50 text-pink-600 border-pink-100"
    },
    {
      id: "permissions",
      title: "Permissions & Rules",
      subtitle: "New account rules, automated sign-offs, roles",
      icon: UserCheck,
      currentValLabel: "Strict Lock",
      colorClass: "bg-teal-50 text-teal-600 border-teal-100"
    },
    {
      id: "integrations",
      title: "Integrations & Bridges",
      subtitle: "SMTP dispatch, Twilio SMS node, Stripe checkout",
      icon: Cpu,
      currentValLabel: "Active connections",
      colorClass: "bg-cyan-50 text-cyan-600 border-cyan-100"
    },
    {
      id: "advanced",
      title: "Advanced / Developer",
      subtitle: "Global API keys, feature flags, developer shell",
      icon: Sliders,
      currentValLabel: "sk_live_...",
      colorClass: "bg-slate-100 text-slate-700 border-slate-200"
    },
    {
      id: "about",
      title: "About Platform",
      subtitle: "Release version, core schemas, legal licenses",
      icon: Info,
      currentValLabel: "v1.4.2",
      colorClass: "bg-rose-50 text-rose-600 border-rose-100"
    }
  ];

  // Filtered Categories based on Search Box
  const filteredCategories = useMemo(() => {
    return categories.filter(
      c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle immediate state changes / toggle updates
  const handleToggleChange = (settingLabel: string, prevValue: boolean, setter: (v: boolean) => void) => {
    if (isSimulatingPermissionDenied) {
      triggerToast("Permission Denied: Your current administrator tier cannot modify this flag.", "error");
      return;
    }
    const nextVal = !prevValue;
    setter(nextVal);
    triggerToast(`Setting "${settingLabel}" updated immediately.`, "success");
    addAuditLog(`Toggled configuration state: ${settingLabel} = ${nextVal ? "ON" : "OFF"}`, "System Configuration", "Info");
  };

  // Simulated Save Form action for text/select updates
  const handleSaveChanges = () => {
    if (isSimulatingValidationError) {
      triggerToast("Form validation failed: Core address and phone format must meet regional ISO standard.", "error");
      return;
    }
    if (isSimulatingSaveFailure) {
      triggerToast("Save transaction aborted. Gateway downstream service was unavailable.", "error");
      return;
    }

    setIsSimulatingSaveSuccess(true);
    setTimeout(() => {
      setIsSimulatingSaveSuccess(false);
      triggerToast("Configuration database updated successfully.", "success");
      addAuditLog(`Committed changes to category: ${selectedCategoryId.toUpperCase()}`, "Superadmin Operations", "Info");
    }, 700);
  };

  // Perform destructive resets and confirmations
  const executeDestructiveAction = () => {
    if (confirmModalType === "delete_account") {
      triggerToast("Simulated self-destruction protocol: Superadmin account cleared from primary replica.", "error");
      addAuditLog("Superadmin user initiated profile self-deletion sequence", "Security Auth", "Critical");
    } else if (confirmModalType === "reset_system") {
      setOrgName("Linely Technologies QMS");
      setPushEnabled(true);
      setEmailEnabled(true);
      setSmsEnabled(false);
      setMfaEnabled(true);
      setThemeMode("light");
      setCompactMode(true);
      setIsAiAssistanceEnabled(true);
      setIsExpImpersonationEnabled(false);
      triggerToast("Hard system parameters reset to production master template.", "info");
      addAuditLog("Triggered hard factory reset of all superadmin parameters", "Platform Config", "Critical");
    } else if (confirmModalType === "clear_cache") {
      triggerToast("System memory cache registers purged successfully.", "success");
      addAuditLog("Flushed platform level redis and server cluster memory cache", "System Performance", "Info");
    } else if (confirmModalType === "logout_devices") {
      setConnectedDevices([
        { id: "dev-1", name: "Apple MacBook Pro M3 (San Francisco, CA)", active: true }
      ]);
      triggerToast("Logged out of all secondary devices. Current local device remains active.", "info");
      addAuditLog("Purged secondary active authorization tokens for operator", "Security Credentials", "Warning");
    }
    setConfirmModalType(null);
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans antialiased bg-[#F8FAFC] p-1 sm:p-5 rounded-3xl border border-slate-200" id="SettingsPage">
      
      {/* 1. STATE SIMULATORS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-3xs" id="settings-mobile-dev-tools">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wide">Boundary State Simulators</span>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <span className="text-[11px] text-slate-400 font-semibold">Test UI states specified in system guidelines:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setIsSimulatingLoading(prev => !prev);
              if (!isSimulatingLoading) triggerToast("Loading state initialized.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingLoading ? "bg-blue-600 text-white border-blue-700 shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isSimulatingLoading ? "● Loading: ON" : "Loading"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingEmpty(prev => !prev);
              triggerToast(isSimulatingEmpty ? "Preferences loaded." : "Blank configuration state simulation.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingEmpty ? "bg-slate-800 text-white border-slate-900 shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isSimulatingEmpty ? "● Empty Preferences: ON" : "Empty State"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingValidationError(prev => !prev);
              triggerToast(isSimulatingValidationError ? "Form parameters validated." : "Form validation failure simulated.", "warning");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingValidationError ? "bg-amber-500 text-white border-amber-600 shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50"
            }`}
          >
            {isSimulatingValidationError ? "● Valid Error: ON" : "Validation Error"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingSaveFailure(prev => !prev);
              triggerToast(isSimulatingSaveFailure ? "Downstream gateways normal." : "Downstream gateway block active.", "error");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingSaveFailure ? "bg-rose-500 text-white border-rose-600 shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-rose-50"
            }`}
          >
            {isSimulatingSaveFailure ? "● Commit Fail: ON" : "Save Failure"}
          </button>

          <button
            onClick={() => {
              setIsSimulatingPermissionDenied(prev => !prev);
              triggerToast(isSimulatingPermissionDenied ? "Admin privileges active." : "Operator access restrictions active.", "warning");
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isSimulatingPermissionDenied ? "bg-purple-600 text-white border-purple-700 shadow-xs" : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50"
            }`}
          >
            {isSimulatingPermissionDenied ? "● Perm Denied: ON" : "Permission Denied"}
          </button>
        </div>
      </div>

      {/* 2. STATE CODES / OVERLAYS */}
      {isSimulatingPermissionDenied ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-3xs max-w-md mx-auto my-12" id="simulated-settings-denied">
          <div className="w-14 h-14 bg-purple-50 border border-purple-200 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-sans text-slate-900 tracking-tight uppercase">SUPERADMIN SIGNATURE INVALID</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed font-semibold">
            Your cryptographic token lacks the <code className="bg-slate-100 text-purple-700 px-1 py-0.5 rounded font-mono text-[10px]">global:settings:commit</code> scope. Contact your security administrator.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setIsSimulatingPermissionDenied(false);
                triggerToast("Root privileges assumed.", "success");
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer"
            >
              Elevate Credentials
            </button>
          </div>
        </div>
      ) : isSimulatingLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-3xs max-w-sm mx-auto my-12" id="simulated-settings-loading">
          <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-800">Synchronizing Local Database</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed font-semibold">
            Fetching secure key parameters from multi-tenant hardware cryptographic keys...
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto" id="SettingsHome">
          
          {!isMobileSubscreenOpen ? (
            /* FULL-WIDTH SETTINGS CATEGORIES LIST */
            <div className="space-y-6" id="SettingsCategoryList">
              {/* Headerless Search & Action Bar */}
              <div className="flex items-center gap-3 animate-fade-in" id="SettingsHeader">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search settings, keys, flags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <button
                  onClick={() => setConfirmModalType("reset_system")}
                  className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 hover:text-rose-600 font-bold border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>

              {/* List of Mobile-style Full-width Settings Rows (SettingsCategoryRow) - Borderless container */}
              <div className="divide-y divide-slate-150 overflow-hidden" id="SettingsCategoryRow">
                {filteredCategories.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                    No settings categories found matching query.
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const IconComponent = cat.icon;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setIsMobileSubscreenOpen(true);
                        }}
                        className="w-full py-4 px-2 flex items-center justify-between text-left hover:bg-slate-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Circle Icon Badge */}
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-3xs group-hover:scale-105 transition-transform ${cat.colorClass}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          {/* Title and short text */}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{cat.title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">{cat.subtitle}</p>
                          </div>
                        </div>

                        {/* Current Value Preview on Right + Chevron */}
                        <div className="flex items-center gap-3 shrink-0 pl-2">
                          {cat.currentValLabel && (
                            <span className="text-[10px] font-mono font-bold bg-slate-50 border border-slate-200/80 text-slate-500 px-2.5 py-1 rounded-lg max-w-[150px] truncate">
                              {cat.currentValLabel}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* FULL-WIDTH DETAILED CONFIGURATION SUBSCREEN (SettingsSubScreen) - No card borders */
            <div className="animate-fade-in" id="SettingsSubScreen">
              
              {/* Back Nav Bar (BackNavBar) with Back Navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6" id="BackNavBar">
                <button
                  onClick={() => setIsMobileSubscreenOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Back to Settings</span>
                </button>
              </div>

              {/* Sub-screen contents depending on selected category */}
              {isSimulatingEmpty ? (
                <div className="py-16 text-center text-slate-400" id="settings-blank-view">
                  <Settings className="w-8 h-8 mx-auto mb-3 text-slate-300 animate-spin" />
                  <p className="text-xs">No active configurations committed to disk.</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* 1. ACCOUNT SUBSCREEN */}
                  {selectedCategoryId === "account" && (
                    <div className="space-y-5" id="sub-account">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="TextFieldRow">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">PROFILE NAME</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">EMAIL ADDRESS</label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">PHONE NUMBER</label>
                          <input
                            type="text"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">PASSWORD CREDENTIAL</label>
                          <input
                            type="password"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          {connectedDevices.map((dev) => (
                            <div key={dev.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-semibold text-slate-700">{dev.name}</span>
                              </div>
                              {dev.active ? (
                                <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  Current Device
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-400">Linked</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                        <button
                          onClick={() => setConfirmModalType("logout_devices")}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect Other Devices</span>
                        </button>

                        <button
                          onClick={() => setConfirmModalType("delete_account")}
                          className="px-3.5 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Delete Superadmin Profile
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. ORGANIZATION SUBSCREEN */}
                  {selectedCategoryId === "org" && (
                    <div className="space-y-5" id="sub-org">

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">ORGANIZATION NAME</label>
                          <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                          <img src={orgLogoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block">BRAND LOGO MARK</span>
                            <input
                              type="text"
                              value={orgLogoUrl}
                              onChange={(e) => setOrgLogoUrl(e.target.value)}
                              className="w-full text-[10px] bg-transparent border-0 border-b border-slate-200 focus:border-blue-500 focus:ring-0 p-0 font-mono mt-1 text-slate-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">SUPPORT EMAIL ADDRESS</label>
                            <input
                              type="email"
                              value={supportEmail}
                              onChange={(e) => setSupportEmail(e.target.value)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">CONTACT PHONE</label>
                            <input
                              type="text"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="SelectRow">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">TIME ZONE PROFILE</label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                            >
                              <option>UTC -07:00 (Pacific Time)</option>
                              <option>UTC +00:00 (Greenwich GMT)</option>
                              <option>UTC +01:00 (Paris / Munich)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">OPERATING COUNTRY / REGION</label>
                            <select
                              value={countryRegion}
                              onChange={(e) => setCountryRegion(e.target.value)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                            >
                              <option>United States</option>
                              <option>Germany</option>
                              <option>Singapore</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. NOTIFICATIONS SUBSCREEN */}
                  {selectedCategoryId === "notifications" && (
                    <div className="space-y-4" id="sub-notifications">

                      {/* Mobile Row Styles */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl" id="ToggleRow">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Push Notifications</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Transmit immediate status alerts in superadmin dashboard frame.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Push Notifications", pushEnabled, setPushEnabled)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {pushEnabled ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Email SMTP Dispatches</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automated digest reports and tenant license change statements.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Email SMTP Dispatches", emailEnabled, setEmailEnabled)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {emailEnabled ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">SMS Cellular Alarms</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Urgent pings directly to supervisor mobile terminals.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("SMS Cellular Alarms", smsEnabled, setSmsEnabled)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {smsEnabled ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-bold text-slate-700">Ticket alerts</span>
                            <input type="checkbox" checked={ticketAlerts} onChange={(e)=>setTicketAlerts(e.target.checked)} className="rounded text-blue-600" />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-bold text-slate-700">Billing alerts</span>
                            <input type="checkbox" checked={billingAlerts} onChange={(e)=>setBillingAlerts(e.target.checked)} className="rounded text-blue-600" />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-bold text-slate-700">System alerts</span>
                            <input type="checkbox" checked={systemAlerts} onChange={(e)=>setSystemAlerts(e.target.checked)} className="rounded text-blue-600" />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-bold text-slate-700">Delay alerts</span>
                            <input type="checkbox" checked={delayAlerts} onChange={(e)=>setDelayAlerts(e.target.checked)} className="rounded text-blue-600" />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">ALERT SOUND</label>
                            <select value={notificationSound} onChange={(e)=>setNotificationSound(e.target.value)} className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 h-8">
                              <option>Crystal Wave</option>
                              <option>Bionic Ping</option>
                              <option>Chime</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between pt-5">
                            <span className="text-xs font-bold text-slate-700">Quiet Hours (22:00 - 06:00)</span>
                            <input type="checkbox" checked={quietHours} onChange={(e)=>setQuietHours(e.target.checked)} className="rounded text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. SECURITY SUBSCREEN */}
                  {selectedCategoryId === "security" && (
                    <div className="space-y-4" id="sub-security">

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Enforce Multifactor Authentication (MFA)</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Mandate TOTP/FIDO hardware token logins for administrative access.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Enforce MFA", mfaEnabled, setMfaEnabled)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {mfaEnabled ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Enforce Strong Password Policy</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Strict check: minimum 12 chars, capital, symbols and numbers.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Strong Passwords", requireStrongPassword, setRequireStrongPassword)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {requireStrongPassword ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">SESSION TIMEOUT (MINUTES)</label>
                            <input
                              type="number"
                              value={sessionTimeout}
                              onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 0)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">FAILED ATTEMPTS LIMIT</label>
                            <input
                              type="number"
                              value={loginAttemptsLimit}
                              onChange={(e) => setLoginAttemptsLimit(parseInt(e.target.value) || 0)}
                              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">AUTHORIZED ADMIN IP ALLOWLIST</label>
                          <input
                            type="text"
                            value={ipAllowlist}
                            onChange={(e) => setIpAllowlist(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>Active Operator Sessions: <strong>{activeSessionsCount}</strong></span>
                          <button onClick={()=>triggerToast("Password reset token generated and sent to mailer queue.", "info")} className="text-blue-600 font-bold hover:underline">
                            Request Manual Master Password Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. LANGUAGE & REGION SUBSCREEN */}
                  {selectedCategoryId === "lang" && (
                    <div className="space-y-4" id="sub-lang">

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">APP DISPLAY LANGUAGE</label>
                            <select value={appLanguage} onChange={(e)=>setAppLanguage(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>English (US)</option>
                              <option>Deutsch (DE)</option>
                              <option>Español (ES)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">DATE FORMAT PROFILE</label>
                            <select value={dateFormat} onChange={(e)=>setDateFormat(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>YYYY-MM-DD</option>
                              <option>DD/MM/YYYY</option>
                              <option>MM-DD-YYYY</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">TIME DISPLAY FORMAT</label>
                            <select value={timeFormat} onChange={(e)=>setTimeFormat(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>12-Hour (AM/PM)</option>
                              <option>24-Hour (Military Standard)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">PRIMARY CURRENCY LEDGER</label>
                            <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>USD ($)</option>
                              <option>EUR (€)</option>
                              <option>GBP (£)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">WEEK CALENDAR START DAY</label>
                            <select value={weekStart} onChange={(e)=>setWeekStart(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>Monday</option>
                              <option>Sunday</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">LOCALE KEY</label>
                            <input value={locale} onChange={(e)=>setLocale(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. APPEARANCE SUBSCREEN */}
                  {selectedCategoryId === "appearance" && (
                    <div className="space-y-4" id="sub-appearance">

                      <div className="space-y-4" id="RadioGroupRow">
                        {/* Theme Select */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-2">INTERFACE THEME</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["light", "dark", "system"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => {
                                  setThemeMode(t);
                                  triggerToast(`Theme switched to ${t}.`, "success");
                                }}
                                className={`h-11 border rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                                  themeMode === t ? "bg-blue-50 text-blue-600 border-blue-300" : "bg-white border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {t} Mode
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Density Select */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-2">SIDEBAR LAYOUT DENSITY</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["Classic", "Condensed", "Minimal"] as const).map((d) => (
                              <button
                                key={d}
                                onClick={() => setSidebarDensity(d)}
                                className={`h-9 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  sidebarDensity === d ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-white border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Accent selection */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-2">HIGHLIGHT ACCENT COLOR</label>
                          <div className="flex gap-3">
                            {(["blue", "emerald", "indigo", "rose"] as const).map((col) => (
                              <button
                                key={col}
                                onClick={() => setAccentColor(col)}
                                className={`w-7 h-7 rounded-full transition-all border flex items-center justify-center cursor-pointer ${
                                  col === "blue" ? "bg-blue-500" : col === "emerald" ? "bg-emerald-500" : col === "indigo" ? "bg-indigo-500" : "bg-rose-500"
                                } ${accentColor === col ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                              >
                                {accentColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Compact Density Spacing Mode</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Reduces page margins to enhance vertical data tables readability.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={compactMode}
                            onChange={(e) => setCompactMode(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. PERMISSIONS SUBSCREEN */}
                  {selectedCategoryId === "permissions" && (
                    <div className="space-y-4" id="sub-permissions">

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1.5">DEFAULT SEAT ASSIGNMENT FOR NEW USERS</label>
                          <select
                            value={defaultRoleNewUsers}
                            onChange={(e: any) => setDefaultRoleNewUsers(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50"
                          >
                            <option value="Viewer">Viewer (Auditing Scope)</option>
                            <option value="Operator">Operator (Operational Scope)</option>
                            <option value="Quality Manager">Quality Manager (Admin Standard)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Explicit Invitation Approval Check</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Require multi-tenant organization keys to undergo review before ticket generation.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Invitation Approval", invitationApprovalRequired, setInvitationApprovalRequired)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {invitationApprovalRequired ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">ROLE ASSIGNMENT ENFORCEMENT</label>
                          <select value={roleAssignmentRules} onChange={(e)=>setRoleAssignmentRules(e.target.value)} className="w-full text-xs font-semibold bg-slate-50 h-9 rounded-lg border border-slate-200">
                            <option value="Strict-Policy-Lock">Strict Policy Lock (Verify domains matching tenants)</option>
                            <option value="Permissive-Open">Permissive Invite (Any email domain permitted)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">ADMIN PORTAL ACCESS CODE</label>
                            <select value={adminAccessControls} onChange={(e)=>setAdminAccessControls(e.target.value)} className="w-full text-xs font-semibold bg-slate-50 h-9 rounded-lg border border-slate-200">
                              <option value="Dual-Signature-Verify">Dual Operator Signature (Secured)</option>
                              <option value="Single-Superadmin">Single Superadmin Signature</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">DATA SCOPING SCHEMA</label>
                            <select value={tenantScope} onChange={(e)=>setTenantScope(e.target.value)} className="w-full text-xs font-semibold bg-slate-50 h-9 rounded-lg border border-slate-200">
                              <option value="Restricted-Isolated">Restricted-Isolated (Physical schemas split)</option>
                              <option value="Shared-Row-Scoping">Logical Isolation (Shared Row indexes)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. INTEGRATIONS SUBSCREEN */}
                  {selectedCategoryId === "integrations" && (
                    <div className="space-y-4" id="sub-integrations">

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">EMAIL SMTP DISPATCH PROVIDER</label>
                            <select value={emailProvider} onChange={(e)=>setEmailProvider(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>SendGrid SMTP</option>
                              <option>Postmark Mailer</option>
                              <option>AWS Simple Email Service</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">CELLULAR SMS NODE GATE</label>
                            <select value={smsProvider} onChange={(e)=>setSmsProvider(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>Twilio Gateway</option>
                              <option>AWS SNS Core</option>
                              <option>MessageBird</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">WHATSAPP API ROUTE</label>
                            <select value={whatsappProvider} onChange={(e)=>setWhatsappProvider(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>Twilio API</option>
                              <option>Meta WhatsApp Business Cloud</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 mb-1">PAYMENT CHECKOUT GATEWAY</label>
                            <select value={paymentGateway} onChange={(e)=>setPaymentGateway(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50">
                              <option>Stripe Connect</option>
                              <option>PayPal Merchant Commerce</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">API Developer Access Endpoint</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Allow authorized developers to provision custom access keys.</p>
                          </div>
                          <button
                            onClick={() => handleToggleChange("Developer Access Gate", apiAccessEnabled, setApiAccessEnabled)}
                            className="focus:outline-hidden cursor-pointer"
                          >
                            {apiAccessEnabled ? (
                              <ToggleRight className="w-9 h-9 text-blue-600" />
                            ) : (
                              <ToggleLeft className="w-9 h-9 text-slate-300" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9. ADVANCED SUBSCREEN */}
                  {selectedCategoryId === "advanced" && (
                    <div className="space-y-4" id="sub-advanced">

                      <div className="space-y-4">
                        {/* API Key box with eye hide toggle */}
                        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>SUPERADMIN ROOT SECRET KEY (MASTER_KEY)</span>
                            <span className="text-emerald-400">● LIVE CONNECTION ACTIVE</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] truncate block select-all select-none">
                              {showApiKey ? apiKey : "••••••••••••••••••••••••••••••••••••••••"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                                title="Toggle Visibility"
                              >
                                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={handleCopyKey}
                                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                                title="Copy API Key"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Feature Flags */}
                        <div className="space-y-2.5">
                          
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">AI compliance generation assistance</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Leverage Google Gemini API to pre-fill security logs and trace logs.</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isAiAssistanceEnabled}
                              onChange={(e) => setIsAiAssistanceEnabled(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">Experimental Tenant Impersonation</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Permits superadmins to open workspace sessions in read-only debugging mode.</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isExpImpersonationEnabled}
                              onChange={(e) => setIsExpImpersonationEnabled(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Developer Shell Trigger / System Resets */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
                          <button
                            onClick={() => setConfirmModalType("clear_cache")}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Purge Redis Cache
                          </button>
                          
                          <button
                            onClick={() => setConfirmModalType("reset_system")}
                            className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Hard Factory Reset Configs
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 10. ABOUT SUBSCREEN */}
                  {selectedCategoryId === "about" && (
                    <div className="space-y-4" id="sub-about">

                      <div className="space-y-3 font-sans">
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-800">Linely QMS Suite Admin Tool</h3>
                              <p className="text-[10px] text-slate-400 font-semibold">Stable enterprise release branch</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-150 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px]">CURRENT APPLICATION VERSION:</span>
                              <strong className="text-slate-700 font-mono text-[11px]">v1.4.2 (LTS)</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">VERIFIED STABLE BUILD ID:</span>
                              <strong className="text-slate-700 font-mono text-[11px]">#20260708.REPRO_1</strong>
                            </div>
                          </div>
                        </div>

                        {/* Legal details list */}
                        <div className="divide-y divide-slate-100 overflow-hidden text-xs">
                          <a href="#tos" onClick={(e)=>{e.preventDefault(); triggerToast("Opening Terms of Service in compliance framework.", "info");}} className="flex items-center justify-between p-3 hover:bg-slate-50/50 text-slate-600 font-bold transition-all">
                            <span>Terms of Service Agreement</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </a>
                          <a href="#privacy" onClick={(e)=>{e.preventDefault(); triggerToast("Opening Privacy policy document.", "info");}} className="flex items-center justify-between p-3 hover:bg-slate-50/50 text-slate-600 font-bold transition-all">
                            <span>Privacy & HIPAA Compliance Policy</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </a>
                          <a href="#licenses" onClick={(e)=>{e.preventDefault(); triggerToast("Opening software package licenses logs.", "info");}} className="flex items-center justify-between p-3 hover:bg-slate-50/50 text-slate-600 font-bold transition-all">
                            <span>Open Source Package Licenses</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </a>
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium text-center pt-2">
                          © 2026 Linely Technologies, Inc. All rights reserved.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Save Bar (SettingsSaveBar) */}
                  {selectedCategoryId !== "about" && (
                    <div className="pt-4 border-t border-slate-200 flex justify-end" id="SettingsSaveBar">
                      <button
                        onClick={handleSaveChanges}
                        className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Preference Parameters</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* 5. DESTRUCTIVE ACTIONS CONFIRMATION MODALS (FOR DELETING ACCOUNT, RESETS, PURGES) */}
      <AnimatePresence>
        {confirmModalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setConfirmModalType(null)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-xl relative z-10 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-xs font-mono font-black uppercase tracking-wider">DESTRUCTIVE ADMINISTRATIVE ACTION</h3>
              </div>
              
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {confirmModalType === "delete_account" && "You are attempting to delete your superadmin profile. This action cannot be undone and will purge your seat metadata."}
                {confirmModalType === "reset_system" && "This will restore all corporate parameters, push endpoints, notification sounds, and active providers to original master system templates."}
                {confirmModalType === "clear_cache" && "This clears the localized key-value cache buffer on primary node clusters immediately."}
                {confirmModalType === "logout_devices" && "This will invalidate all secondary active session cookies on separate machines immediately."}
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setConfirmModalType(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDestructiveAction}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  Acknowledge & Commit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

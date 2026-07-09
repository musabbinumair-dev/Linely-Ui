import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings, Shield, Bell, Globe, Eye, Database,
  HardDrive, Puzzle, FileText, ChevronRight, Save,
  AlertTriangle, Info, CheckCircle, Lock, User, Users,
  Key, Clock, Mail, Webhook, Sliders, Paintbrush,
  Server, RotateCcw, Download, Upload, X, Check,
  ToggleLeft, ToggleRight, ExternalLink, BookOpen, Zap
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ControlKind = "toggle" | "select" | "text" | "number" | "textarea" | "chip-multi";

interface FieldDef {
  key: string;
  label: string;
  description: string;
  control: ControlKind;
  options?: string[];
  defaultValue: string | number | boolean | string[];
  warning?: string;
  dangerous?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

interface SectionDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  fields: FieldDef[];
}

type SettingsState = Record<string, string | number | boolean | string[]>;

// ─── Section Definitions ──────────────────────────────────────────────────────

const SECTIONS: SectionDef[] = [
  {
    id: "general", label: "General", icon: <Globe className="w-4 h-4" />,
    description: "Core company identity, localization, and contact defaults.",
    fields: [
      { key: "company_name", label: "Company Name", description: "Your organization's display name across the platform.", control: "text", defaultValue: "Linely Corp", placeholder: "Acme Corp" },
      { key: "system_email", label: "System Email Address", description: "The 'From' address used in all system-generated emails.", control: "text", defaultValue: "system@linely.io", placeholder: "no-reply@yourcompany.com" },
      { key: "support_email", label: "Support Contact", description: "Shown to branch operators on error and help screens.", control: "text", defaultValue: "support@linely.io", placeholder: "support@yourcompany.com" },
      { key: "default_language", label: "Default Language", description: "Fallback language for system emails and new user accounts.", control: "select", options: ["English (US)", "English (UK)", "French", "German", "Spanish", "Portuguese", "Japanese"], defaultValue: "English (US)" },
      { key: "default_timezone", label: "Default Timezone", description: "Timezone used for timestamps, reports, and scheduled jobs.", control: "select", options: ["UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore"], defaultValue: "UTC" },
      { key: "date_format", label: "Date Format", description: "How dates are displayed across dashboards and exports.", control: "select", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "D MMM YYYY"], defaultValue: "YYYY-MM-DD" },
      { key: "currency", label: "Default Currency", description: "Used for billing amounts, invoices, and plan pricing display.", control: "select", options: ["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "CAD ($)", "AUD ($)"], defaultValue: "USD ($)" },
    ],
  },
  {
    id: "appearance", label: "Appearance", icon: <Paintbrush className="w-4 h-4" />,
    description: "Brand customization, visual mode, and interface density.",
    fields: [
      { key: "brand_color", label: "Brand Accent Color", description: "Primary color for buttons, links, and highlighted elements.", control: "select", options: ["#00C3E3 (Cyan)", "#0D1A5E (Navy)", "#1A87C2 (Ocean)", "#10B981 (Emerald)", "#F59E0B (Amber)", "#8B5CF6 (Violet)"], defaultValue: "#00C3E3 (Cyan)" },
      { key: "dark_mode", label: "Dark Mode", description: "Enable dark theme globally for all admin users.", control: "toggle", defaultValue: false },
      { key: "compact_density", label: "Compact Density", description: "Reduce spacing for higher information density in dashboards.", control: "toggle", defaultValue: false },
      { key: "show_branch_avatars", label: "Show Branch Avatars", description: "Display branch profile images in table and list views.", control: "toggle", defaultValue: true },
      { key: "sidebar_collapsed", label: "Collapsed Sidebar by Default", description: "Start with the admin sidebar collapsed for new sessions.", control: "toggle", defaultValue: false },
      { key: "custom_css", label: "Custom CSS", description: "Advanced: inject CSS overrides into the admin UI. Use with care.", control: "textarea", defaultValue: "/* Add custom styles here */", placeholder: ".admin-sidebar { background: #0a0f2e; }", warning: "Malformed CSS can break the interface. Test in staging first." },
    ],
  },
  {
    id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />,
    description: "Email routing, alert channels, digest schedule, and webhook endpoints.",
    fields: [
      { key: "email_provider", label: "Email Provider", description: "SMTP service used to send all system and alert emails.", control: "select", options: ["SendGrid", "Amazon SES", "Mailgun", "Postmark", "Custom SMTP"], defaultValue: "SendGrid" },
      { key: "alert_recipients", label: "Alert Recipients", description: "Comma-separated admin email addresses for critical alert notifications.", control: "text", defaultValue: "admin@linely.io, security@linely.io", placeholder: "admin@yourco.com, ops@yourco.com" },
      { key: "digest_enabled", label: "Daily Digest", description: "Send a daily email summary of alerts, approvals, and activity.", control: "toggle", defaultValue: true },
      { key: "digest_time", label: "Digest Delivery Time", description: "Time (UTC) to deliver the daily digest email.", control: "select", options: ["06:00 UTC", "07:00 UTC", "08:00 UTC", "09:00 UTC", "17:00 UTC", "18:00 UTC"], defaultValue: "08:00 UTC" },
      { key: "critical_sms", label: "Critical Alert SMS", description: "Send SMS for Critical severity alerts to on-call numbers.", control: "toggle", defaultValue: false },
      { key: "slack_webhook", label: "Slack Webhook URL", description: "Post critical and high-severity alerts to a Slack channel.", control: "text", defaultValue: "", placeholder: "https://hooks.slack.com/services/..." },
      { key: "pagerduty_key", label: "PagerDuty Integration Key", description: "Route critical incidents to PagerDuty for on-call escalation.", control: "text", defaultValue: "", placeholder: "pd-integration-key-here" },
      { key: "webhook_endpoints", label: "Custom Webhook Endpoints", description: "Additional endpoints to POST alert payloads (one URL per line).", control: "textarea", defaultValue: "", placeholder: "https://hooks.example.com/alerts\nhttps://api.yoursystem.com/webhooks" },
    ],
  },
  {
    id: "security", label: "Security", icon: <Shield className="w-4 h-4" />,
    description: "Session policy, MFA, password rules, rate limiting, and admin permissions.",
    fields: [
      { key: "session_lifetime", label: "Session Lifetime", description: "How long admin sessions remain active without interaction.", control: "select", options: ["30 minutes", "1 hour", "4 hours", "8 hours", "24 hours"], defaultValue: "4 hours" },
      { key: "mfa_enforcement", label: "MFA Enforcement", description: "Who is required to use multi-factor authentication.", control: "select", options: ["Disabled", "Optional for All", "Required for Admins", "Required for All"], defaultValue: "Required for Admins", warning: "Disabling MFA significantly increases account takeover risk." },
      { key: "password_min_length", label: "Password Minimum Length", description: "Minimum character count for user passwords.", control: "number", defaultValue: 12 },
      { key: "password_complexity", label: "Password Complexity Rules", description: "Character types required in all user passwords.", control: "chip-multi", options: ["Uppercase", "Lowercase", "Numbers", "Symbols"], defaultValue: ["Uppercase", "Lowercase", "Numbers", "Symbols"] },
      { key: "anonymous_access", label: "Anonymous Access Policy", description: "What unauthenticated visitors can access via public URLs.", control: "select", options: ["Blocked (No access)", "Read-only (Public queues)", "Full (Open registration)"], defaultValue: "Blocked (No access)" },
      { key: "rate_limiting", label: "API Rate Limiting", description: "Enforce request rate limits on all public API endpoints.", control: "toggle", defaultValue: true },
      { key: "rate_limit_rpm", label: "Rate Limit (requests/min)", description: "Maximum allowed requests per minute per authenticated user.", control: "number", defaultValue: 120 },
      { key: "admin_approval", label: "Require Dual Approval for Admin Grants", description: "Admin-level permission changes must be approved by a second admin.", control: "toggle", defaultValue: true, warning: "Disabling this allows single-admin privilege escalation." },
    ],
  },
  {
    id: "access_control", label: "Access Control", icon: <Key className="w-4 h-4" />,
    description: "Roles, SSO, IP allowlisting, and API key policies.",
    fields: [
      { key: "default_role", label: "Default New User Role", description: "Role assigned to users upon account creation before manual review.", control: "select", options: ["Viewer", "Operator", "Manager", "Branch Admin", "No Access (Pending)"], defaultValue: "Viewer" },
      { key: "saml_sso", label: "SAML SSO", description: "Enable Single Sign-On via SAML 2.0 identity provider.", control: "toggle", defaultValue: false },
      { key: "sso_provider_url", label: "SSO Provider URL", description: "Your identity provider's SAML metadata or login endpoint URL.", control: "text", defaultValue: "", placeholder: "https://sso.yourcompany.com/saml/metadata" },
      { key: "ip_whitelist", label: "Admin IP Allowlist", description: "Only these IP addresses/CIDR blocks may access the admin panel. One per line.", control: "textarea", defaultValue: "", placeholder: "10.0.0.0/8\n192.168.1.100", warning: "Locking to a wrong IP range will lock out all admins. Verify before saving." },
      { key: "api_key_expiry", label: "API Key Expiry", description: "How long until API keys expire and must be rotated.", control: "select", options: ["Never", "30 days", "90 days", "1 year"], defaultValue: "90 days" },
      { key: "org_permissions", label: "Org-Level Permission Inheritance", description: "Child branches inherit parent organization permission policies.", control: "toggle", defaultValue: true },
    ],
  },
  {
    id: "data_retention", label: "Data Retention", icon: <Database className="w-4 h-4" />,
    description: "Log lifecycle, branch archiving, and GDPR compliance policies.",
    fields: [
      { key: "log_retention_days", label: "Application Log Retention", description: "How long to retain system and operational logs.", control: "select", options: ["30 days", "60 days", "90 days", "180 days", "365 days"], defaultValue: "90 days" },
      { key: "audit_retention", label: "Audit Log Retention", description: "How long to retain security audit trail records.", control: "select", options: ["1 year", "2 years", "5 years", "Forever"], defaultValue: "5 years", warning: "Reducing this below 2 years may conflict with compliance requirements." },
      { key: "auto_archive", label: "Auto-Archive Inactive Branches", description: "Automatically archive branches with no activity after a set period.", control: "toggle", defaultValue: false },
      { key: "archive_after_days", label: "Archive After (days)", description: "Number of days of inactivity before a branch is auto-archived.", control: "number", defaultValue: 90 },
      { key: "gdpr_deletion", label: "GDPR Automated Deletion", description: "Automatically process and complete approved data deletion requests.", control: "toggle", defaultValue: true },
      { key: "queue_history_days", label: "Queue History Retention", description: "How long to retain customer queue visit history.", control: "select", options: ["30 days", "90 days", "180 days", "1 year", "2 years"], defaultValue: "1 year" },
    ],
  },
  {
    id: "backup", label: "Backup & Restore", icon: <HardDrive className="w-4 h-4" />,
    description: "Automated backup schedule, storage target, and restore operations.",
    fields: [
      { key: "auto_backup", label: "Automated Backups", description: "Schedule automatic database and configuration backups.", control: "toggle", defaultValue: true },
      { key: "backup_frequency", label: "Backup Frequency", description: "How often automated backups are created.", control: "select", options: ["Hourly", "Daily", "Weekly"], defaultValue: "Daily" },
      { key: "backup_time", label: "Backup Window", description: "Preferred time (UTC) to run daily backups.", control: "select", options: ["01:00 UTC", "02:00 UTC", "03:00 UTC", "04:00 UTC", "05:00 UTC"], defaultValue: "02:00 UTC" },
      { key: "backup_storage", label: "Backup Storage Target", description: "Where automated backups are stored.", control: "select", options: ["Replit Managed Storage", "Amazon S3", "Google Cloud Storage", "Azure Blob Storage"], defaultValue: "Replit Managed Storage" },
      { key: "backup_copies", label: "Retained Copies", description: "Number of most-recent backups to keep before rotation.", control: "number", defaultValue: 14 },
      { key: "backup_encryption", label: "Encrypt Backups at Rest", description: "Apply AES-256 encryption to all backup archives.", control: "toggle", defaultValue: true },
    ],
  },
  {
    id: "integrations", label: "Integrations", icon: <Puzzle className="w-4 h-4" />,
    description: "Connect third-party services, CRMs, and communication platforms.",
    fields: [
      { key: "slack_connected", label: "Slack Integration", description: "Connect your Slack workspace for alert routing and team notifications.", control: "toggle", defaultValue: false },
      { key: "google_calendar", label: "Google Calendar Sync", description: "Sync branch operating hours and staff shifts to Google Calendar.", control: "toggle", defaultValue: false },
      { key: "salesforce", label: "Salesforce CRM", description: "Push queue analytics and customer data to Salesforce objects.", control: "toggle", defaultValue: false },
      { key: "zapier_webhook", label: "Zapier Webhook", description: "Trigger Zaps on branch events, alerts, and queue milestones.", control: "text", defaultValue: "", placeholder: "https://hooks.zapier.com/hooks/catch/..." },
      { key: "ms_teams_webhook", label: "Microsoft Teams Webhook", description: "Post system alerts and daily digests to a Teams channel.", control: "text", defaultValue: "", placeholder: "https://yourcompany.webhook.office.com/..." },
      { key: "analytics_enabled", label: "Analytics & Telemetry", description: "Share anonymized usage data to help improve the platform.", control: "toggle", defaultValue: true },
    ],
  },
  {
    id: "audit", label: "Audit Log", icon: <FileText className="w-4 h-4" />,
    description: "Event tracking configuration, SIEM streaming, and export controls.",
    fields: [
      { key: "tracked_events", label: "Events to Track", description: "Which administrative events are written to the audit log.", control: "chip-multi", options: ["Logins", "Logouts", "Admin Actions", "Config Changes", "Data Exports", "API Calls", "Permission Changes", "Branch Events"], defaultValue: ["Logins", "Admin Actions", "Config Changes", "Permission Changes"] },
      { key: "realtime_streaming", label: "Real-Time SIEM Streaming", description: "Stream audit events in real-time to an external SIEM endpoint.", control: "toggle", defaultValue: false },
      { key: "siem_endpoint", label: "SIEM Endpoint URL", description: "URL to receive streamed audit log events (JSON POST).", control: "text", defaultValue: "", placeholder: "https://siem.yourcompany.com/ingest" },
      { key: "audit_log_signed", label: "Sign Audit Log Entries", description: "Append a cryptographic signature to each audit event for tamper detection.", control: "toggle", defaultValue: true },
      { key: "export_format", label: "Export Format", description: "File format for manual audit log exports.", control: "select", options: ["CSV", "JSON", "NDJSON", "Parquet"], defaultValue: "JSON" },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleControl({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex items-center ${value ? "bg-brand-navy" : "bg-slate-200"}`}
    >
      <motion.span
        animate={{ x: value ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

function ChipMultiControl({ options, value, onChange }: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${active ? "bg-brand-navy text-brand-cyan border-brand-navy" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
          >
            {active && <Check className="w-3 h-3 inline mr-1" />}{opt}
          </button>
        );
      })}
    </div>
  );
}

function FieldControl({ field, value, onChange }: {
  field: FieldDef;
  value: string | number | boolean | string[];
  onChange: (v: string | number | boolean | string[]) => void;
}) {
  const cls = "w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200/60 rounded-xl text-[12px] font-medium text-brand-navy outline-none focus:border-brand-navy transition-all placeholder:text-slate-400 resize-none";

  if (field.control === "toggle") {
    return <ToggleControl value={value as boolean} onChange={onChange as (v: boolean) => void} />;
  }
  if (field.control === "select") {
    return (
      <select
        value={value as string}
        onChange={e => onChange(e.target.value)}
        className={cls}
        disabled={field.readOnly}
      >
        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.control === "text") {
    return (
      <input
        type="text"
        value={value as string}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        readOnly={field.readOnly}
        className={cls}
      />
    );
  }
  if (field.control === "number") {
    return (
      <input
        type="number"
        value={value as number}
        onChange={e => onChange(Number(e.target.value))}
        readOnly={field.readOnly}
        className={`${cls} w-32`}
      />
    );
  }
  if (field.control === "textarea") {
    return (
      <textarea
        value={value as string}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        readOnly={field.readOnly}
        className={cls}
      />
    );
  }
  if (field.control === "chip-multi") {
    return (
      <ChipMultiControl
        options={field.options ?? []}
        value={value as string[]}
        onChange={onChange as (v: string[]) => void}
      />
    );
  }
  return null;
}

function SettingRow({ field, value, onChange }: {
  field: FieldDef;
  value: string | number | boolean | string[];
  onChange: (v: string | number | boolean | string[]) => void;
}) {
  const isInline = field.control === "toggle";

  return (
    <div className={`py-4 border-b border-slate-50 last:border-b-0 ${isInline ? "flex items-center justify-between gap-4" : ""}`}>
      <div className={isInline ? "min-w-0 flex-1" : "mb-2"}>
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-bold text-brand-navy">{field.label}</p>
          {field.dangerous && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wide">Destructive</span>
          )}
        </div>
        <p className="text-[11px] text-slate mt-0.5 leading-relaxed">{field.description}</p>
        {field.warning && (
          <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-800 font-medium leading-snug">{field.warning}</p>
          </div>
        )}
      </div>
      <div className={isInline ? "shrink-0" : ""}>
        <FieldControl field={field} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function SettingsSectionCard({ section, values, onChange }: {
  section: SectionDef;
  values: SettingsState;
  onChange: (key: string, value: string | number | boolean | string[]) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-ocean">
          {section.icon}
        </div>
        <div>
          <h3 className="text-[13px] font-extrabold text-brand-navy">{section.label}</h3>
          <p className="text-[11px] text-slate mt-0.5">{section.description}</p>
        </div>
      </div>
      <div className="px-5">
        {section.fields.map(field => (
          <SettingRow
            key={field.key}
            field={field}
            value={values[field.key] ?? field.defaultValue}
            onChange={v => onChange(field.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
}

function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel, dangerous }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-sm mx-4 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${dangerous ? "bg-rose-50" : "bg-amber-50"}`}>
              <AlertTriangle className={`w-5 h-5 ${dangerous ? "text-rose-500" : "text-amber-500"}`} />
            </div>
            <h3 className="text-[15px] font-extrabold text-brand-navy">{title}</h3>
          </div>
          <p className="text-[12px] text-slate leading-relaxed">{body}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-50 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-[12px] font-bold rounded-full transition-all active:scale-95 ${dangerous ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface GlobalSettingsPageProps {
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function GlobalSettingsPage({ triggerToast }: GlobalSettingsPageProps) {
  const [activeSection, setActiveSection] = useState("general");
  const [dirtyValues, setDirtyValues] = useState<SettingsState>({});
  const [modal, setModal] = useState<null | "save" | "reset" | "restore">(null);

  const initialState = useMemo<SettingsState>(() => {
    const state: SettingsState = {};
    SECTIONS.forEach(sec => {
      sec.fields.forEach(f => {
        state[`${sec.id}.${f.key}`] = f.defaultValue;
      });
    });
    return state;
  }, []);

  const [values, setValues] = useState<SettingsState>(initialState);
  const isDirty = Object.keys(dirtyValues).length > 0;

  const handleChange = (sectionId: string, fieldKey: string, val: string | number | boolean | string[]) => {
    const compound = `${sectionId}.${fieldKey}`;
    setValues(prev => ({ ...prev, [compound]: val }));
    setDirtyValues(prev => ({ ...prev, [compound]: val }));
  };

  const handleSave = () => {
    setDirtyValues({});
    setModal(null);
    triggerToast("Settings saved successfully.", "success");
  };

  const handleReset = () => {
    setValues(initialState);
    setDirtyValues({});
    setModal(null);
    triggerToast("Settings reverted to last saved state.", "info");
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection)!;

  // Help panel content per section
  const helpContent: Record<string, { tips: string[]; warnings: string[] }> = {
    general: {
      tips: ["Company name appears in email headers, browser titles, and operator-facing portals.", "System email should use a monitored alias — replies from branches go here."],
      warnings: [],
    },
    appearance: {
      tips: ["Brand color changes take effect immediately for all logged-in users.", "Test custom CSS in a staging environment before applying to production."],
      warnings: ["Custom CSS may conflict with future platform updates. Review after each release."],
    },
    notifications: {
      tips: ["Slack webhooks support rich formatted alerts with action buttons.", "PagerDuty integration uses Events API v2 — ensure your service key is from the correct service."],
      warnings: ["Unconfigured alert recipients means critical alerts will only appear in-app."],
    },
    security: {
      tips: ["NIST recommends 12-character minimum with complexity requirements.", "4-hour session lifetime balances security and productivity for most orgs."],
      warnings: ["Disabling MFA enforcement immediately applies to all admins. Notify your team first.", "Rate limits below 60 req/min may break integrations that poll frequently."],
    },
    access_control: {
      tips: ["SAML SSO metadata URL must be HTTPS and publicly reachable from Linely servers.", "IP allowlisting only applies to admin panel access — branch portals are unaffected."],
      warnings: ["An empty IP allowlist means no IP restriction. Add at least one CIDR if restricting.", "Incorrect SSO configuration can completely lock out admin access."],
    },
    data_retention: {
      tips: ["SOC 2 Type II typically requires 1 year of audit logs minimum.", "Auto-archiving recovers storage but branches can be re-activated within 90 days."],
      warnings: ["Reducing audit log retention below regulatory requirements can result in compliance failures."],
    },
    backup: {
      tips: ["Test your restore procedure quarterly — a backup you haven't restored is untested.", "Keep at least 14 copies to cover a two-week rolling window."],
      warnings: ["Disabling backups with no alternative DR plan creates a single point of failure."],
    },
    integrations: {
      tips: ["Zapier webhooks support 3,000+ connected apps without custom code.", "Analytics telemetry is anonymized — no customer PII is shared."],
      warnings: [],
    },
    audit: {
      tips: ["Signed audit entries use HMAC-SHA256 — verify the signing key in your Security settings.", "NDJSON format is most compatible with log ingestion pipelines (Splunk, Datadog, ELK)."],
      warnings: ["Disabling signature on audit entries reduces tamper-evidence guarantees."],
    },
  };

  const help = helpContent[activeSection] ?? { tips: [], warnings: [] };
  const dirtyInSection = SECTIONS.reduce((acc, sec) => {
    const count = sec.fields.filter(f => dirtyValues[`${sec.id}.${f.key}`] !== undefined).length;
    return { ...acc, [sec.id]: count };
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate uppercase tracking-widest font-mono">Administration</span>
            <ChevronRight className="w-3 h-3 text-slate/40" />
            <span className="text-[10px] font-bold text-brand-ocean uppercase tracking-widest font-mono">Global Settings</span>
          </div>
          <h2 className="font-rethink text-xl font-extrabold text-brand-navy leading-none">System Configuration</h2>
          <p className="text-xs text-slate mt-1">Manage platform-wide defaults, security policy, integrations, and compliance controls</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={() => setModal("reset")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Discard Changes
            </button>
          )}
          <button
            onClick={() => isDirty ? setModal("save") : triggerToast("No unsaved changes.", "info")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold active:scale-95 transition-all shadow-sm ${isDirty ? "bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan" : "bg-slate-100 text-slate-400 cursor-default"}`}
          >
            <Save className="w-3.5 h-3.5" />
            {isDirty ? `Save Changes${Object.keys(dirtyValues).length > 0 ? ` (${Object.keys(dirtyValues).length})` : ""}` : "No Changes"}
          </button>
        </div>
      </div>

      {/* ── Settings Body: 3-column ───────────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-160px)]">

        {/* Left settings nav */}
        <div className="w-52 shrink-0 border-r border-slate-100 pt-4 pb-6 sticky top-0 self-start">
          <p className="px-4 text-[9px] font-extrabold text-slate uppercase tracking-widest mb-2">Sections</p>
          <nav className="space-y-0.5">
            {SECTIONS.map(sec => {
              const dirtyCount = dirtyInSection[sec.id] ?? 0;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-all rounded-none ${isActive ? "bg-slate-50 border-r-2 border-brand-navy" : "hover:bg-slate-50/60"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-brand-navy" : "text-slate"}>{sec.icon}</span>
                    <span className={`text-[12px] font-${isActive ? "extrabold" : "medium"} ${isActive ? "text-brand-navy" : "text-slate-600"}`}>{sec.label}</span>
                  </div>
                  {dirtyCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom restore button */}
          <div className="mt-6 px-4">
            <button
              onClick={() => setModal("restore")}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Restore Backup
            </button>
          </div>
        </div>

        {/* Center: active section content */}
        <div className="flex-1 min-w-0 p-6 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <SettingsSectionCard
                section={currentSection}
                values={Object.fromEntries(
                  currentSection.fields.map(f => [f.key, values[`${currentSection.id}.${f.key}`] ?? f.defaultValue])
                )}
                onChange={(key, val) => handleChange(currentSection.id, key, val)}
              />

              {/* Audit-log export action */}
              {activeSection === "audit" && (
                <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-2xs">
                  <h4 className="text-[12px] font-extrabold text-brand-navy mb-1">Export Audit Log</h4>
                  <p className="text-[11px] text-slate mb-3">Download a full or filtered export of the audit log in your configured format.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerToast("Audit log export queued. You'll receive a download link by email.", "success")}
                      className="px-4 py-2 bg-brand-navy hover:bg-brand-deepnavy text-brand-cyan rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Log
                    </button>
                  </div>
                </div>
              )}

              {/* Backup restore action card */}
              {activeSection === "backup" && (
                <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[12px] font-extrabold text-rose-700 mb-1">Restore from Backup</h4>
                      <p className="text-[11px] text-slate mb-3 leading-relaxed">Roll back the platform configuration and database to a previous backup snapshot. This action is irreversible and will cause a brief service interruption.</p>
                      <button
                        onClick={() => setModal("restore")}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore Backup…
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right help panel */}
        <div className="w-64 shrink-0 border-l border-slate-100 p-5 sticky top-0 self-start space-y-4">
          <div>
            <p className="text-[10px] font-extrabold text-slate uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Section Guide
            </p>
            {help.tips.length > 0 && (
              <div className="space-y-2 mb-4">
                {help.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <Info className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-sky-800 leading-snug">{tip}</p>
                  </div>
                ))}
              </div>
            )}
            {help.warnings.length > 0 && (
              <div className="space-y-2">
                {help.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-800 leading-snug">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dirty state indicator */}
          {isDirty && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide">Unsaved Changes</p>
              </div>
              <p className="text-[10px] text-amber-700 leading-snug">
                {Object.keys(dirtyValues).length} field{Object.keys(dirtyValues).length > 1 ? "s" : ""} modified across {new Set(Object.keys(dirtyValues).map(k => k.split(".")[0])).size} section{new Set(Object.keys(dirtyValues).map(k => k.split(".")[0])).size > 1 ? "s" : ""}.
              </p>
            </div>
          )}

          {/* Permissions note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Permissions</p>
            </div>
            <p className="text-[10px] text-slate leading-snug">Changes here apply globally to all branches. Only Company Superadmin accounts can modify these settings.</p>
          </div>

          {/* Support link */}
          <a href="#" className="flex items-center gap-2 text-[11px] font-bold text-brand-ocean hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> Configuration Docs
          </a>
        </div>
      </div>

      {/* ── Sticky Save Bar ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="sticky bottom-0 z-20 border-t border-brand-deepnavy bg-brand-navy px-6 py-3.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[12px] font-bold text-white">
                You have unsaved changes across {new Set(Object.keys(dirtyValues).map(k => k.split(".")[0])).size} section{new Set(Object.keys(dirtyValues).map(k => k.split(".")[0])).size > 1 ? "s" : ""}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModal("reset")}
                className="px-4 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => setModal("save")}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-cyan text-brand-deepnavy rounded-full text-[11px] font-extrabold active:scale-95 transition-all shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === "save" && (
          <ConfirmModal
            title="Save Configuration Changes"
            body={`You're about to save ${Object.keys(dirtyValues).length} modified setting${Object.keys(dirtyValues).length > 1 ? "s" : ""}. Some changes (like security policy and session lifetime) take effect immediately for all users.`}
            confirmLabel="Save Changes"
            onConfirm={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
        {modal === "reset" && (
          <ConfirmModal
            title="Discard Unsaved Changes"
            body="All unsaved modifications will be reverted to their last saved values. This cannot be undone."
            confirmLabel="Discard Changes"
            onConfirm={handleReset}
            onCancel={() => setModal(null)}
          />
        )}
        {modal === "restore" && (
          <ConfirmModal
            title="Restore from Backup"
            body="Restoring a backup will overwrite current configuration and may cause a brief service interruption. Only proceed if you've confirmed the backup snapshot with your infrastructure team."
            confirmLabel="Confirm Restore"
            onConfirm={() => { setModal(null); triggerToast("Restore initiated. You'll receive a confirmation email when complete.", "warning"); }}
            onCancel={() => setModal(null)}
            dangerous
          />
        )}
      </AnimatePresence>
    </div>
  );
}

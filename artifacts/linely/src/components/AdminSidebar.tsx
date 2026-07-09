import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Menu, 
  LogOut,
  ChevronDown,
  LifeBuoy,
  Settings
} from "lucide-react";

export interface SidebarSubItem {
  id: string;
  label: string;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  tabId?: string;
  subItems?: SidebarSubItem[];
}

interface AdminSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  menuItems: SidebarMenuItem[];
  profileName?: string;
  profileEmail?: string;
  profileInitials?: string;
  badgeLabel?: string;
  showPromo?: boolean;
}

export default function AdminSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeTab,
  setActiveTab,
  onLogout,
  menuItems,
  profileName = "Daemon Targaryen",
  profileEmail = "daemon@targaryen.com",
  profileInitials = "DT",
  badgeLabel,
  showPromo = false
}: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Expand groups that contain the active tab by default
    const initial: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => sub.id === activeTab)) {
        initial[item.id] = true;
      }
    });
    return initial;
  });
  const [isPromoDismissed, setIsPromoDismissed] = useState<boolean>(false);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="md:hidden flex items-center justify-between bg-[#0D1A5E] text-white px-5 py-4 border-b border-white/10 w-full sticky top-0 z-40 h-[72px]">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl font-black tracking-tight text-white select-none whitespace-nowrap">
            Linely
          </h1>
          {badgeLabel && (
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              {badgeLabel}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Sidebar Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Background Dimming Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-[90] md:hidden"
            />
            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0D1A5E] border-r border-white/10 text-slate-200 z-[100] flex flex-col justify-between md:hidden shadow-2xl h-full select-none"
            >
              <div className="flex flex-col h-full">
                {/* Header - FIXED at top */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between h-[72px] shrink-0">
                  <div className="flex items-center gap-3">
                    <h1 className="font-bold text-2xl font-black tracking-tight text-white select-none whitespace-nowrap">
                      Linely
                    </h1>
                    {badgeLabel && (
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Nav Links Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                  <nav className="p-3 space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      if (!item.subItems) {
                        const isActive = activeTab === item.tabId || activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (item.tabId) {
                                setActiveTab(item.tabId);
                              } else {
                                setActiveTab(item.id);
                              }
                              setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold font-rethink cursor-pointer transition-colors ${
                              isActive
                                ? "bg-white/10 text-brand-cyan font-bold"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="tracking-wide">{item.label}</span>
                          </button>
                        );
                      }

                      const isGroupExpanded = expandedGroups[item.id];
                      const isAnySubItemActive = item.subItems.some(sub => activeTab === sub.id);

                      return (
                        <div key={item.id} className="space-y-1">
                          <button
                            onClick={() => toggleGroup(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold font-rethink cursor-pointer transition-colors ${
                              isAnySubItemActive
                                ? "bg-white/10 text-white font-bold"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                              <span className="tracking-wide">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isGroupExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>

                          {isGroupExpanded && (
                            <div className="pl-7 pr-1 py-1 space-y-1">
                              {item.subItems.map((sub) => {
                                const isSubActive = activeTab === sub.id;
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      setActiveTab(sub.id);
                                      setIsMobileOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                                      isSubActive
                                        ? "text-brand-cyan font-semibold bg-white/5"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    }`}
                                  >
                                    <span>{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>

                {/* Footer Section - FIXED at bottom */}
                <div className="border-t border-white/10 p-4 bg-white/5 space-y-4 shrink-0">
                  {/* Support and Settings */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        // Trigger standard support toast or state
                        setActiveTab("support");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-400" />
                      <span>Support</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("settings");
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        activeTab === "settings"
                          ? "bg-white/10 text-brand-cyan font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Profile and Logout */}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-brand-cyan border border-white/10 shrink-0">
                        {profileInitials}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-bold text-white leading-none truncate">{profileName}</p>
                        <span className="text-[10px] text-slate-400 block mt-1 truncate font-medium">{profileEmail}</span>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/20 transition-all cursor-pointer shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Redesigned Premium Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 64 : 280 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="hidden md:flex flex-col bg-[#0D1A5E] border-r border-white/10 text-slate-300 shrink-0 h-screen sticky top-0 select-none z-30 relative"
      >
        <div className="flex flex-col h-full">
          {/* Header / Logo - FIXED at top */}
          <div className="border-b border-white/10 flex items-center justify-center h-[81px] shrink-0">
            {isSidebarCollapsed ? (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-cyan hover:text-brand-navy border border-white/10 flex items-center justify-center text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full px-5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <h1 className="font-bold text-2xl font-black tracking-tight text-white select-none whitespace-nowrap">
                    Linely
                  </h1>
                  {badgeLabel && (
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                      {badgeLabel}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Navigation Tree Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {/* Navigation Tree */}
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const itemId = item.tabId || item.id;

                if (!item.subItems) {
                  const isActive = activeTab === itemId;
                  return (
                    <div key={item.id} className="space-y-1 relative group/item">
                      <button
                        onClick={() => {
                          setActiveTab(itemId);
                        }}
                        className={`w-full flex items-center rounded-lg text-xs font-semibold font-rethink cursor-pointer transition-colors ${
                          isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                        } ${
                          isActive
                            ? "bg-white/10 text-brand-cyan font-bold"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                        title={item.label}
                      >
                        {isSidebarCollapsed ? (
                          <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="tracking-wide">{item.label}</span>
                          </div>
                        )}
                      </button>

                      {/* Popover list on Hover when collapsed */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-20 top-0 bg-[#0D1A5E] border border-white/10 rounded-xl p-2 min-w-[150px] hidden group-hover/item:block z-50 shadow-xl">
                          <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1.5 mb-1">
                            {item.label}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                const isGroupExpanded = expandedGroups[item.id];
                const isAnySubItemActive = item.subItems.some(sub => activeTab === sub.id);

                return (
                  <div key={item.id} className="space-y-1 relative group/item">
                    <button
                      onClick={() => {
                        if (isSidebarCollapsed) {
                          setIsSidebarCollapsed(false);
                          setExpandedGroups(prev => ({ ...prev, [item.id]: true }));
                        } else {
                          toggleGroup(item.id);
                        }
                      }}
                      className={`w-full flex items-center rounded-lg text-xs font-semibold font-rethink cursor-pointer transition-colors ${
                        isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                      } ${
                        isAnySubItemActive
                          ? "bg-white/10 text-white font-bold"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isSidebarCollapsed ? (
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                          <span className="tracking-wide">{item.label}</span>
                        </div>
                      )}

                      {!isSidebarCollapsed && (
                        <div className="flex items-center gap-1.5">
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isGroupExpanded ? "rotate-180" : ""}`} />
                        </div>
                      )}
                    </button>

                    {/* Popover list on Hover when collapsed */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-20 top-0 bg-[#0D1A5E] border border-white/10 rounded-xl p-2 min-w-[180px] hidden group-hover/item:block z-50 shadow-xl">
                        <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1.5 border-b border-white/10 mb-1">
                          {item.label}
                        </div>
                        {item.subItems.map((sub) => {
                          const isSubActive = activeTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center justify-between ${
                                isSubActive
                                  ? "bg-white/10 text-brand-cyan font-bold"
                                  : "text-slate-300 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Accordion List when expanded */}
                    <AnimatePresence initial={false}>
                      {isGroupExpanded && !isSidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden pl-7 pr-1 py-1 space-y-1"
                        >
                          {item.subItems.map((sub) => {
                            const isSubActive = activeTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setActiveTab(sub.id)}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                                  isSubActive
                                    ? "text-brand-cyan font-semibold bg-white/5"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                              >
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Separator & Bottom Links within the scrollable container */}
            <div className="border-t border-white/10 my-3 mx-3" />

            <div className="px-3 space-y-0.5">
              <button
                onClick={() => {
                  // Standard support trigger or navigation
                  setActiveTab("support");
                }}
                className={`w-full flex items-center rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isSidebarCollapsed
                    ? "justify-center px-0 py-2.5 text-slate-300 hover:text-white hover:bg-white/5"
                    : "gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Support Desk"
              >
                <LifeBuoy className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>Support</span>}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === "settings"
                    ? "bg-white/10 text-brand-cyan font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                } ${
                  isSidebarCollapsed
                    ? "justify-center px-0 py-2.5"
                    : "gap-3 px-3 py-2"
                }`}
                title="Branding & System Settings"
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </div>

            {/* Promo Banner Card - Only expanded & not dismissed */}
            {!isSidebarCollapsed && !isPromoDismissed && showPromo && (
              <div className="mx-3 mt-4 mb-2 bg-white/5 border border-white/10 rounded-xl p-3.5 relative overflow-hidden">
                <button
                  onClick={() => setIsPromoDismissed(true)}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-brand-cyan font-rethink">
                    Predictive Queues Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-rethink">
                  Predictive wait times and SMS alerts reduce lobby congestion by up to 45%.
                </p>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setIsPromoDismissed(true)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="text-[10px] text-brand-cyan hover:text-white font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Configure <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Profile Section - FIXED at bottom */}
          <div className="border-t border-white/10 p-3 bg-white/5 shrink-0">
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
              {isSidebarCollapsed ? (
                <button
                  onClick={onLogout}
                  className="w-8 h-8 rounded-lg bg-[#0F1D6E] hover:bg-rose-500/10 flex items-center justify-center font-bold text-xs text-brand-cyan hover:text-rose-300 border border-white/10 shrink-0 relative group/profile cursor-pointer"
                  title={`Log Out (${profileName})`}
                >
                  {profileInitials}
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-brand-cyan border border-white/10 shrink-0">
                      {profileInitials}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white leading-none truncate">{profileName}</p>
                      <span className="text-[10px] text-slate-400 block mt-1 truncate font-medium">{profileEmail}</span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/20 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Calendar,
  Settings,
  Users,
  Shield,
  BarChart3,
  Monitor,
  UserCog,
  Key,
  Building,
  Clock,
  AlertTriangle,
  FileText,
  Menu,
  Home,
  ChevronDown,
  Activity,
  Database,
  Bell
} from "lucide-react";

const navigationItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Event Management",
    icon: Calendar,
    items: [
      { title: "Event Settings", href: "/admin/events", icon: Settings },
      { title: "Time Batches", href: "/admin/events/time-batches", icon: Clock },
      { title: "Checkpoints", href: "/admin/events/checkpoints", icon: Shield },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { title: "All Users", href: "/admin/users", icon: Users },
      { title: "Employers", href: "/admin/users/employers", icon: Building },
      { title: "Role Management", href: "/admin/users/roles", icon: UserCog },
    ],
  },
  {
    title: "Security & Access",
    icon: Shield,
    items: [
      { title: "Security Personnel", href: "/admin/security/personnel", icon: Shield },
      { title: "PIN System", href: "/admin/security/pins", icon: Key },
      { title: "Access Control", href: "/admin/security/access", icon: UserCog },
      { title: "Security Incidents", href: "/admin/security/incidents", icon: AlertTriangle },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    items: [
      { title: "Attendance Reports", href: "/admin/reports/attendance", icon: Activity },
      { title: "User Analytics", href: "/admin/reports/users", icon: Users },
      { title: "Event Analytics", href: "/admin/reports/events", icon: Calendar },
      { title: "System Reports", href: "/admin/reports/system", icon: FileText },
    ],
  },
  {
    title: "System Monitoring",
    icon: Monitor,
    items: [
      { title: "System Health", href: "/admin/system/health", icon: Activity },
      { title: "Database Status", href: "/admin/system/database", icon: Database },
      { title: "Logs & Audits", href: "/admin/system/logs", icon: FileText },
      { title: "Notifications", href: "/admin/system/notifications", icon: Bell },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Admin Panel
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Event Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                  pathname === item.href
                    ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                    : "text-slate-700 dark:text-slate-300"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleSection(item.title)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.title}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expandedSections.includes(item.title) ? "rotate-180" : ""
                    )}
                  />
                </button>
                {expandedSections.includes(item.title) && item.items && (
                  <div className="mt-1 space-y-1 pl-6">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                          pathname === subItem.href
                            ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            : "text-slate-600 dark:text-slate-400"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <subItem.icon className="w-4 h-4" />
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Huawei Event Admin v1.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-800 shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
} 
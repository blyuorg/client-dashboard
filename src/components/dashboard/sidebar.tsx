"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  MessageCircle,
  Bell,
  Shield,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessageCount } from "@/lib/messages/use-unread-count";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/project", label: "Project", icon: FolderKanban },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  isAdmin = false,
  userId,
  initialUnreadCount = 0,
}: {
  isAdmin?: boolean;
  userId: string;
  initialUnreadCount?: number;
}) {
  const pathname = usePathname();
  const unreadCount = useUnreadMessageCount(userId, initialUnreadCount);
  const items = isAdmin
    ? [...navItems, { href: "/admin/projects", label: "Admin", icon: Shield }]
    : navItems;

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="flex h-14 items-center border-b px-6 font-semibold">Blyu</div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.href === "/messages" && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

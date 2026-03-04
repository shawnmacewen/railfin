"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, FolderOpen, HelpCircle, PenSquare, Settings2, Target } from "lucide-react";

import { Badge, Button, NavItem } from "./primitives";

const NAV_ITEMS = [
  { label: "Create", href: "/app/create", icon: <PenSquare size={15} strokeWidth={1.9} /> },
  { label: "Library", href: "/app/library", icon: <FolderOpen size={15} strokeWidth={1.9} /> },
  { label: "Campaigns", href: "/app/campaigns", icon: <Target size={15} strokeWidth={1.9} /> },
  { label: "Events", href: "/app/events", icon: <CalendarDays size={15} strokeWidth={1.9} /> },
  { label: "Help Center", href: "/app/help", icon: <HelpCircle size={15} strokeWidth={1.9} /> },
  { label: "Configure", href: "/app/configure", icon: <Settings2 size={15} strokeWidth={1.9} /> },
];

const AUTO_COLLAPSE_DELAY_MS = 2000;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);

  const expandSidebar = useCallback(() => {
    clearCollapseTimer();
    setIsSidebarExpanded(true);
  }, [clearCollapseTimer]);

  const scheduleCollapse = useCallback(() => {
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, AUTO_COLLAPSE_DELAY_MS);
  }, [clearCollapseTimer]);

  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

  return (
    <div className={`rf-shell ${isSidebarExpanded ? "" : "is-sidebar-collapsed"}`}>
      <aside
        className="rf-sidebar"
        aria-label="Primary navigation"
        onMouseEnter={expandSidebar}
        onMouseLeave={scheduleCollapse}
        onFocusCapture={expandSidebar}
        onBlurCapture={scheduleCollapse}
      >
        <Link href="/app/create" className="rf-brand" aria-label="Railfin home">
          <Image
            src="/brand/railfin-v1.png"
            alt="Railfin"
            width={1492}
            height={1021}
            className="rf-brand-logo"
            priority
          />
          <span className="rf-brand-text">Railfin</span>
        </Link>
        <nav className="rf-nav-list">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>
      </aside>

      <div className="rf-main">
        <header className="rf-header">
          <h1 className="rf-header-title">{activeItem?.label || "App"}</h1>
          <div className="rf-header-actions">
            <Badge>Env</Badge>
            <Button type="button" disabled>
              User
            </Button>
          </div>
        </header>

        <main className="rf-content">{children}</main>
      </div>
    </div>
  );
}

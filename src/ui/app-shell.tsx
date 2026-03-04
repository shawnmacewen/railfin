"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpenText, CalendarDays, Goal, LifeBuoy, Pickaxe, Settings } from "lucide-react";

import { Badge, Button, NavItem } from "./primitives";

// Default fallback icon set (pre-task-00175) retained for easy revert/reference:
// Create=PenSquare, Library=FolderOpen, Campaigns=Target, Help Center=HelpCircle, Configure=Settings2
const NAV_ITEMS = [
  { label: "Create", href: "/app/create", icon: <Pickaxe size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-create" },
  { label: "Library", href: "/app/library", icon: <BookOpenText size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-library" },
  // Campaigns uses target-arrow SVG geometry via Lucide `Goal` (repo source: node_modules/lucide-react/dist/esm/icons/goal.js)
  { label: "Campaigns", href: "/app/campaigns", icon: <Goal size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-campaigns" },
  { label: "Events", href: "/app/events", icon: <CalendarDays size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-events" },
  { label: "Help Center", href: "/app/help", icon: <LifeBuoy size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-help" },
  { label: "Configure", href: "/app/configure", icon: <Settings size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-configure" },
];

const AUTO_COLLAPSE_DELAY_MS = 2000;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, buildSha }: { children: ReactNode; buildSha: string }) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.history.scrollRestoration !== "manual") {
      window.history.scrollRestoration = "manual";
    }

    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const shellContent = document.querySelector<HTMLElement>(".rf-content");
      if (shellContent) {
        shellContent.scrollTop = 0;
      }
    };

    resetToTop();
    const frameId = window.requestAnimationFrame(resetToTop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

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
      <div className="rf-build-sha-badge" aria-label="Build version">{buildSha}</div>
      <aside
        className="rf-sidebar"
        aria-label="Primary navigation"
        onMouseEnter={expandSidebar}
        onMouseLeave={scheduleCollapse}
        onFocusCapture={expandSidebar}
        onBlurCapture={scheduleCollapse}
      >
        <Link href="/app/create" className="rf-brand" aria-label="Railfin home">
          <span className="rf-brand-logo-wrap" aria-hidden="true">
            <Image
              src="/brand/railfin-v1.png"
              alt="Railfin"
              width={1492}
              height={1021}
              className="rf-brand-logo"
              priority
            />
          </span>
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
              iconClassName={item.iconClassName}
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

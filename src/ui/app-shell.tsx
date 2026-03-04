"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge, Button, NavItem } from "./primitives";

const NAV_ITEMS = [
  { label: "Create", href: "/app/create" },
  { label: "Library", href: "/app/library" },
  { label: "Campaigns", href: "/app/campaigns" },
  { label: "Events", href: "/app/events" },
  { label: "Help Center", href: "/app/help" },
  { label: "Configure", href: "/app/configure" },
];

const AUTO_MINIMIZE_DELAY_MS = 3000;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAutoMinimizeEnabled, setIsAutoMinimizeEnabled] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const registerActivity = useCallback(() => {
    if (!isAutoMinimizeEnabled) {
      return;
    }

    if (!isSidebarExpanded) {
      setIsSidebarExpanded(true);
    }

    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, AUTO_MINIMIZE_DELAY_MS);
  }, [clearInactivityTimer, isAutoMinimizeEnabled, isSidebarExpanded]);

  useEffect(() => {
    if (!isAutoMinimizeEnabled || !isSidebarExpanded) {
      clearInactivityTimer();
      return;
    }

    registerActivity();
    return clearInactivityTimer;
  }, [clearInactivityTimer, isAutoMinimizeEnabled, isSidebarExpanded, registerActivity]);

  useEffect(() => clearInactivityTimer, [clearInactivityTimer]);

  return (
    <div className={`rf-shell ${isSidebarExpanded ? "" : "is-sidebar-collapsed"}`}>
      <aside
        className="rf-sidebar"
        aria-label="Primary navigation"
        onMouseEnter={registerActivity}
        onMouseMove={registerActivity}
        onFocusCapture={registerActivity}
        onPointerDown={registerActivity}
      >
        <Link href="/app/create" className="rf-brand" aria-label="Railfin home">
          <Image
            src="/brand/railfin-v1.png"
            alt="Railfin"
            width={126}
            height={126}
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
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="rf-sidebar-controls">
          <button
            type="button"
            className="rf-sidebar-control-button"
            onClick={() => {
              setIsSidebarExpanded((prev) => {
                const next = !prev;
                if (next && isAutoMinimizeEnabled) {
                  registerActivity();
                }
                return next;
              });
            }}
            aria-pressed={isSidebarExpanded}
            aria-label={isSidebarExpanded ? "Collapse navigation" : "Expand navigation"}
          >
            {isSidebarExpanded ? "Collapse nav" : "Expand nav"}
          </button>
          <label className="rf-sidebar-auto-toggle">
            <input
              type="checkbox"
              checked={isAutoMinimizeEnabled}
              onChange={(event) => {
                const next = event.target.checked;
                setIsAutoMinimizeEnabled(next);
                if (!next) {
                  clearInactivityTimer();
                  setIsSidebarExpanded(true);
                } else {
                  registerActivity();
                }
              }}
            />
            <span>Auto-minimize</span>
          </label>
        </div>
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

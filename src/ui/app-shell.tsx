"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpenText, Goal, LifeBuoy, Pickaxe, Settings, Tickets, Users } from "lucide-react";

import { Badge, Button, NavItem } from "./primitives";

const NAV_ITEMS = [
  { label: "Create", href: "/app/create", icon: <Pickaxe size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-create" },
  { label: "Library", href: "/app/library", icon: <BookOpenText size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-library" },
  { label: "Campaigns", href: "/app/campaigns", icon: <Goal size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-campaigns" },
  { label: "CRM", href: "/app/crm", icon: <Users size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-crm" },
  { label: "Events", href: "/app/events", icon: <Tickets size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-events" },
  { label: "Help Center", href: "/app/help", icon: <LifeBuoy size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-help" },
  { label: "Configure", href: "/app/configure", icon: <Settings size={23} strokeWidth={2} />, iconClassName: "rf-nav-icon-configure" },
];

const AUTO_MINIMIZE_DELAY_MS = 3000;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, buildSha }: { children: ReactNode; buildSha?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [hasCreateUnsavedChanges, setHasCreateUnsavedChanges] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const [isAutoMinimizeEnabled, setIsAutoMinimizeEnabled] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const registerActivity = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
      return;
    }

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

  useEffect(() => {
    return clearInactivityTimer;
  }, [clearInactivityTimer]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");

    const syncForViewport = () => {
      if (media.matches) {
        setIsSidebarExpanded(false);
        setIsMobileNavOpen(false);
      } else {
        setIsSidebarExpanded(true);
        setIsMobileNavOpen(false);
      }
    };

    syncForViewport();
    media.addEventListener("change", syncForViewport);

    return () => media.removeEventListener("change", syncForViewport);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleUnsavedState = (event: Event) => {
      const customEvent = event as CustomEvent<{ hasUnsavedChanges?: boolean }>;
      setHasCreateUnsavedChanges(Boolean(customEvent.detail?.hasUnsavedChanges));
    };

    window.addEventListener("rf:create-unsaved-state", handleUnsavedState as EventListener);
    return () => window.removeEventListener("rf:create-unsaved-state", handleUnsavedState as EventListener);
  }, []);

  useEffect(() => {
    if (!(pathname.startsWith("/app/create") && hasCreateUnsavedChanges)) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasCreateUnsavedChanges, pathname]);

  const onNavigateAttempt = useCallback((href: string) => {
    if (!pathname.startsWith("/app/create") || !hasCreateUnsavedChanges || href.startsWith("/app/create")) {
      return true;
    }

    setPendingNavigationHref(href);
    return false;
  }, [hasCreateUnsavedChanges, pathname]);

  return (
    <div className={`rf-shell ${isSidebarExpanded ? "" : "is-sidebar-collapsed"} ${isMobileNavOpen ? "is-mobile-nav-open" : ""}`}>
      {buildSha ? <div className="rf-build-sha-badge" aria-label="Build version">{buildSha}</div> : null}
      <aside
        className="rf-sidebar"
        aria-label="Primary navigation"
        onMouseEnter={registerActivity}
        onMouseMove={registerActivity}
        onFocusCapture={registerActivity}
        onPointerDown={registerActivity}
      >
        <Link
          href="/app/create"
          className="rf-brand"
          aria-label="Railfin home"
          onClick={(event) => {
            if (!onNavigateAttempt("/app/create")) {
              event.preventDefault();
            }
          }}
        >
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
              icon={item.icon}
              iconClassName={item.iconClassName}
              active={isActive(pathname, item.href)}
              onNavigateAttempt={onNavigateAttempt}
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

      <div
        className={`rf-shell-backdrop ${isMobileNavOpen ? "is-visible" : ""}`}
        aria-hidden="true"
        onClick={() => setIsMobileNavOpen(false)}
      />

      <div className="rf-main">
        <header className="rf-header">
          <button
            type="button"
            className="rf-header-menu-button"
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((current) => !current)}
          >
            {isMobileNavOpen ? "Close" : "Menu"}
          </button>
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

      {pendingNavigationHref ? (
        <div className="rf-unsaved-warning" role="dialog" aria-modal="true" aria-labelledby="rf-unsaved-warning-title">
          <div className="rf-unsaved-warning-card">
            <h2 id="rf-unsaved-warning-title">Leave Create without saving?</h2>
            <p>You have generated or edited content that is not saved. Leaving now will discard those changes.</p>
            <div className="rf-unsaved-warning-actions">
              <button type="button" onClick={() => setPendingNavigationHref(null)}>
                Stay on Create
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => {
                  const nextHref = pendingNavigationHref;
                  setPendingNavigationHref(null);
                  if (nextHref) {
                    setHasCreateUnsavedChanges(false);
                    router.push(nextHref);
                  }
                }}
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

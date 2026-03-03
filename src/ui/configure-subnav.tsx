"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/app/configure", label: "Policy" },
  { href: "/app/configure/features", label: "Features" },
  { href: "/app/configure/changelog", label: "Change Log" },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export function ConfigureSubnav() {
  const pathname = usePathname();

  return (
    <nav className="rf-configure-subnav" aria-label="Configure sections">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rf-configure-subnav-item${isActive(pathname, item.href) ? " is-active" : ""}`}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

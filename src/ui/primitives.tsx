import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimitiveProps = {
  children: ReactNode;
  className?: string;
};

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cx("rf-button", className)}>
      {children}
    </button>
  );
}

export function Card({ children, className }: PrimitiveProps) {
  return <section className={cx("rf-card", className)}>{children}</section>;
}

export function Badge({ children, className }: PrimitiveProps) {
  return <span className={cx("rf-badge", className)}>{children}</span>;
}

export function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={cx("rf-nav-item", active ? "is-active" : undefined)}>
      {label}
    </Link>
  );
}

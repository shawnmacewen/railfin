import type { ReactNode } from "react";

import { ConfigureSubnav } from "../../../ui/configure-subnav";

export default function ConfigureLayout({ children }: { children: ReactNode }) {
  return (
    <div className="rf-configure-page">
      <header className="rf-page-header">
        <h2 className="rf-page-title">Configure</h2>
        <p className="rf-page-subtitle">Manage workspace settings and release notes.</p>
      </header>

      <ConfigureSubnav />

      {children}
    </div>
  );
}

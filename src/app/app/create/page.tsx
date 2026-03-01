import { Suspense } from "react";

import { EditorShell } from "../../../ui/editor-shell";
import { Card } from "../../../ui/primitives";

export default function CreatePage() {
  return (
    <Card>
      <Suspense fallback={<p className="rf-status rf-status-muted" role="status">Loading editor…</p>}>
        <EditorShell />
      </Suspense>
    </Card>
  );
}

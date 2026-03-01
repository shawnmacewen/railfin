import { Suspense } from "react";

import { EditorShell } from "../../../ui/editor-shell";

export default function PreviewEditorPage() {
  return (
    <main>
      <h1>Preview: Editor</h1>
      <Suspense fallback={<p role="status">Loading editor…</p>}>
        <EditorShell />
      </Suspense>
    </main>
  );
}

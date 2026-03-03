"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  ListItemNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

type LexicalChange = {
  html: string;
  text: string;
};

type LexicalEditorFieldProps = {
  value: string;
  onChange: (change: LexicalChange) => void;
  placeholder?: string;
};

function normalizeHtml(value: string): string {
  return value.trim();
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const setHeading = (tag: "h1" | "h2") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createHeadingNode(tag));
    });
  };

  const setParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  return (
    <div className="rf-lexical-toolbar" role="toolbar" aria-label="Editor formatting">
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>Bold</button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>Italic</button>
      <button type="button" onClick={() => setHeading("h2")}>Heading</button>
      <button type="button" onClick={setParagraph}>Paragraph</button>
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>Bullet List</button>
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>Numbered List</button>
      <button type="button" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>Clear List</button>
    </div>
  );
}

function SyncValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const lastAppliedValueRef = useRef("");

  useEffect(() => {
    const nextValue = normalizeHtml(value);
    if (nextValue === lastAppliedValueRef.current) {
      return;
    }

    editor.update(() => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(nextValue || "<p></p>", "text/html");
      const nodes = $generateNodesFromDOM(editor, doc);
      const root = $getRoot();
      root.clear();
      if (nodes.length > 0) {
        root.append(...nodes);
      } else {
        root.append($createParagraphNode());
      }
      root.selectEnd();
    });

    lastAppliedValueRef.current = nextValue;
  }, [editor, value]);

  return null;
}

function handleChange(editor: LexicalEditor, onChange: (change: LexicalChange) => void) {
  editor.update(() => {
    const html = $generateHtmlFromNodes(editor, null);
    const text = $getRoot().getTextContent();
    onChange({ html, text });
  });
}

export function LexicalEditorField({ value, onChange, placeholder }: LexicalEditorFieldProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: "railfin-create-editor",
      onError(error: Error) {
        throw error;
      },
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      theme: {
        paragraph: "rf-lexical-paragraph",
      },
    }),
    [],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar />
      <div className="rf-lexical-editor-shell">
        <RichTextPlugin
          contentEditable={<ContentEditable className="rf-lexical-content-editable" aria-label="Editor Content" />}
          placeholder={<p className="rf-lexical-placeholder">{placeholder || "Write or generate content..."}</p>}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <HistoryPlugin />
        <ListPlugin />
        <SyncValuePlugin value={value} />
        <OnChangePlugin onChange={(_state, activeEditor) => handleChange(activeEditor, onChange)} />
      </div>
    </LexicalComposer>
  );
}

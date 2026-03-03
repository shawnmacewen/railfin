"use client";

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
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
import { normalizeEditorChange, normalizeIncomingDraftBody } from "./lexical-contract";
import { Bold, Heading2, Italic, List, ListOrdered, ListX, Pilcrow } from "lucide-react";

type LexicalChange = {
  html: string;
  text: string;
};

type LexicalEditorFieldProps = {
  value: string;
  onChange: (change: LexicalChange) => void;
  placeholder?: string;
  onReadyChange?: (isReady: boolean) => void;
};

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  heading: boolean;
  bulletList: boolean;
  orderedList: boolean;
};

function normalizeHtml(value: string): string {
  return normalizeIncomingDraftBody(value).html;
}

type ToolbarButtonProps = {
  active?: boolean;
  pressed?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
};

function ToolbarButton({ active = false, pressed = false, onClick, icon, label }: ToolbarButtonProps) {
  return (
    <button type="button" className={active ? "is-active" : ""} aria-pressed={pressed} onClick={onClick}>
      <span className="rf-lexical-toolbar-icon" aria-hidden="true">{icon}</span>
      <span className="rf-lexical-toolbar-label">{label}</span>
    </button>
  );
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    heading: false,
    bulletList: false,
    orderedList: false,
  });

  const updateToolbarState = () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setToolbarState({ bold: false, italic: false, heading: false, bulletList: false, orderedList: false });
      return;
    }

    const anchorTopLevel = selection.anchor.getNode().getTopLevelElementOrThrow();
    const topLevelType = anchorTopLevel.getType();
    const listType = topLevelType === "list" && anchorTopLevel instanceof ListNode ? anchorTopLevel.getListType() : null;

    setToolbarState({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      heading: topLevelType === "h1" || topLevelType === "h2",
      bulletList: listType === "bullet",
      orderedList: listType === "number",
    });
  };

  useEffect(() => {
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbarState);
    });

    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbarState();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdate();
      unregisterSelection();
    };
  }, [editor]);

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
      <div className="rf-lexical-toolbar-group" aria-label="Inline formatting">
        <ToolbarButton
          active={toolbarState.bold}
          pressed={toolbarState.bold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          icon={<Bold size={14} strokeWidth={2} />}
          label="Bold"
        />
        <ToolbarButton
          active={toolbarState.italic}
          pressed={toolbarState.italic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          icon={<Italic size={14} strokeWidth={2} />}
          label="Italic"
        />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Block formatting">
        <ToolbarButton
          active={toolbarState.heading}
          pressed={toolbarState.heading}
          onClick={() => setHeading("h2")}
          icon={<Heading2 size={14} strokeWidth={2} />}
          label="Heading"
        />
        <ToolbarButton onClick={setParagraph} icon={<Pilcrow size={14} strokeWidth={2} />} label="Paragraph" />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="List formatting">
        <ToolbarButton
          active={toolbarState.bulletList}
          pressed={toolbarState.bulletList}
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          icon={<List size={14} strokeWidth={2} />}
          label="Bullets"
        />
        <ToolbarButton
          active={toolbarState.orderedList}
          pressed={toolbarState.orderedList}
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          icon={<ListOrdered size={14} strokeWidth={2} />}
          label="Numbered"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
          icon={<ListX size={14} strokeWidth={2} />}
          label="Clear"
        />
      </div>
    </div>
  );
}

function SyncValuePlugin({ value, onReadyChange }: { value: string; onReadyChange?: (isReady: boolean) => void }) {
  const [editor] = useLexicalComposerContext();
  const lastAppliedValueRef = useRef("");

  useEffect(() => {
    const nextValue = normalizeHtml(value);
    if (nextValue === lastAppliedValueRef.current) {
      onReadyChange?.(true);
      return;
    }

    onReadyChange?.(false);
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
    onReadyChange?.(true);
  }, [editor, onReadyChange, value]);

  return null;
}

function handleChange(editor: LexicalEditor, onChange: (change: LexicalChange) => void) {
  editor.update(() => {
    const html = $generateHtmlFromNodes(editor, null);
    const normalized = normalizeEditorChange(html);
    onChange({ html: normalized.html, text: normalized.text });
  });
}

export function LexicalEditorField({ value, onChange, placeholder, onReadyChange }: LexicalEditorFieldProps) {
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
        <SyncValuePlugin value={value} onReadyChange={onReadyChange} />
        <OnChangePlugin onChange={(_state, activeEditor) => handleChange(activeEditor, onChange)} />
      </div>
    </LexicalComposer>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $getRoot,
  $isRangeSelection,
  $isElementNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $createCodeNode, CodeNode } from "@lexical/code";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  ListItemNode,
  ListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { normalizeEditorChange, normalizeIncomingDraftBody } from "./lexical-contract";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";

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
  underline: boolean;
  strikethrough: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  paragraph: boolean;
  bulletList: boolean;
  orderedList: boolean;
  checkList: boolean;
  quote: boolean;
  codeBlock: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  link: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

function normalizeHtml(value: string): string {
  return normalizeIncomingDraftBody(value).html;
}

type ToolbarButtonProps = {
  active?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
};

function ToolbarButton({ active = false, pressed = false, disabled = false, onClick, icon, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={active ? "is-active" : ""}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <span className="rf-lexical-toolbar-icon" aria-hidden="true">{icon}</span>
    </button>
  );
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    h3: false,
    paragraph: true,
    bulletList: false,
    orderedList: false,
    checkList: false,
    quote: false,
    codeBlock: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    link: false,
    canUndo: false,
    canRedo: false,
  });

  const updateToolbarState = () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setToolbarState((prev) => ({
        ...prev,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        h1: false,
        h2: false,
        h3: false,
        paragraph: true,
        bulletList: false,
        orderedList: false,
        checkList: false,
        quote: false,
        codeBlock: false,
        alignLeft: true,
        alignCenter: false,
        alignRight: false,
        link: false,
      }));
      return;
    }

    const anchorTopLevel = selection.anchor.getNode().getTopLevelElementOrThrow();
    const topLevelType = anchorTopLevel.getType();
    const listType = topLevelType === "list" && anchorTopLevel instanceof ListNode ? anchorTopLevel.getListType() : null;
    const formatType = $isElementNode(anchorTopLevel) ? anchorTopLevel.getFormatType() : "left";

    const node = selection.anchor.getNode();
    const parent = node.getParent();
    const isLink = node.getType() === "link" || parent?.getType() === "link";

    setToolbarState((prev) => ({
      ...prev,
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
      h1: topLevelType === "h1",
      h2: topLevelType === "h2",
      h3: topLevelType === "h3",
      paragraph: topLevelType === "paragraph",
      bulletList: listType === "bullet",
      orderedList: listType === "number",
      checkList: listType === "check",
      quote: topLevelType === "quote",
      codeBlock: topLevelType === "code",
      alignLeft: formatType === "left" || formatType === "start" || formatType === "",
      alignCenter: formatType === "center",
      alignRight: formatType === "right" || formatType === "end",
      link: Boolean(isLink),
    }));
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

    const unregisterCanUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setToolbarState((prev) => ({ ...prev, canUndo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterCanRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setToolbarState((prev) => ({ ...prev, canRedo: payload }));
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdate();
      unregisterSelection();
      unregisterCanUndo();
      unregisterCanRedo();
    };
  }, [editor]);

  const setHeading = (tag: "h1" | "h2" | "h3") => {
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

  const setQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createQuoteNode());
    });
  };

  const setCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createCodeNode());
    });
  };

  const toggleLink = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      const isLinked = node.getType() === "link" || parent?.getType() === "link";

      if (isLinked) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        return;
      }

      const url = window.prompt("Enter URL", "https://");
      if (!url) return;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
    });
  };

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (selection.hasFormat("bold")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
      if (selection.hasFormat("italic")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
      if (selection.hasFormat("underline")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
      if (selection.hasFormat("strikethrough")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
      if (selection.hasFormat("code")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");

      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      $setBlocksType(selection, () => $createParagraphNode());
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
    });
  };

  return (
    <div className="rf-lexical-toolbar" role="toolbar" aria-label="Editor formatting">
      <div className="rf-lexical-toolbar-group" aria-label="History">
        <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} icon={<Undo2 size={14} strokeWidth={2} />} label="Undo" disabled={!toolbarState.canUndo} />
        <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} icon={<Redo2 size={14} strokeWidth={2} />} label="Redo" disabled={!toolbarState.canRedo} />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Inline formatting">
        <ToolbarButton active={toolbarState.bold} pressed={toolbarState.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} icon={<Bold size={14} strokeWidth={2} />} label="Bold" />
        <ToolbarButton active={toolbarState.italic} pressed={toolbarState.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} icon={<Italic size={14} strokeWidth={2} />} label="Italic" />
        <ToolbarButton active={toolbarState.underline} pressed={toolbarState.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} icon={<Underline size={14} strokeWidth={2} />} label="Underline" />
        <ToolbarButton active={toolbarState.strikethrough} pressed={toolbarState.strikethrough} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} icon={<Strikethrough size={14} strokeWidth={2} />} label="Strike" />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Block formatting">
        <ToolbarButton active={toolbarState.h1} pressed={toolbarState.h1} onClick={() => setHeading("h1")} icon={<Heading1 size={14} strokeWidth={2} />} label="H1" />
        <ToolbarButton active={toolbarState.h2} pressed={toolbarState.h2} onClick={() => setHeading("h2")} icon={<Heading2 size={14} strokeWidth={2} />} label="H2" />
        <ToolbarButton active={toolbarState.h3} pressed={toolbarState.h3} onClick={() => setHeading("h3")} icon={<Heading3 size={14} strokeWidth={2} />} label="H3" />
        <ToolbarButton active={toolbarState.paragraph} pressed={toolbarState.paragraph} onClick={setParagraph} icon={<Pilcrow size={14} strokeWidth={2} />} label="Paragraph" />
        <ToolbarButton active={toolbarState.quote} pressed={toolbarState.quote} onClick={setQuote} icon={<Quote size={14} strokeWidth={2} />} label="Quote" />
        <ToolbarButton active={toolbarState.codeBlock} pressed={toolbarState.codeBlock} onClick={setCodeBlock} icon={<Code size={14} strokeWidth={2} />} label="Code" />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Lists and links">
        <ToolbarButton active={toolbarState.bulletList} pressed={toolbarState.bulletList} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} icon={<List size={14} strokeWidth={2} />} label="Bullets" />
        <ToolbarButton active={toolbarState.orderedList} pressed={toolbarState.orderedList} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} icon={<ListOrdered size={14} strokeWidth={2} />} label="Numbered" />
        <ToolbarButton active={toolbarState.checkList} pressed={toolbarState.checkList} onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} icon={<CheckSquare size={14} strokeWidth={2} />} label="Checklist" />
        <ToolbarButton active={toolbarState.link} pressed={toolbarState.link} onClick={toggleLink} icon={<LinkIcon size={14} strokeWidth={2} />} label="Link" />
        <ToolbarButton onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)} icon={<Unlink size={14} strokeWidth={2} />} label="Unlink" />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Alignment and cleanup">
        <ToolbarButton active={toolbarState.alignLeft} pressed={toolbarState.alignLeft} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} icon={<AlignLeft size={14} strokeWidth={2} />} label="Left" />
        <ToolbarButton active={toolbarState.alignCenter} pressed={toolbarState.alignCenter} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} icon={<AlignCenter size={14} strokeWidth={2} />} label="Center" />
        <ToolbarButton active={toolbarState.alignRight} pressed={toolbarState.alignRight} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} icon={<AlignRight size={14} strokeWidth={2} />} label="Right" />
        <ToolbarButton onClick={clearFormatting} icon={<RemoveFormatting size={14} strokeWidth={2} />} label="Clear formatting" />
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
      nodes: [HeadingNode, QuoteNode, CodeNode, LinkNode, ListNode, ListItemNode],
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
        <LinkPlugin />
        <SyncValuePlugin value={value} onReadyChange={onReadyChange} />
        <OnChangePlugin onChange={(_state, activeEditor) => handleChange(activeEditor, onChange)} />
      </div>
    </LexicalComposer>
  );
}

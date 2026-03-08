"use client";

import React, { useEffect, useId, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
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
  $setSelection,
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
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
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
  const tooltipId = useId();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleShow = () => {
    if (disabled) return;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (isTooltipVisible || showTimerRef.current) {
      return;
    }
    showTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(true);
      showTimerRef.current = null;
    }, 500);
  };

  const scheduleHide = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
      hideTimerRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <span className="rf-lexical-toolbar-button-wrap">
      <button
        type="button"
        className={active ? "is-active" : ""}
        aria-label={label}
        aria-pressed={pressed}
        aria-describedby={isTooltipVisible ? tooltipId : undefined}
        title={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => {
          setIsHovering(true);
          scheduleShow();
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          if (!isFocused) {
            scheduleHide();
          }
        }}
        onFocus={() => {
          setIsFocused(true);
          scheduleShow();
        }}
        onBlur={() => {
          setIsFocused(false);
          if (!isHovering) {
            scheduleHide();
          }
        }}
        onClick={onClick}
      >
        <span className="rf-lexical-toolbar-icon" aria-hidden="true">{icon}</span>
      </button>
      {isTooltipVisible ? (
        <span id={tooltipId} role="tooltip" className="rf-lexical-toolbar-tooltip">
          {label}
        </span>
      ) : null}
    </span>
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
    paragraph: false,
    bulletList: false,
    orderedList: false,
    checkList: false,
    quote: false,
    codeBlock: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    link: false,
    canUndo: false,
    canRedo: false,
  });
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [linkUrlDraft, setLinkUrlDraft] = useState("https://");
  const savedSelectionRef = useRef<ReturnType<typeof $getSelection> | null>(null);

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
        paragraph: false,
        bulletList: false,
        orderedList: false,
        checkList: false,
        quote: false,
        codeBlock: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        link: false,
      }));
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    const anchorTopLevel = anchorNode.getTopLevelElementOrThrow();
    const topLevelType = anchorTopLevel.getType();
    const listNode = anchorNode.getParents().find((parentNode) => parentNode instanceof ListNode);
    const listType = listNode instanceof ListNode ? listNode.getListType() : null;
    const formatType = $isElementNode(anchorTopLevel) ? anchorTopLevel.getFormatType() : "";

    const isLink =
      anchorNode.getType() === "link" ||
      focusNode.getType() === "link" ||
      anchorNode.getParents().some((parentNode) => parentNode.getType() === "link") ||
      focusNode.getParents().some((parentNode) => parentNode.getType() === "link");

    setToolbarState((prev) => ({
      ...prev,
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
      h1: topLevelType === "h1",
      h2: topLevelType === "h2",
      h3: topLevelType === "h3",
      paragraph: topLevelType === "paragraph" || topLevelType === "root",
      bulletList: listType === "bullet",
      orderedList: listType === "number",
      checkList: listType === "check",
      quote: topLevelType === "quote",
      codeBlock: topLevelType === "code",
      alignLeft: formatType === "left" || formatType === "start" || formatType === "" || formatType === undefined,
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
        editor.getEditorState().read(updateToolbarState);
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

  const withRangeSelection = (action: () => void) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      action();
    });
  };

  const toggleTextFormat = (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
    withRangeSelection(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    });
  };

  const toggleAlignment = (align: "left" | "center" | "right") => {
    withRangeSelection(() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
    });
  };

  const toggleList = (kind: "bullet" | "number" | "check") => {
    withRangeSelection(() => {
      if ((kind === "bullet" && toolbarState.bulletList) || (kind === "number" && toolbarState.orderedList) || (kind === "check" && toolbarState.checkList)) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        return;
      }
      if (kind === "bullet") editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      if (kind === "number") editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      if (kind === "check") editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    });
  };

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

  const toggleLinkEditor = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      const linkNode =
        anchorNode.getParents().find((parentNode) => parentNode.getType() === "link") ||
        focusNode.getParents().find((parentNode) => parentNode.getType() === "link");

      const existingUrl = $isLinkNode(linkNode) ? linkNode.getURL() : "https://";
      savedSelectionRef.current = selection.clone();
      setLinkUrlDraft(existingUrl || "https://");
      setIsLinkEditorOpen(true);
    });
  };

  const applyLink = () => {
    const nextUrl = linkUrlDraft.trim();
    if (!nextUrl) return;

    editor.update(() => {
      if (savedSelectionRef.current) {
        $setSelection(savedSelectionRef.current);
      }

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, nextUrl);
    });

    setIsLinkEditorOpen(false);
  };

  const removeLink = () => {
    editor.update(() => {
      if (savedSelectionRef.current) {
        $setSelection(savedSelectionRef.current);
      }
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    });
    setIsLinkEditorOpen(false);
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
        <ToolbarButton active={toolbarState.bold} pressed={toolbarState.bold} onClick={() => toggleTextFormat("bold")} icon={<Bold size={14} strokeWidth={2} />} label="Bold" />
        <ToolbarButton active={toolbarState.italic} pressed={toolbarState.italic} onClick={() => toggleTextFormat("italic")} icon={<Italic size={14} strokeWidth={2} />} label="Italic" />
        <ToolbarButton active={toolbarState.underline} pressed={toolbarState.underline} onClick={() => toggleTextFormat("underline")} icon={<Underline size={14} strokeWidth={2} />} label="Underline" />
        <ToolbarButton active={toolbarState.strikethrough} pressed={toolbarState.strikethrough} onClick={() => toggleTextFormat("strikethrough")} icon={<Strikethrough size={14} strokeWidth={2} />} label="Strike" />
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
        <ToolbarButton active={toolbarState.bulletList} pressed={toolbarState.bulletList} onClick={() => toggleList("bullet")} icon={<List size={14} strokeWidth={2} />} label="Bullets" />
        <ToolbarButton active={toolbarState.orderedList} pressed={toolbarState.orderedList} onClick={() => toggleList("number")} icon={<ListOrdered size={14} strokeWidth={2} />} label="Numbered" />
        <ToolbarButton active={toolbarState.checkList} pressed={toolbarState.checkList} onClick={() => toggleList("check")} icon={<CheckSquare size={14} strokeWidth={2} />} label="Checklist" />
        <ToolbarButton active={toolbarState.link} pressed={toolbarState.link} onClick={toggleLinkEditor} icon={<LinkIcon size={14} strokeWidth={2} />} label="Link" />
        <ToolbarButton onClick={removeLink} icon={<Unlink size={14} strokeWidth={2} />} label="Unlink" />
      </div>
      <div className="rf-lexical-toolbar-divider" aria-hidden="true" />
      <div className="rf-lexical-toolbar-group" aria-label="Alignment and cleanup">
        <ToolbarButton active={toolbarState.alignLeft} pressed={toolbarState.alignLeft} onClick={() => toggleAlignment("left")} icon={<AlignLeft size={14} strokeWidth={2} />} label="Left" />
        <ToolbarButton active={toolbarState.alignCenter} pressed={toolbarState.alignCenter} onClick={() => toggleAlignment("center")} icon={<AlignCenter size={14} strokeWidth={2} />} label="Center" />
        <ToolbarButton active={toolbarState.alignRight} pressed={toolbarState.alignRight} onClick={() => toggleAlignment("right")} icon={<AlignRight size={14} strokeWidth={2} />} label="Right" />
        <ToolbarButton onClick={clearFormatting} icon={<RemoveFormatting size={14} strokeWidth={2} />} label="Clear formatting" />
      </div>
      {isLinkEditorOpen ? (
        <div className="rf-lexical-link-popover" role="group" aria-label="Edit link">
          <input
            type="url"
            value={linkUrlDraft}
            onChange={(event) => setLinkUrlDraft(event.target.value)}
            placeholder="https://example.com"
            onMouseDown={(event) => event.stopPropagation()}
          />
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={applyLink}>Apply</button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={removeLink}>Remove</button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setIsLinkEditorOpen(false)}>Cancel</button>
        </div>
      ) : null}
    </div>
  );
}

function SyncValuePlugin({
  value,
  onReadyChange,
  lastKnownHtmlRef,
}: {
  value: string;
  onReadyChange?: (isReady: boolean) => void;
  lastKnownHtmlRef: MutableRefObject<string>;
}) {
  const [editor] = useLexicalComposerContext();
  const lastAppliedValueRef = useRef("");

  useEffect(() => {
    const nextValue = normalizeHtml(value);
    if (nextValue === lastAppliedValueRef.current || nextValue === lastKnownHtmlRef.current) {
      lastAppliedValueRef.current = nextValue;
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
    lastKnownHtmlRef.current = nextValue;
    onReadyChange?.(true);
  }, [editor, onReadyChange, value]);

  return null;
}

function handleChange(
  editor: LexicalEditor,
  onChange: (change: LexicalChange) => void,
  lastKnownHtmlRef: MutableRefObject<string>,
) {
  editor.getEditorState().read(() => {
    const html = $generateHtmlFromNodes(editor, null);
    const normalized = normalizeEditorChange(html);
    lastKnownHtmlRef.current = normalized.html;
    onChange({ html: normalized.html, text: normalized.text });
  });
}

export function LexicalEditorField({ value, onChange, placeholder, onReadyChange }: LexicalEditorFieldProps) {
  const lastKnownHtmlRef = useRef(normalizeHtml(value));
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
        <SyncValuePlugin value={value} onReadyChange={onReadyChange} lastKnownHtmlRef={lastKnownHtmlRef} />
        <OnChangePlugin onChange={(_state, activeEditor) => handleChange(activeEditor, onChange, lastKnownHtmlRef)} ignoreSelectionChange />
      </div>
    </LexicalComposer>
  );
}

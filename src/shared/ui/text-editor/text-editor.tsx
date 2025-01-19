"use client";
import "./styles.css";

import { Editor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import React, { FC, ReactNode } from "react";
import { Button } from "@ui/button";
import { useEditor } from "@tiptap/react";
import { FieldError } from "react-hook-form";

import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Heading from "@tiptap/extension-heading";
import Text from "@tiptap/extension-text";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Paragraph from "@tiptap/extension-paragraph";
import Bold from "@tiptap/extension-bold";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import Blockquote from "@tiptap/extension-blockquote";

const extensions = [
  Heading,
  Document,
  Text,
  OrderedList.configure({ keepMarks: true, keepAttributes: false }),
  ListItem,
  BulletList.configure({ keepMarks: true, keepAttributes: false }),
  Paragraph,
  Bold,
  History,
  Italic,
  Blockquote,
  HorizontalRule,
];

type EditorButtonProps = {
  action: () => void;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
  children: ReactNode;
};
const EditorButton: FC<EditorButtonProps> = ({
  action,
  isActive,
  isDisabled,
  children,
}) => {
  return (
    <Button
      type="button"
      onClick={action}
      disabled={isDisabled ? isDisabled() : false}
      className={`p-1 h-auto ${isActive && isActive() ? "!bg-[#6A00F5] text-white" : "bg-gray-200 text-black"}`}
    >
      {children}
    </Button>
  );
};

type MenuBarProps = {
  editor: Editor | null;
};
const MenuBar: FC<MenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="bg-background sticky p-2 top-0 z-10 border-b">
      <div className="button-group">
        <EditorButton
          action={() => editor.chain().focus().toggleBold().run()}
          isActive={() => editor.isActive("bold")}
          isDisabled={() => !editor.can().chain().focus().toggleBold().run()}
        >
          Bold
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().toggleItalic().run()}
          isActive={() => editor.isActive("italic")}
          isDisabled={() => !editor.can().chain().focus().toggleItalic().run()}
        >
          Italic
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().setParagraph().run()}
          isActive={() => editor.isActive("paragraph")}
        >
          Paragraph
        </EditorButton>

        <EditorButton
          action={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={() => editor.isActive("heading", { level: 1 })}
        >
          H1
        </EditorButton>

        <EditorButton
          action={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={() => editor.isActive("heading", { level: 2 })}
        >
          H2
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().toggleBulletList().run()}
          isActive={() => editor.isActive("bulletList")}
        >
          Bullet list
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={() => editor.isActive("orderedList")}
        >
          Ordered list
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={() => editor.isActive("blockquote")}
        >
          Blockquote
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().undo().run()}
          isDisabled={() => !editor.can().chain().focus().undo().run()}
        >
          Undo
        </EditorButton>

        <EditorButton
          action={() => editor.chain().focus().redo().run()}
          isDisabled={() => !editor.can().chain().focus().redo().run()}
        >
          Redo
        </EditorButton>
      </div>
    </div>
  );
};

type TextEditorProps = {
  onChange?: (text: string) => void;
  value?: string;
  error?: FieldError;
  editable?: boolean;
};

export const TextEditor: FC<TextEditorProps> = ({
  editable = true,
  value,
  onChange,
  error,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable,
  });

  return (
    <div>
      {editor?.isEditable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

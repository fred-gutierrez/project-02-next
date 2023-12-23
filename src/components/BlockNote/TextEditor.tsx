import { useState } from "react";
import { Block, BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { theme } from "./Theme";
import ExportToMarkdown from "../ExportToMarkdown";
import "@blocknote/core/style.css";
import CopyMenu from "../CopyMenu";
import { useHideExport, useHideCopy } from "../../context/SettingsProvider";
import { useDarkMode } from "../../context/DarkModeProvider";

export default function TextEditor() {
  const [markdown, setMarkdown] = useState<string>("");
  const [text, setText] = useState<string>("");

  const { isDarkMode } = useDarkMode();
  const { hideExport } = useHideExport();
  const { hideCopy } = useHideCopy();

  const saveBlocksAsMarkdown = async (blocks: Block[]) => {
    const markdown: string = await editor.blocksToMarkdown(
      blocks.filter((block: Block) => block.type !== "image"),
    );
    setMarkdown(markdown);
  };

  const saveText = (blocks: Block[]) => {
    const textContent: string = blocks
      .filter((block: Block) => block.type !== "image")
      .map((block: Block) => block.content?.map((inline: any) => inline.text))
      .join("\n");

    setText(textContent);
  };

  // This gets the previously stored editor contents (Must be within the text editor to ensure that when changing routes it gets the most recent text)
  const initialContent: string | null = localStorage.getItem("editorContent");

  const editor: BlockNoteEditor = useBlockNote({
    // If the editor contents were previously saved, this restores them
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,

    onEditorContentChange: (editor) => {
      // Serializes and saves the editor contents to local storage.
      localStorage.setItem(
        "editorContent",
        JSON.stringify(editor.topLevelBlocks),
      );

      saveBlocksAsMarkdown(editor.topLevelBlocks);

      saveText(editor.topLevelBlocks);
    },

    onEditorReady: (editor) => {
      if (initialContent) {
        saveBlocksAsMarkdown(editor.topLevelBlocks);
        saveText(editor.topLevelBlocks);
      }
    },
  });

  return (
    <div className="flex flex-col h-112 overflow-hidden">
      <BlockNoteView
        editor={editor}
        className="flex-1 overflow-y-auto rounded-xl dark:bg-neutral-600 bg-neutral-200"
        theme={isDarkMode ? theme.dark : theme.light}
      />
      {!hideCopy && !hideExport ? (
        <div className="grid grid-cols-2 mt-4 gap-4">
          <ExportToMarkdown markdown={markdown} />
          <CopyMenu text={text} markdown={markdown} />
        </div>
      ) : !hideCopy || !hideExport ? (
        <div className="mt-4 grid w-full">
          {hideExport ? null : (
            <ExportToMarkdown markdown={markdown} />
          )}
          {hideCopy ? null : <CopyMenu text={text} markdown={markdown} />}
        </div>
      ) : null}
    </div>
  );
}

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";
import { keymap } from "prosemirror-keymap";
import { undo, redo } from "y-prosemirror";


const CollaborativeEditor = ({ docId }) => {
    const ydoc = new Y.Doc();
    const roomName = docId;
    const provider = new WebsocketProvider('ws://localhost:1234', roomName, ydoc);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      ySyncPlugin(ydoc.getXmlFragment("prosemirror")),
      yCursorPlugin(provider.awareness),
      yUndoPlugin(),
      keymap({
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-Shift-z": redo,
      }),
    ],
    content: "<p>Start collaborating...</p>",
  });

  useEffect(() => {
    
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default CollaborativeEditor;

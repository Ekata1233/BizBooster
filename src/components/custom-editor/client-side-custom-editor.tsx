// In your custom-editor.jsx
"use client";

import React, { useEffect, useRef } from "react";

export default function CustomEditor() {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Your editor initialization logic
    import("@ckeditor/ckeditor5-build-classic").then((CKEditorModule) => {
      const ClassicEditor = CKEditorModule.default;

      if (!isMounted || !editorRef.current) return;

      ClassicEditor.create(editorRef.current)
        .then((editor: unknown) => {
          // Do something with the editor
        })
        .catch((error: unknown) => console.error(error));
    });

    return () => {
      isMounted = false;
      // destroy editor instance if needed
    };
  }, []);

  return <div ref={editorRef} />;
}

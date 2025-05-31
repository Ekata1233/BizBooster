// components/custom-editor.js
'use client'; // Required only in App Router.

import React, { useEffect, useState } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CustomEditor = () => {
    const [mounted, setMounted] = useState(false);
    const cloud = useCKEditorCloud({
        version: '45.1.0',
        premium: true
    });

  useEffect(() => {
    // Ensures we're in the browser and component is mounted
    setMounted(true);
  }, []);

  if (!mounted || cloud.status === 'loading') {
    return <div>Loading...</div>;
  }

    if (cloud.status === 'loading') {
        return <div>Loading...</div>;
    }

    const {
        ClassicEditor,
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Heading,
        Link,
        Image,
        ImageUpload,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        Table,
        TableToolbar,
        BlockQuote,
        MediaEmbed,
        List,
        Indent,
        IndentBlock
    } = cloud.CKEditor;

    const { FormatPainter } = cloud.CKEditorPremiumFeatures;

    return (
        <CKEditor
            editor={ClassicEditor}
            data={'<p>Hello world!</p>'}
            config={{
                licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDk5NDU1OTksImp0aSI6ImYxMGRiNTAwLWMwMWYtNDQyNS1iYTYyLWNhZjA0NzQ4MDhjYiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjdhYTU5ODFkIn0.jfrrljzRoIcmEpjTg9ed5FYsg5ipYgo1RBymj4eMsEniUagapuZ3A76FyQpdPuW1qo4aEFZJEqsMQjGN9F7NEQ',
                plugins: [
                    Essentials,
                    Paragraph,
                    Bold,
                    Italic,
                    Heading,
                    Link,
                    Image,
                    ImageUpload,
                    ImageToolbar,
                    ImageCaption,
                    ImageStyle,
                    Table,
                    TableToolbar,
                    BlockQuote,
                    MediaEmbed,
                    List,
                    Indent,
                    IndentBlock,
                    FormatPainter
                ],
                toolbar: [
                    'undo', 'redo', '|',
                    'heading', '|',
                    'bold', 'italic', 'link', '|',
                    'bulletedList', 'numberedList', '|',
                    'outdent', 'indent', '|',
                    'blockQuote', 'insertTable', 'mediaEmbed', '|',
                    'uploadImage', '|',
                    'formatPainter'
                ],
                image: {
                    toolbar: [
                        'imageStyle:full',
                        'imageStyle:side',
                        '|',
                        'imageTextAlternative'
                    ]
                },
                table: {
                    contentToolbar: [
                        'tableColumn',
                        'tableRow',
                        'mergeTableCells'
                    ]
                },
                mediaEmbed: {
                    previewsInData: true
                },
                content: {
                    styles: [
                        {
                            name: 'Dark Text',
                            css: 'body { color: #000000; }'
                        }
                    ]
                }
            }}
        />
    );
};

export default CustomEditor;

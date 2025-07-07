// components/custom-editor.js
'use client'; // Required only in App Router.

import React, { useEffect, useState } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

interface CustomEditorProps {
    value: string;
    onChange: (data: string) => void;
}

const CustomEditor: React.FC<CustomEditorProps> = ({ value, onChange }) => {
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
            data={value}
            onChange={(
                event: Event,
                editor: import('@ckeditor/ckeditor5-core').Editor
            ) => {
                const data = editor.getData();
                onChange(data);
            }}
            config={{
                  licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTE5MzI3OTksImp0aSI6IjFiNDU5MjJiLTRkMTAtNDljNy1iZDhlLTdjNDNlMzdmNTIyMSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjkwNmExY2I0In0.325udSQOEWxxJb_JyxC3WwR1H2QzWM5zKGNoBtedSuO60dGOXAMrJX8YDXwvseH5Tr-u1CuSAIgWmhdfWgLnSQ',
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
                    FormatPainter,
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
                simpleUpload: {
                    uploadUrl: '/api/upload', // 👈 your Next.js route to handle ImageKit upload
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

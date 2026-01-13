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
        setMounted(true);
    }, []);

    if (!mounted || cloud.status === 'loading') {
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
        IndentBlock,
        FontColor,             
        FontBackgroundColor     
    } = cloud.CKEditor;

    const { FormatPainter } = cloud.CKEditorPremiumFeatures;

    return (
        <CKEditor
            editor={ClassicEditor}
            data={value}
            onChange={(event: Event, editor: import('@ckeditor/ckeditor5-core').Editor) => {
                const data = editor.getData();
                onChange(data);
            }}
            config={{
                licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3Njk1NTgzOTksImp0aSI6IjYxMmM1OTJlLTkxMWMtNGMyNS05MmU1LTZlMWNkMDkyMjFiYyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjVjMjJhNDI2In0.stRFrqoi2TaPx6lpuCeHdpNoyP-w762125xijNvNRSae_VQoQlZE-PVKpjlY89P4C3CVkQ87JpzjMqAXX2D4PQ',
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
                    FontColor,              
                    FontBackgroundColor
                ],
                toolbar: [
                    'undo', 'redo', '|',
                    'heading', '|',
                    'bold', 'italic', 'link', '|',
                    'fontColor', 'fontBackgroundColor', '|',
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
                    uploadUrl: '/api/upload'
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

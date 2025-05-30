'use client';

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Editor } from '@ckeditor/ckeditor5-core';

type Props = {
  data: string;
  onChange: (data: string) => void;
};

const CKEditorClient = ({ data, onChange }: Props) => {
  return (
    <CKEditor
    cla
      editor={ClassicEditor}
      data={data}
      onChange={(editor: Editor) => {
        const value = editor.getData();
        onChange(value);
      }}
      config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            'blockQuote',
          ],
        }}
    />
  );
};

export default CKEditorClient;

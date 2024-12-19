'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { JsonObject } from '@prisma/client/runtime/library';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { Value } from '@udecode/slate';

export function PlateEditor({ value, onChange }: { value: any[], onChange: (...event: any[]) => void }) {
  // const editor = useCreateEditor();
  const editor = usePlateEditor({
    plugins: [
      HeadingPlugin,
      BlockquotePlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
    ],
    value,
  })

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate 
        editor={editor}
        onChange={({ value }) => {
          console.log(`Editor value`, JSON.stringify(value))
          onChange(value)
        }}
      >
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}

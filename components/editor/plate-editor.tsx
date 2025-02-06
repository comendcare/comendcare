'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plate } from '@udecode/plate-common/react';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateEditor({ value, onChange }: { value: any[], onChange: (...event: any[]) => void }) {
  const editor = useCreateEditor({ value })

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate 
        editor={editor}
        onChange={({ value }) => onChange(value)}
      >
        <EditorContainer className="border-[1px] rounded-sm overflow-visible">
          <Editor variant="fullWidth" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}

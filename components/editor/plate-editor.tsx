'use client';

import React, { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createPlateEditor, Plate } from '@udecode/plate-common/react';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

type PlateEditorProps = {
  value: any[]
  onChange: (value: any[]) => void
}

export function PlateEditor({ value, onChange }: PlateEditorProps) {
  const editor = useCreateEditor({ value })

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate 
        editor={editor}
        onChange={({ value }) => onChange(value)}
      >
        <EditorContainer className="border-[1px] rounded-sm w-full">
          <Editor className="w-full" variant="fullWidth" />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}

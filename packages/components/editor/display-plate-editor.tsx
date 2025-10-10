'use client';

import React, { useEffect, useState } from 'react';

import { ParagraphPlugin, Plate, PlateEditor, useEditorState, usePlateEditor } from '@udecode/plate-common/react';

import { Editor, EditorContainer } from './../plate-ui/editor';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { withProps } from '@udecode/cn';
import {
  CodePlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
} from '@udecode/plate-basic-marks/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  PlateLeaf,
} from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';

import { editorPlugins } from './../editor/plugins/editor-plugins';
import { BlockquoteElement } from './../plate-ui/blockquote-element';
import { CodeBlockElement } from './../plate-ui/code-block-element';
import { CodeLeaf } from './../plate-ui/code-leaf';
import { CodeLineElement } from './../plate-ui/code-line-element';
import { CodeSyntaxLeaf } from './../plate-ui/code-syntax-leaf';
import { ColumnElement } from './../plate-ui/column-element';
import { ColumnGroupElement } from './../plate-ui/column-group-element';
import { CommentLeaf } from './../plate-ui/comment-leaf';
import { DateElement } from './../plate-ui/date-element';
import { EmojiInputElement } from './../plate-ui/emoji-input-element';
import { HeadingElement } from './../plate-ui/heading-element';
import { HighlightLeaf } from './../plate-ui/highlight-leaf';
import { HrElement } from './../plate-ui/hr-element';
import { ImageElement } from './../plate-ui/image-element';
import { KbdLeaf } from './../plate-ui/kbd-leaf';
import { LinkElement } from './../plate-ui/link-element';
import { MediaAudioElement } from './../plate-ui/media-audio-element';
import { MediaEmbedElement } from './../plate-ui/media-embed-element';
import { MediaFileElement } from './../plate-ui/media-file-element';
import { MediaVideoElement } from './../plate-ui/media-video-element';
import { MentionElement } from './../plate-ui/mention-element';
import { MentionInputElement } from './../plate-ui/mention-input-element';
import { ParagraphElement } from './../plate-ui/paragraph-element';
import { withPlaceholders } from './../plate-ui/placeholder';
import { SlashInputElement } from './../plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from './../plate-ui/table-cell-element';
import { TableElement } from './../plate-ui/table-element';
import { TableRowElement } from './../plate-ui/table-row-element';
import { TocElement } from './../plate-ui/toc-element';
import { ToggleElement } from './../plate-ui/toggle-element';

export function DisplayPlateEditor({ value }: { value: any[] }) {
  // this Plate Editor is basically the same as the useCreateEditor, except
  // it's not interactive and it doesn't include the toolbars
  const editor = usePlateEditor({ 
    override: {
      components:
        withPlaceholders({
          [AudioPlugin.key]: MediaAudioElement,
          [BlockquotePlugin.key]: BlockquoteElement,
          [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
          [CodeBlockPlugin.key]: CodeBlockElement,
          [CodeLinePlugin.key]: CodeLineElement,
          [CodePlugin.key]: CodeLeaf,
          [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
          [ColumnItemPlugin.key]: ColumnElement,
          [ColumnPlugin.key]: ColumnGroupElement,
          [CommentsPlugin.key]: CommentLeaf,
          [DatePlugin.key]: DateElement,
          [EmojiInputPlugin.key]: EmojiInputElement,
          [FilePlugin.key]: MediaFileElement,
          [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
          [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
          [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
          [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
          [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
          [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
          [HighlightPlugin.key]: HighlightLeaf,
          [HorizontalRulePlugin.key]: HrElement,
          [ImagePlugin.key]: ImageElement,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [KbdPlugin.key]: KbdLeaf,
          [LinkPlugin.key]: LinkElement,
          [MediaEmbedPlugin.key]: MediaEmbedElement,
          [MentionInputPlugin.key]: MentionInputElement,
          [MentionPlugin.key]: MentionElement,
          [ParagraphPlugin.key]: ParagraphElement,
          [SlashInputPlugin.key]: SlashInputElement,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
          [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
          [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          [TableCellPlugin.key]: TableCellElement,
          [TablePlugin.key]: TableElement,
          [TableRowPlugin.key]: TableRowElement,
          [TocPlugin.key]: TocElement,
          [TogglePlugin.key]: ToggleElement,
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
          [VideoPlugin.key]: MediaVideoElement,
        })
    },
    plugins: [ ...editorPlugins ],
    value
  })

  // this allows us to dynamically update the contents of our display editor when
  // the value prop changes (it doesn't do this automatically)
  useEffect(() => {
    if (editor) {
      editor.children = value
      editor.onChange()
    }
  }, [value, editor])

  return (
    <Plate editor={editor}>
      <EditorContainer className='w-full p-0 m-0'>
        <Editor disabled variant="fullWidthDisplay" />
      </EditorContainer>
    </Plate>
  );
}

'use client';

import {CalloutPlugin} from '@udecode/plate-callout/react';
import {ParagraphPlugin} from '@udecode/plate-common/react';
import {TogglePlugin} from '@udecode/plate-toggle/react';
import {DatePlugin} from '@udecode/plate-date/react';
import {DocxPlugin} from '@udecode/plate-docx';
import {EmojiPlugin} from '@udecode/plate-emoji/react';
import {
    FontBackgroundColorPlugin,
    FontColorPlugin,
    FontSizePlugin,
} from '@udecode/plate-font/react';
import {HighlightPlugin} from '@udecode/plate-highlight/react';
import {HorizontalRulePlugin} from '@udecode/plate-horizontal-rule/react';
import {JuicePlugin} from '@udecode/plate-juice';
import {ColumnPlugin} from '@udecode/plate-layout/react';
import {MarkdownPlugin} from '@udecode/plate-markdown';
import {
    EquationPlugin,
    InlineEquationPlugin,
} from '@udecode/plate-math/react';
import {SlashPlugin} from '@udecode/plate-slash-command/react';
import {TrailingBlockPlugin} from '@udecode/plate-trailing-block';

import {alignPlugin} from './align-plugin';
import {autoformatPlugin} from './autoformat-plugin';
import {basicNodesPlugins} from './basic-nodes-plugins';
import {commentsPlugin} from './comments-plugin';
import {cursorOverlayPlugin} from './cursor-overlay-plugin';
import {exitBreakPlugin} from './exit-break-plugin';
import {indentListPlugins} from './indent-list-plugins';
import {lineHeightPlugin} from './line-height-plugin';
import {linkPlugin} from './link-plugin';
import {mentionPlugin} from './mention-plugin';
import {resetBlockTypePlugin} from './reset-block-type-plugin';
import {softBreakPlugin} from './soft-break-plugin';
import {tablePlugin} from './table-plugin';

export const viewPlugins = [
    ...basicNodesPlugins,
    HorizontalRulePlugin,
    linkPlugin,
    DatePlugin,
    TogglePlugin,
    mentionPlugin,
    tablePlugin,
    InlineEquationPlugin,
    EquationPlugin,
    CalloutPlugin,
    ColumnPlugin,

    // Marks
    FontColorPlugin,
    FontBackgroundColorPlugin,
    FontSizePlugin,
    HighlightPlugin,

    // Block Style
    alignPlugin,
    ...indentListPlugins,
    lineHeightPlugin,

    // Collaboration
    commentsPlugin,
] as const;

export const editorPlugins = [
    // Nodes
    ...viewPlugins,

    // Functionality
    SlashPlugin,
    autoformatPlugin,
    cursorOverlayPlugin,
    EmojiPlugin,
    exitBreakPlugin,
    resetBlockTypePlugin,
    softBreakPlugin,
    TrailingBlockPlugin.configure({options: {type: ParagraphPlugin.key}}),

    // Deserialization
    DocxPlugin,
    MarkdownPlugin.configure({options: {indentList: true}}),
    JuicePlugin,

    // UI
    // FixedToolbarPlugin,
    // FloatingToolbarPlugin,
];

'use client';

import {
  NodeViewContent,
  NodeViewWrapper,
  type ReactNodeViewProps,
} from '@tiptap/react';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

export function CodeBlock({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}: ReactNodeViewProps) {
  return (
    <NodeViewWrapper className="relative">
      <NativeSelect
        className="absolute top-2 right-2 [&_select]:bg-popover [&_select]:text-popover-foreground"
        contentEditable={false}
        defaultValue={defaultLanguage}
        name="language"
        onChange={(e) => updateAttributes({ language: e.target.value })}
        size="sm"
      >
        <NativeSelectOption value="null">Auto</NativeSelectOption>
        {extension.options.lowlight.listLanguages().map((lang: string) => (
          <NativeSelectOption key={lang} value={lang}>
            {lang}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <pre>
        {/* @ts-expect-error - Tiptap types `as` as "div" only, but "code" works per docs */}
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

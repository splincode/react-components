/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import React, { HTMLAttributes, useMemo, useRef } from 'react';
import Highlight, { Language, Prism } from 'prism-react-renderer';
import { useScrollRegion } from '@zendeskgarden/container-scrollregion';
import {
  StyledCodeBlock,
  StyledCodeBlockContainer,
  StyledCodeBlockLine,
  StyledCodeBlockToken,
  StyledVisuallyHiddenText,
  StyledCodeBlockDiffMarker
} from '../styled';

export interface ICodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  /** Selects the language used by the Prism tokenizer */
  language?: Language;
  /** Specifies the font size */
  size?: 'small' | 'medium' | 'large';
  /** Applies light mode styling */
  isLight?: boolean;
  /** Displays line numbers */
  isNumbered?: boolean;
  /** Determines the lines to highlight */
  highlightLines?: number[];
  /** Differentiates lines being added */
  addLines?: number[];
  /** Differentiates lines being removed */
  removeLines?: number[];
  /** Differentiates lines being changed */
  changeLines?: number[];
  /** Differentiates lines being fillers without content (for example in a split view diff block) */
  fillerLines?: number[];
  /** Passes props to the code block container */
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export type DIFF_KIND = 'added' | 'removed' | 'changed' | 'filler';

type DIFF_KIND_PROPS = 'hue' | 'marker' | 'description';

export const diffKindMap: Record<DIFF_KIND, Record<DIFF_KIND_PROPS, string>> = {
  added: {
    hue: 'successHue',
    marker: '\u002B',
    description: 'Added line'
  },
  removed: {
    hue: 'dangerHue',
    marker: '\u2212',
    description: 'Removed line'
  },
  changed: {
    hue: 'warningHue',
    marker: '\u2022',
    description: 'Changed line'
  },
  filler: {
    hue: 'neutralHue',
    marker: '',
    description: 'Blank line'
  }
};

/**
 * @extends HTMLAttributes<HTMLPreElement>
 */
export const CodeBlock = React.forwardRef<HTMLPreElement, ICodeBlockProps>(
  (
    {
      children,
      containerProps,
      highlightLines,
      addLines,
      removeLines,
      changeLines,
      fillerLines,
      isLight,
      isNumbered,
      language,
      size,
      ...other
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const code = (Array.isArray(children) ? children[0] : children) as string;
    let _size: 'sm' | 'md' | 'lg';

    if (size === 'small') {
      _size = 'sm';
    } else if (size === 'medium') {
      _size = 'md';
    } else {
      _size = 'lg';
    }

    const dependency = useMemo(() => [size, children], [size, children]);

    const containerTabIndex = useScrollRegion({ containerRef, dependency });

    const isDiffBlock =
      !!addLines?.length || !!removeLines?.length || !!changeLines?.length || !!fillerLines?.length;

    const getDiffKind = (lineIndex: number) => {
      const isAdded = addLines && addLines.includes(lineIndex + 1);
      const isRemoved = removeLines && removeLines.includes(lineIndex + 1);
      const isChanged = changeLines && changeLines.includes(lineIndex + 1);
      const isFiller = fillerLines && fillerLines.includes(lineIndex + 1);

      let _diffKind: DIFF_KIND | undefined;
      /* Order below defines the treatment in case a line number is found in more than one input arrays */
      switch (true) {
        case isAdded:
          _diffKind = 'added';
          break;

        case isRemoved:
          _diffKind = 'removed';
          break;

        case isChanged:
          _diffKind = 'changed';
          break;

        case isFiller:
          _diffKind = 'filler';
          break;

        default:
          _diffKind = undefined;
      }

      return _diffKind;
    };

    const renderVisuallyHiddenDescription = (diffKind?: DIFF_KIND) => (
      <StyledVisuallyHiddenText>
        {diffKind ? diffKindMap[diffKind].description : ''}
      </StyledVisuallyHiddenText>
    );

    const renderDiffMarker = (diffKind?: DIFF_KIND) => (
      <StyledCodeBlockDiffMarker aria-hidden="true">
        {diffKind ? diffKindMap[diffKind].marker : ''}
      </StyledCodeBlockDiffMarker>
    );

    return (
      <StyledCodeBlockContainer {...containerProps} ref={containerRef} tabIndex={containerTabIndex}>
        <Highlight Prism={Prism} code={code ? code.trim() : ''} language={language || 'tsx'}>
          {({ className, tokens, getLineProps, getTokenProps }) => (
            <StyledCodeBlock className={className} ref={ref} isLight={isLight} {...other}>
              {tokens.map((line, index) => {
                const diffKind = isDiffBlock ? getDiffKind(index) : undefined;

                return (
                  <>
                    {isDiffBlock && renderVisuallyHiddenDescription(diffKind)}
                    <StyledCodeBlockLine
                      {...getLineProps({ line })}
                      key={index}
                      isHighlighted={highlightLines && highlightLines.includes(index + 1)}
                      isLight={isLight}
                      isNumbered={isNumbered}
                      size={_size}
                      diffKind={diffKind}
                      isInADiffBlock={isDiffBlock}
                    >
                      {isDiffBlock && renderDiffMarker(diffKind)}
                      {line.map((token, tokenKey) => (
                        <StyledCodeBlockToken
                          {...getTokenProps({ token })}
                          key={tokenKey}
                          isLight={isLight}
                          isADiffLine={!!diffKind}
                        >
                          {token.empty ? '\n' : token.content}
                        </StyledCodeBlockToken>
                      ))}
                    </StyledCodeBlockLine>
                  </>
                );
              })}
            </StyledCodeBlock>
          )}
        </Highlight>
      </StyledCodeBlockContainer>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';

CodeBlock.defaultProps = {
  language: 'tsx',
  size: 'medium'
};

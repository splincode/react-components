/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import styled, { css, ThemeProps, DefaultTheme } from 'styled-components';
import { DEFAULT_THEME, retrieveComponentStyles, getColor } from '@zendeskgarden/react-theming';
import { StyledFont } from './StyledFont';
import { DIFF_KIND, diffKindMap } from '../elements/CodeBlock';

const COMPONENT_ID = 'typography.codeblock_code';

const diffStyles = (props: IStyledCodeBlockLineProps & ThemeProps<DefaultTheme>) => {
  const diffHue = props.diffKind ? diffKindMap[props.diffKind].hue : '';
  const diffColor = getColor(diffHue, props.isLight ? 600 : 500, props.theme, 1);
  const diffBackgroundColor = getColor(diffHue, 600, props.theme, 0.2);

  return css`
    background-color: ${diffBackgroundColor};
    color: ${diffColor};
  `;
};

const highlightStyles = (props: IStyledCodeBlockLineProps & ThemeProps<DefaultTheme>) => {
  const hue = props.isLight ? props.theme.palette.black : props.theme.palette.white;
  const backgroundColor = getColor(hue, 600, props.theme, 0.1);

  return css`
    background-color: ${backgroundColor};
  `;
};

const lineNumberStyles = (props: IStyledCodeBlockLineProps & ThemeProps<DefaultTheme>) => {
  const { diffKind, isInADiffBlock } = props;
  const padding = `${props.theme.space.base * (isInADiffBlock ? 2 : 6)}px`;
  const color = diffKind
    ? 'inherit'
    : getColor('neutralHue', props.isLight ? 600 : 500, props.theme);

  return css`
    &::before {
      display: table-cell;
      padding-right: ${padding};
      width: 1px;
      text-align: right;
      color: ${color};
      content: counter(linenumber);
      counter-increment: linenumber;
    }
  `;
};

export interface IStyledCodeBlockLineProps {
  isHighlighted?: boolean;
  isLight?: boolean;
  isNumbered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  diffKind?: DIFF_KIND;
  isInADiffBlock?: boolean;
}

/**
 * 1. Fix line display for mobile.
 * 2. Match parent padding for overflow scroll.
 */
export const StyledCodeBlockLine = styled(StyledFont as 'code').attrs({
  'data-garden-id': COMPONENT_ID,
  'data-garden-version': PACKAGE_VERSION,
  as: 'code',
  isMonospace: true
})<IStyledCodeBlockLineProps>`
  display: table-row;
  height: ${props => props.theme.lineHeights[props.size!]}; /* [1] */
  direction: ltr;

  ${props => props.isHighlighted && highlightStyles(props)};

  ${props => props.diffKind && diffStyles(props)};

  ${props => props.isNumbered && lineNumberStyles(props)};

  &::after {
    display: inline-block;
    width: ${props => props.theme.space.base * 3}px; /* [2] */
    content: '';
  }

  ${props => retrieveComponentStyles(COMPONENT_ID, props)};
`;

StyledCodeBlockLine.defaultProps = {
  size: 'md',
  theme: DEFAULT_THEME
};

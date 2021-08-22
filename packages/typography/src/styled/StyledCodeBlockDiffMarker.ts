/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import styled from 'styled-components';
import { DEFAULT_THEME } from '@zendeskgarden/react-theming';

const COMPONENT_ID = 'typography.codeblock_diff_marker';

export const StyledCodeBlockDiffMarker = styled.span.attrs({
  'data-garden-id': COMPONENT_ID,
  'data-garden-version': PACKAGE_VERSION
})`
  display: inline-block;
  padding: 0 ${props => props.theme.space.xs};
  min-width: 12px;
`;

StyledCodeBlockDiffMarker.defaultProps = {
  theme: DEFAULT_THEME
};

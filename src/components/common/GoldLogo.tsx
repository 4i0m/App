/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QLogo } from './QLogo';

export const GoldLogo: React.FC<{ size?: number; className?: string }> = ({ size = 26, className = '' }) => {
  return <QLogo size={size} className={className} withGlow={true} />;
};

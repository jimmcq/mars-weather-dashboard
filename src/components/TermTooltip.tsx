/**
 * Term Tooltip Component
 * Automatically adds tooltips to Mars terminology based on the terminology dictionary
 */

'use client';

import { Tooltip } from './Tooltip';
import { getTermDefinition } from '@/lib/terminology';

/** Props for the TermTooltip component */
export interface TermTooltipProps {
  /** The term to wrap with a tooltip */
  term: string;
  /** The children to render (usually the term text) */
  children: React.ReactNode;
  /** Optional position for the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional CSS class for styling */
  className?: string;
  /** Whether to add visual indication (like underline) that term has a tooltip */
  showIndicator?: boolean;
}

/**
 * Wraps content with a tooltip if the term exists in the terminology dictionary
 * If no definition is found, renders children without a tooltip
 */
export function TermTooltip({
  term,
  children,
  position = 'top',
  className = '',
  showIndicator = true,
}: TermTooltipProps): React.ReactElement {
  const definition = getTermDefinition(term);

  // If no definition found, just render the children
  if (!definition) {
    return <>{children}</>;
  }

  const indicatorClass = showIndicator
    ? 'cursor-help border-b border-dotted border-slate-400 hover:border-slate-300'
    : '';

  return (
    <Tooltip content={definition.definition} position={position}>
      <span className={`${indicatorClass} ${className}`}>{children}</span>
    </Tooltip>
  );
}

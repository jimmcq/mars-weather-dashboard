/**
 * Tooltip Component for Mars Terminology
 * Provides hover definitions for Mars-related terms and acronyms
 */

'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/** Tooltip component props */
export interface TooltipProps {
  /** The content/definition to show in the tooltip */
  content: string;
  /** The trigger element(s) that will show the tooltip on hover */
  children: React.ReactNode;
  /** Optional position preference */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional delay before showing tooltip (ms) */
  delay?: number;
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * Accessible tooltip component for terminology definitions
 * Uses hover states and proper ARIA attributes for accessibility
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
}: TooltipProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Calculate optimal position based on viewport
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        // Tooltip dimensions (estimate for positioning)
        const tooltipWidth = 320; // min-w-64 + padding ~= 320px
        const tooltipHeight = 60; // estimated height

        let newPosition = position;

        // Check horizontal positioning
        if (position === 'left' || position === 'right') {
          if (position === 'left' && rect.left < tooltipWidth + 20) {
            newPosition = 'right';
          } else if (
            position === 'right' &&
            rect.right > windowWidth - tooltipWidth - 20
          ) {
            newPosition = 'left';
          }
        } else {
          // For top/bottom, check if tooltip would overflow horizontally
          const centerX = rect.left + rect.width / 2;
          const tooltipLeft = centerX - tooltipWidth / 2;
          const tooltipRight = centerX + tooltipWidth / 2;

          if (tooltipLeft < 20) {
            // Would overflow left, keep as top/bottom but will be adjusted in CSS
            newPosition = position;
          } else if (tooltipRight > windowWidth - 20) {
            // Would overflow right, keep as top/bottom but will be adjusted in CSS
            newPosition = position;
          }
        }

        // Check vertical positioning
        if (position === 'top' && rect.top < tooltipHeight + 20) {
          newPosition = 'bottom';
        } else if (
          position === 'bottom' &&
          rect.bottom > windowHeight - tooltipHeight - 20
        ) {
          newPosition = 'top';
        }

        setActualPosition(newPosition);
      }

      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getTooltipClasses = (): string => {
    return 'z-50 min-w-64 max-w-sm rounded-lg border border-slate-600 bg-slate-800/95 px-4 py-3 text-sm text-slate-200 shadow-lg backdrop-blur-sm';
  };

  const getTooltipPosition = (): Record<string, number | string> => {
    if (!triggerRef.current) return {};

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 60; // estimated
    const margin = 8;

    let left = 0;
    let top = 0;

    switch (actualPosition) {
      case 'top':
        top = rect.top - tooltipHeight - margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - margin;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + margin;
        break;
    }

    // Clamp to viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    left = Math.max(
      margin,
      Math.min(left, viewportWidth - tooltipWidth - margin)
    );
    top = Math.max(
      margin,
      Math.min(top, viewportHeight - tooltipHeight - margin)
    );

    return { left, top };
  };

  const getArrowClasses = (): string => {
    const baseClasses =
      'absolute h-2 w-2 rotate-45 bg-slate-800 border border-slate-600';

    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-0 left-1/2 -mb-1 -translate-x-1/2 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseClasses} top-0 left-1/2 -mt-1 -translate-x-1/2 border-b-0 border-r-0`;
      case 'left':
        return `${baseClasses} right-0 top-1/2 -mr-1 -translate-y-1/2 border-l-0 border-b-0`;
      case 'right':
        return `${baseClasses} left-0 top-1/2 -ml-1 -translate-y-1/2 border-r-0 border-t-0`;
      default:
        return `${baseClasses} bottom-0 left-1/2 -mb-1 -translate-x-1/2 border-t-0 border-l-0`;
    }
  };

  return (
    <span
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={getTooltipClasses()}
                role="tooltip"
                aria-hidden={!isVisible}
                style={{
                  position: 'fixed',
                  ...getTooltipPosition(),
                }}
              >
                {content}
                <div className={getArrowClasses()}></div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}

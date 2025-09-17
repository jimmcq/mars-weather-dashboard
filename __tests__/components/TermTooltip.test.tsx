/**
 * Tests for the TermTooltip component
 * Covers terminology lookup, tooltip rendering, and fallback behavior
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { TermTooltip } from '@/components/TermTooltip';

// Mock the terminology module
jest.mock('@/lib/terminology', () => ({
  getTermDefinition: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<
      Record<string, unknown>
    >): React.ReactElement => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
}));

import { getTermDefinition } from '@/lib/terminology';

const mockGetTermDefinition = getTermDefinition as jest.MockedFunction<
  typeof getTermDefinition
>;

describe('TermTooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Term Recognition', () => {
    test('renders tooltip when term is found in dictionary', async () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'Sol',
        definition: 'A Mars day, which is about 24 hours and 37 minutes long.',
        category: 'time',
      });

      render(
        <TermTooltip term="sol">
          <span>Sol 4000</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('Sol 4000');
      expect(trigger.parentElement).toHaveClass(
        'cursor-help',
        'border-b',
        'border-dotted'
      );

      fireEvent.mouseEnter(trigger.parentElement!);
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'A Mars day, which is about 24 hours and 37 minutes long.'
          )
        ).toBeInTheDocument();
      });

      expect(mockGetTermDefinition).toHaveBeenCalledWith('sol');
    });

    test('renders without tooltip when term is not found', () => {
      mockGetTermDefinition.mockReturnValue(null);

      render(
        <TermTooltip term="unknown-term">
          <span>Unknown Term</span>
        </TermTooltip>
      );

      const text = screen.getByText('Unknown Term');
      expect(text.parentElement).not.toHaveClass('cursor-help');
      expect(mockGetTermDefinition).toHaveBeenCalledWith('unknown-term');
    });
  });

  describe('Visual Indicators', () => {
    test('shows visual indicator by default', () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'REMS',
        definition: 'Rover Environmental Monitoring Station',
        category: 'weather',
      });

      render(
        <TermTooltip term="REMS">
          <span>REMS</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('REMS');
      expect(trigger.parentElement).toHaveClass(
        'cursor-help',
        'border-b',
        'border-dotted',
        'border-slate-400'
      );
    });

    test('hides visual indicator when showIndicator is false', () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'REMS',
        definition: 'Rover Environmental Monitoring Station',
        category: 'weather',
      });

      render(
        <TermTooltip term="REMS" showIndicator={false}>
          <span>REMS</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('REMS');
      expect(trigger.parentElement).not.toHaveClass('cursor-help', 'border-b');
    });
  });

  describe('Positioning', () => {
    test('passes position prop to underlying Tooltip', async () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'MTC',
        definition: 'Coordinated Mars Time',
        category: 'time',
      });

      render(
        <TermTooltip term="MTC" position="bottom">
          <span>MTC</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('MTC');
      fireEvent.mouseEnter(trigger.parentElement!);
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Tooltip uses fixed positioning via style attribute instead of CSS classes
        expect(tooltip.style.position).toBe('fixed');
      });
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'Sol',
        definition: 'A Mars day',
        category: 'time',
      });

      render(
        <TermTooltip term="sol" className="custom-style">
          <span>Sol</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('Sol');
      expect(trigger.parentElement).toHaveClass('custom-style');
    });
  });

  describe('Real Terminology Integration', () => {
    test('handles case-insensitive term lookup', () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'Coordinated Mars Time',
        definition: 'Universal time standard for Mars',
        category: 'time',
      });

      render(
        <TermTooltip term="Coordinated Mars Time">
          <span>Coordinated Mars Time</span>
        </TermTooltip>
      );

      expect(mockGetTermDefinition).toHaveBeenCalledWith(
        'Coordinated Mars Time'
      );
    });

    test('works with acronyms', async () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'UTC',
        definition:
          'Coordinated Universal Time - the primary time standard on Earth',
        category: 'time',
      });

      render(
        <TermTooltip term="UTC">
          <span>UTC</span>
        </TermTooltip>
      );

      const trigger = screen.getByText('UTC');
      fireEvent.mouseEnter(trigger.parentElement!);
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Coordinated Universal Time - the primary time standard on Earth'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('maintains accessibility when term has definition', async () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'Sol',
        definition: 'A Mars day',
        category: 'time',
      });

      render(
        <TermTooltip term="sol">
          <button>Sol 100</button>
        </TermTooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.focus(button);
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    test('maintains accessibility when term has no definition', () => {
      mockGetTermDefinition.mockReturnValue(null);

      render(
        <TermTooltip term="unknown">
          <button>Unknown</button>
        </TermTooltip>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Unknown');
    });
  });

  describe('Performance', () => {
    test('only calls getTermDefinition once per render', () => {
      mockGetTermDefinition.mockReturnValue({
        term: 'Sol',
        definition: 'A Mars day',
        category: 'time',
      });

      const { rerender } = render(
        <TermTooltip term="sol">
          <span>Sol 100</span>
        </TermTooltip>
      );

      // Rerender with same props
      rerender(
        <TermTooltip term="sol">
          <span>Sol 100</span>
        </TermTooltip>
      );

      // Should call getTermDefinition twice (once per render)
      expect(mockGetTermDefinition).toHaveBeenCalledTimes(2);
    });
  });
});

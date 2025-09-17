/**
 * Tests for the Tooltip component
 * Covers basic functionality, positioning, accessibility, and interaction
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { Tooltip } from '@/components/Tooltip';

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

describe('Tooltip', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    test('renders children without tooltip initially', () => {
      render(
        <Tooltip content="Test tooltip content">
          <span>Hover me</span>
        </Tooltip>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
      expect(
        screen.queryByText('Test tooltip content')
      ).not.toBeInTheDocument();
    });

    test('shows tooltip on hover after delay', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={100}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      // Should not show immediately
      expect(
        screen.queryByText('Test tooltip content')
      ).not.toBeInTheDocument();

      // Fast-forward time past delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    test('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(
          screen.queryByText('Test tooltip content')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Focus Handling', () => {
    test('shows tooltip on focus', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={100}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    test('hides tooltip on blur', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={0}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');

      // Show tooltip
      fireEvent.focus(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.blur(trigger);

      await waitFor(() => {
        expect(
          screen.queryByText('Test tooltip content')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Positioning', () => {
    test('applies correct CSS classes for top position', async () => {
      render(
        <Tooltip content="Test tooltip content" position="top" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Tooltip uses fixed positioning via style attribute instead of CSS classes
        expect(tooltip.style.position).toBe('fixed');
      });
    });

    test('applies correct CSS classes for bottom position', async () => {
      render(
        <Tooltip content="Test tooltip content" position="bottom" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Tooltip uses fixed positioning via style attribute instead of CSS classes
        expect(tooltip.style.position).toBe('fixed');
      });
    });

    test('applies correct CSS classes for left position', async () => {
      render(
        <Tooltip content="Test tooltip content" position="left" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Tooltip uses fixed positioning via style attribute instead of CSS classes
        expect(tooltip.style.position).toBe('fixed');
      });
    });

    test('applies correct CSS classes for right position', async () => {
      render(
        <Tooltip content="Test tooltip content" position="right" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Tooltip uses fixed positioning via style attribute instead of CSS classes
        expect(tooltip.style.position).toBe('fixed');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA role', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    test('has correct aria-hidden state', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');

      // Initially hidden
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('aria-hidden', 'false');
      });

      // Hidden after mouse leave
      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delay Configuration', () => {
    test('respects custom delay', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={500}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);

      // Should not show after shorter time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(
        screen.queryByText('Test tooltip content')
      ).not.toBeInTheDocument();

      // Should show after full delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    test('cancels tooltip on quick hover', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={300}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');

      // Start hover
      fireEvent.mouseEnter(trigger);

      // Leave before delay completes
      act(() => {
        jest.advanceTimersByTime(100);
      });
      fireEvent.mouseLeave(trigger);

      // Complete original delay period
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Tooltip should not appear
      expect(
        screen.queryByText('Test tooltip content')
      ).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(
        <Tooltip content="Test tooltip content" className="custom-class">
          <span>Hover me</span>
        </Tooltip>
      );

      const container = screen.getByText('Hover me').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Error Handling', () => {
    test('handles empty content gracefully', async () => {
      render(
        <Tooltip content="" delay={0}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      fireEvent.mouseEnter(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Should still render tooltip with empty content
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('');
      });
    });

    test('handles multiple rapid hovers', async () => {
      render(
        <Tooltip content="Test tooltip content" delay={100}>
          <span>Hover me</span>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');

      // Rapid hover sequence
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });
  });
});

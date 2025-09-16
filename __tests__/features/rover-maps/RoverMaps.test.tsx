/**
 * Tests for simplified RoverMaps component
 * Tests basic rendering and links to NASA maps
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoverMaps } from '@/features/rover-maps';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<
      Record<string, unknown>
    >): React.ReactElement => <div {...props}>{children}</div>,
    a: ({
      children,
      ...props
    }: React.PropsWithChildren<
      Record<string, unknown>
    >): React.ReactElement => <a {...props}>{children}</a>,
  },
}));

describe('RoverMaps', () => {
  beforeEach(() => {
    // Clear any previous DOM modifications
    document.body.innerHTML = '';
  });

  describe('Component Rendering', () => {
    test('renders with title', () => {
      render(<RoverMaps />);

      expect(screen.getByText('Rover Location Maps')).toBeInTheDocument();
    });

    test('renders both rover links', () => {
      render(<RoverMaps />);

      expect(screen.getByText('Perseverance')).toBeInTheDocument();
      expect(screen.getByText('• Jezero Crater')).toBeInTheDocument();
      expect(screen.getByText('Curiosity')).toBeInTheDocument();
      expect(screen.getByText('• Gale Crater')).toBeInTheDocument();
    });

    test('renders descriptive note', () => {
      render(<RoverMaps />);

      expect(
        screen.getByText(/NASA's interactive maps with real-time positions/i)
      ).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    test('Perseverance link points to correct URL', () => {
      render(<RoverMaps />);

      const perseveranceLink = screen.getByRole('link', {
        name: /perseverance.*jezero crater/i,
      });
      expect(perseveranceLink).toHaveAttribute(
        'href',
        expect.stringContaining('mission=M20')
      );
      expect(perseveranceLink).toHaveAttribute('target', '_blank');
      expect(perseveranceLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('Curiosity link points to correct URL', () => {
      render(<RoverMaps />);

      const curiosityLink = screen.getByRole('link', {
        name: /curiosity.*gale crater/i,
      });
      expect(curiosityLink).toHaveAttribute(
        'href',
        expect.stringContaining('mission=MSL')
      );
      expect(curiosityLink).toHaveAttribute('target', '_blank');
      expect(curiosityLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('links open in new tab with security attributes', () => {
      render(<RoverMaps />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Visual Structure', () => {
    test('has proper heading structure', () => {
      render(<RoverMaps />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Rover Location Maps'
      );
    });

    test('displays external link icons', () => {
      render(<RoverMaps />);

      // Check that ExternalLink icons are present (they'll be SVG elements)
      const container = render(<RoverMaps />).container;
      const svgElements = container.querySelectorAll('svg');

      // Should have at least 3 SVGs: 1 Map icon + 2 ExternalLink icons
      expect(svgElements.length).toBeGreaterThanOrEqual(3);
    });

    test('has compact styling for layout integration', () => {
      const { container } = render(<RoverMaps />);

      // Check the root container has compact padding
      const rootContainer = container.firstChild;
      expect(rootContainer).toHaveClass('p-4'); // Compact padding
    });
  });

  describe('Accessibility', () => {
    test('has accessible link descriptions', () => {
      render(<RoverMaps />);

      const perseveranceLink = screen.getByRole('link', {
        name: /perseverance.*jezero crater/i,
      });
      const curiosityLink = screen.getByRole('link', {
        name: /curiosity.*gale crater/i,
      });

      expect(perseveranceLink).toBeInTheDocument();
      expect(curiosityLink).toBeInTheDocument();
    });

    test('maintains keyboard navigation', () => {
      render(<RoverMaps />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toBeVisible();
        // Links should be focusable
        link.focus();
        expect(document.activeElement).toBe(link);
      });
    });
  });

  describe('Content Validation', () => {
    test('shows rover names and locations', () => {
      render(<RoverMaps />);

      // Check that all expected text content is present
      expect(screen.getByText('Perseverance')).toBeInTheDocument();
      expect(screen.getByText('Curiosity')).toBeInTheDocument();
      expect(screen.getByText('• Jezero Crater')).toBeInTheDocument();
      expect(screen.getByText('• Gale Crater')).toBeInTheDocument();
    });

    test('renders without errors', () => {
      // This test ensures the component doesn't throw during render
      expect(() => render(<RoverMaps />)).not.toThrow();
    });

    test('has appropriate ARIA attributes', () => {
      render(<RoverMaps />);

      const links = screen.getAllByRole('link');

      // Each link should have proper accessibility attributes
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      });
    });
  });
});

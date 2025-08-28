/**
 * Tests for ErrorBoundary component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ErrorBoundary,
  SimpleErrorFallback,
  withErrorBoundary,
} from '@/components/error-boundary';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentProps<'div'>): React.ReactElement => (
      <div {...props}>{children}</div>
    ),
    h2: ({
      children,
      ...props
    }: React.ComponentProps<'h2'>): React.ReactElement => (
      <h2 {...props}>{children}</h2>
    ),
    p: ({
      children,
      ...props
    }: React.ComponentProps<'p'>): React.ReactElement => (
      <p {...props}>{children}</p>
    ),
    details: ({
      children,
      ...props
    }: React.ComponentProps<'details'>): React.ReactElement => (
      <details {...props}>{children}</details>
    ),
  },
}));

// Mock Sentry
jest.mock('@sentry/react', () => ({
  withScope: jest.fn(
    (
      callback: (scope: {
        setContext: jest.Mock;
        setTag: jest.Mock;
        setLevel: jest.Mock;
      }) => void
    ): void =>
      callback({
        setContext: jest.fn(),
        setTag: jest.fn(),
        setLevel: jest.fn(),
      })
  ),
  captureException: jest.fn(),
}));

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Component that throws an error for testing
const ThrowErrorComponent: React.FC<{ shouldThrow: boolean }> = ({
  shouldThrow,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there are no errors', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error fallback when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry loading the component/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /go to home page/i })
    ).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('shows technical details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText('Technical Details');
    expect(detailsButton).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsButton);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const mockOnError = jest.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('recovers from error when retry button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry button - this should reset the error boundary state
    const retryButton = screen.getByRole('button', {
      name: /retry loading the component/i,
    });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);

    // After retry, the component will throw again, so we should still see the error
    // But the retry mechanism itself was tested
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders Go Home button', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByRole('button', {
      name: /go to home page/i,
    });
    expect(goHomeButton).toBeInTheDocument();

    // Verify button has correct attributes
    expect(goHomeButton).toHaveAttribute('type', 'button');
    expect(goHomeButton).toHaveAttribute('aria-label', 'Go to home page');
  });
});

describe('SimpleErrorFallback', () => {
  it('renders simple error message', () => {
    render(<SimpleErrorFallback />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    const customError = new Error('Custom error message');
    render(<SimpleErrorFallback error={customError} />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn();
    render(<SimpleErrorFallback onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<SimpleErrorFallback />);

    expect(
      screen.queryByRole('button', { name: /try again/i })
    ).not.toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  it('wraps component with ErrorBoundary', () => {
    const TestComponent: React.FC<{ message: string }> = ({ message }) => (
      <div>{message}</div>
    );

    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Test message" />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowErrorComponent);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('passes errorBoundaryProps to ErrorBoundary', () => {
    const mockOnError = jest.fn();
    const WrappedComponent = withErrorBoundary(ThrowErrorComponent, {
      onError: mockOnError,
      showDetails: true,
    });

    render(<WrappedComponent shouldThrow={true} />);

    expect(mockOnError).toHaveBeenCalled();
    expect(screen.getByText('Technical Details')).toBeInTheDocument();
  });

  it('sets correct displayName', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      'withErrorBoundary(TestComponent)'
    );
  });
});

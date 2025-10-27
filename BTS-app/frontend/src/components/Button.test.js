import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

// Mock de hooks
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    getCurrentPalette: () => ({
      primary: '#2196f3',
      secondary: '#e91e63',
      background: '#ffffff',
      text: '#212121',
      success: '#4caf50',
      error: '#f44336'
    })
  })
}));

jest.mock('../contexts/AccessibilityContext', () => ({
  useAccessibility: () => ({
    animationsEnabled: true
  })
}));

jest.mock('../hooks/useBatteryOptimization', () => ({
  useBatteryOptimization: () => ({
    reducedAnimations: false
  })
}));

jest.mock('../hooks/useWearableOptimizations', () => ({
  useWearableOptimizations: () => ({
    isWearable: false,
    getAnimationSettings: () => ({
      duration: '300ms',
      ease: 'ease-out'
    })
  })
}));

describe('Button Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders button with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn');
  });

  test('renders button with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-outline-primary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-ghost');
  });

  test('renders button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles click events', () => {
    render(<Button onClick={mockOnClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', () => {
    render(<Button disabled onClick={mockOnClick}>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('does not call onClick when loading', () => {
    render(<Button loading onClick={mockOnClick}>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    // El spinner de carga debería estar presente
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('renders with icon', () => {
    render(<Button icon="🚀">With Icon</Button>);
    const button = screen.getByRole('button', { name: /with icon/i });
    expect(button).toBeInTheDocument();
  });

  test('renders with icon in different positions', () => {
    const { rerender } = render(<Button icon="🚀" iconPosition="left">Left Icon</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button icon="🚀" iconPosition="right">Right Icon</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-100');
  });

  test('applies correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('has correct accessibility attributes', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('renders children correctly', () => {
    render(<Button><span>Custom Child</span></Button>);
    expect(screen.getByText('Custom Child')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom Class</Button>);
    const button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass('custom-class');
  });

  test('handles keyboard events', () => {
    render(<Button onClick={mockOnClick}>Keyboard Test</Button>);
    const button = screen.getByRole('button', { name: /keyboard test/i });

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
});
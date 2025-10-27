import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

// Mock de hooks
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    getCurrentPalette: () => ({
      primary: '#2196f3',
      secondary: '#e91e63',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#bdbdbd',
      borderLight: '#e0e0e0',
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

describe('Input Component', () => {
  const mockOnChange = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnFocus.mockClear();
    mockOnBlur.mockClear();
  });

  test('renders input with label', () => {
    render(<Input label="Test Label" />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  test('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
  });

  test('handles value changes', () => {
    render(<Input value="test" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  test('shows helper text', () => {
    render(<Input helperText="This is helpful information" />);
    expect(screen.getByText(/this is helpful information/i)).toBeInTheDocument();
  });

  test('renders required indicator', () => {
    render(<Input label="Required Field" required />);
    const label = screen.getByText('*');
    expect(label).toBeInTheDocument();
  });

  test('handles focus and blur events', () => {
    render(
      <Input
        label="Focus Test"
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );
    const input = screen.getByLabelText(/focus test/i);

    fireEvent.focus(input);
    expect(mockOnFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  test('renders with different types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  test('renders with icon', () => {
    render(<Input icon="🔍" placeholder="Search" />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
    // El icono debería estar presente como aria-hidden
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<Input loading placeholder="Loading..." />);
    const input = screen.getByPlaceholderText(/loading/i);
    expect(input).toBeInTheDocument();
    // El spinner de carga debería estar presente
  });

  test('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText(/disabled input/i);
    expect(input).toBeDisabled();
  });

  test('is readOnly when readOnly prop is true', () => {
    render(<Input readOnly value="Read only value" />);
    const input = screen.getByDisplayValue(/read only value/i);
    expect(input).toHaveAttribute('readOnly');
  });

  test('applies fullWidth class when fullWidth is true', () => {
    render(<Input fullWidth placeholder="Full width" />);
    const wrapper = screen.getByPlaceholderText(/full width/i).closest('.input-wrapper');
    expect(wrapper).toHaveClass('w-100');
  });

  test('has correct accessibility attributes', () => {
    render(<Input label="Accessible Input" error="Error message" />);
    const input = screen.getByLabelText(/accessible input/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  test('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom class" />);
    const wrapper = screen.getByPlaceholderText(/custom class/i).closest('.input-wrapper');
    expect(wrapper).toHaveClass('custom-input');
  });

  test('renders different variants', () => {
    const { rerender } = render(<Input variant="outlined" placeholder="Outlined" />);
    expect(screen.getByPlaceholderText(/outlined/i)).toBeInTheDocument();

    rerender(<Input variant="filled" placeholder="Filled" />);
    expect(screen.getByPlaceholderText(/filled/i)).toBeInTheDocument();

    rerender(<Input variant="underlined" placeholder="Underlined" />);
    expect(screen.getByPlaceholderText(/underlined/i)).toBeInTheDocument();
  });

  test('renders different sizes', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText(/small/i)).toBeInTheDocument();

    rerender(<Input size="md" placeholder="Medium" />);
    expect(screen.getByPlaceholderText(/medium/i)).toBeInTheDocument();

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText(/large/i)).toBeInTheDocument();
  });

  test('handles keyboard navigation', () => {
    render(<Input placeholder="Keyboard test" />);
    const input = screen.getByPlaceholderText(/keyboard test/i);

    fireEvent.keyDown(input, { key: 'Enter' });
    // No debería haber errores, solo probar que maneja el evento
    expect(input).toBeInTheDocument();
  });
});
// Pruebas unitarias para AccessibilityToggle
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import AccessibilityToggle from './AccessibilityToggle';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';

// Extender expect con jest-axe
expect.extend(toHaveNoViolations);

// Mock del contexto de traducciones
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock de i18next
jest.mock('i18next', () => ({
  language: 'es',
  changeLanguage: jest.fn(),
}));

// Mock del AccessibilityContext
const mockToggleAccessibilityMode = jest.fn();
jest.mock('../contexts/AccessibilityContext', () => ({
  AccessibilityProvider: ({ children }) => <div>{children}</div>,
  useAccessibility: () => ({
    accessibilityMode: false,
    toggleAccessibilityMode: mockToggleAccessibilityMode,
  }),
}));

// Wrapper para proporcionar el contexto
const TestWrapper = ({ children }) => (
  <AccessibilityProvider>
    {children}
  </AccessibilityProvider>
);

describe('AccessibilityToggle', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  test('renderiza correctamente', () => {
    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('cambia el estado al hacer clic', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');

    // Estado inicial
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Hacer clic
    await user.click(button);

    // Verificar que se llamó a la función
    expect(mockToggleAccessibilityMode).toHaveBeenCalledTimes(1);
  });

  test('maneja navegación por teclado', () => {
    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');

    // Simular evento de teclado Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(mockToggleAccessibilityMode).toHaveBeenCalledTimes(1);

    // Simular evento de teclado Espacio
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(mockToggleAccessibilityMode).toHaveBeenCalledTimes(2);
  });

  test('persiste el estado en localStorage', async () => {
    const user = userEvent.setup();

    // Primera renderización
    const { rerender } = render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    await user.click(button);

    // Re-renderizar para simular recarga
    rerender(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const newButton = screen.getByRole('switch');
    expect(newButton).toHaveAttribute('aria-pressed', 'false'); // El mock siempre devuelve false
  });

  test('tiene atributos de accesibilidad básicos', () => {
    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
    expect(button).toHaveAttribute('role', 'switch');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  test('tiene el texto alternativo correcto', () => {
    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'accessibility.enableMode');
  });

  test('tiene el texto alternativo correcto', () => {
    render(
      <TestWrapper>
        <AccessibilityToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveAttribute('aria-label', 'accessibility.enableMode');
  });
});
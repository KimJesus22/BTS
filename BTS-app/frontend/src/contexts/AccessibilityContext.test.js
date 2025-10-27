// Pruebas unitarias para AccessibilityContext
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityProvider, useAccessibility } from './AccessibilityContext';

// Extender expect con jest-axe
expect.extend(toHaveNoViolations);

// Mock de i18next
jest.mock('i18next', () => ({
  language: 'es',
  changeLanguage: jest.fn(),
}));

// Mock del contexto de traducciones
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'es',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Componente de prueba para usar el hook
const TestComponent = () => {
  const {
    accessibilityMode,
    toggleAccessibilityMode,
    fontSize,
    changeFontSize
  } = useAccessibility();

  return (
    <div>
      <div data-testid="accessibility-mode">{accessibilityMode ? 'true' : 'false'}</div>
      <div data-testid="font-size">{fontSize}</div>
      <button onClick={toggleAccessibilityMode} data-testid="toggle-btn">
        Toggle
      </button>
      <button onClick={() => changeFontSize(20)} data-testid="change-font-btn">
        Change Font
      </button>
    </div>
  );
};

describe('AccessibilityContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('proporciona valores por defecto', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('accessibility-mode')).toHaveTextContent('false');
    expect(screen.getByTestId('font-size')).toHaveTextContent('16');
  });

  test('toggleAccessibilityMode cambia el estado', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleBtn = screen.getByTestId('toggle-btn');

    act(() => {
      toggleBtn.click();
    });

    expect(screen.getByTestId('accessibility-mode')).toHaveTextContent('true');
  });

  test('changeFontSize actualiza el tamaño de fuente', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const changeFontBtn = screen.getByTestId('change-font-btn');

    act(() => {
      changeFontBtn.click();
    });

    expect(screen.getByTestId('font-size')).toHaveTextContent('20');
  });

  test('persiste el estado en localStorage', () => {
    // Primera renderización
    const { rerender } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleBtn = screen.getByTestId('toggle-btn');

    act(() => {
      toggleBtn.click();
    });

    // Re-renderizar para simular recarga
    rerender(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('accessibility-mode')).toHaveTextContent('true');
  });

  test('aplica cambios CSS globales cuando accessibilityMode está activo', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Verificar que no hay atributos inicialmente
    expect(document.documentElement).not.toHaveAttribute('data-accessibility-mode');

    const toggleBtn = screen.getByTestId('toggle-btn');

    act(() => {
      toggleBtn.click();
    });

    // Verificar que se aplican los atributos
    expect(document.documentElement).toHaveAttribute('data-accessibility-mode', 'true');
    expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  });

  test('lanza error cuando useAccessibility se usa fuera del provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility debe ser usado dentro de un AccessibilityProvider');

    consoleSpy.mockRestore();
  });

  test('cumple con estándares de accesibilidad WCAG', async () => {
    const { container } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
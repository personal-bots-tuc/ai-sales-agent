import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<WrapperProps> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';

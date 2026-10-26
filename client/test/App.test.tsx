import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import App from '../src/App';
import '../src/i18n/config';

describe('App Component and Brand Mount', () => {
  it('renders ShopNest Ethiopia header and brand identity', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Verify brand name appears in header and hero
    const brandElements = screen.getAllByText(/ShopNest Ethiopia/i);
    expect(brandElements.length).toBeGreaterThan(0);

    // Verify tagline appears in header and hero
    const taglineElements = screen.getAllByText(/Your Marketplace, Your Way/i);
    expect(taglineElements.length).toBeGreaterThan(0);
  });

  it('renders architecture pillars and RTK store status', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/Frontend Stack/i)).toBeInTheDocument();
    expect(screen.getByText(/Redux RTK Store/i)).toBeInTheDocument();
  });
});

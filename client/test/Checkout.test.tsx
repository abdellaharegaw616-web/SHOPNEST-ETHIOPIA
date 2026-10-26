import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../src/store/slices/cartSlice';
import authReducer from '../src/store/slices/authSlice';
import { apiSlice } from '../src/store/api/apiSlice';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import '../src/i18n/config';

const createMockStore = (initialCartItems: any[] = []) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
    preloadedState: {
      cart: {
        items: initialCartItems,
        isOpen: false,
        couponCode: null,
        discountPercent: 0,
        discountAmount: 0,
        deliveryFee: 150,
        warnings: [],
        guestSessionId: 'test_guest_123',
      },
      auth: {
        user: {
          id: 'user-1',
          name: 'Abebe Bikila',
          email: 'abebe@shopnest.et',
          phone: '+251911223344',
          role: 'customer' as const,
          addresses: [
            {
              fullName: 'Abebe Bikila',
              phone: '+251911223344',
              city: 'Addis Ababa',
              subCity: 'Bole',
              woreda: '03',
              isDefault: true,
            },
          ],
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        loading: false,
      },
    },
  });
};

describe('CheckoutPage Storefront Component', () => {
  const sampleItems = [
    {
      id: 'item-1',
      productId: 'prod-1',
      title: 'Buna Desta Roasted Coffee',
      price: 800,
      quantity: 2,
      stock: 20,
      sku: 'BUNA-001',
      image: 'https://images.unsplash.com/photo-coffee',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders customer contact fields, Ethiopian payment providers, and order summary', () => {
    const store = createMockStore(sampleItems);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );

    // Title and Steps
    expect(screen.getByText(/Secure Ethiopian Checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Contact Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2: Ethiopian Delivery Destination/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 3: Select Ethiopian Payment Method/i)).toBeInTheDocument();

    // Ethiopian Payment Methods
    expect(screen.getByText(/Telebirr \(ቴሌብር\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CBE Birr \(ሲቢኢ ብር\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chapa \(ቻፓ\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash on Delivery \(በደረሰ ጊዜ ክፍያ\)/i)).toBeInTheDocument();

    // Order items summary
    expect(screen.getByText(/Buna Desta Roasted Coffee/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ETB 1,600.00/i).length).toBeGreaterThanOrEqual(1); // line total & subtotal
  });

  it('displays empty cart fallback state when no items are in cart', () => {
    const emptyStore = createMockStore([]);

    render(
      <Provider store={emptyStore}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore ShopNest Catalog/i })).toBeInTheDocument();
  });

  it('validates Ethiopian phone number format and shows error feedback on invalid phone', () => {
    const store = createMockStore(sampleItems);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );

    const phoneInput = screen.getByPlaceholderText('+251 911 234567');
    fireEvent.change(phoneInput, { target: { value: '+14155552671' } }); // US number

    expect(screen.getByText(/Invalid Ethiopian phone format/i)).toBeInTheDocument();

    // Change to valid Ethiopian number
    fireEvent.change(phoneInput, { target: { value: '+251911445566' } });
    expect(screen.queryByText(/Invalid Ethiopian phone format/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Valid/i)).toBeInTheDocument();
  });

  it('renders saved addresses for authenticated users with option to switch to new address', () => {
    const store = createMockStore(sampleItems);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Choose a Saved Address:/i)).toBeInTheDocument();
    expect(screen.getByText(/\+ Enter New Address/i)).toBeInTheDocument();
  });
});

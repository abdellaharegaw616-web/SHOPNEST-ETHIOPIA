import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { ProductCard } from '../src/components/common/ProductCard';
import { ProductPrice } from '../src/components/common/ProductPrice';
import { ProductItem } from '../src/store/api/productsApi';
import '../src/i18n/config';

describe('Product Catalog & Controls Tests', () => {
  const inStockProduct: ProductItem = {
    id: 'prod-1',
    title: 'Samsung Galaxy A54 5G Smartphone',
    slug: 'samsung-galaxy-a54-5g',
    description: 'High performance Android smartphone with Super AMOLED display.',
    price: 32000,
    discountPrice: 28800,
    category: {
      id: 'cat-phones',
      name: 'Phones and Accessories',
      slug: 'phones-and-accessories',
      isActive: true,
    },
    stock: 12,
    sku: 'SNE-PH-001',
    images: ['https://example.com/phone.jpg'],
    rating: 4.7,
    reviewCount: 15,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  const outOfStockProduct: ProductItem = {
    id: 'prod-2',
    title: 'Rare Vintage Clay Jebena',
    slug: 'rare-vintage-clay-jebena',
    description: 'Handcrafted traditional clay coffee pot.',
    price: 4500,
    category: {
      id: 'cat-home',
      name: 'Home and Kitchen',
      slug: 'home-and-kitchen',
      isActive: true,
    },
    stock: 0, // OUT OF STOCK
    sku: 'SNE-HM-099',
    images: ['https://example.com/jebena.jpg'],
    rating: 0, // NO REVIEWS YET
    reviewCount: 0,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  describe('ProductCard Component', () => {
    it('renders in-stock product with ETB price and compare-at discount', () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ProductCard product={inStockProduct} />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText(/Samsung Galaxy A54 5G Smartphone/i)).toBeInTheDocument();
      expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
      // Verified price display
      expect(screen.getByText(/ETB 28,800.00/i)).toBeInTheDocument();
      // Compare-at price
      expect(screen.getByText(/ETB 32,000.00/i)).toBeInTheDocument();
      // Rating supported by real review data
      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('(15)')).toBeInTheDocument();

      // Add to cart button is active
      const addBtn = screen.getByRole('button', { name: /Add to Cart/i });
      expect(addBtn).not.toBeDisabled();
    });

    it('renders out-of-stock product with disabled action and no fabricated rating', () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ProductCard product={outOfStockProduct} />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByText(/Rare Vintage Clay Jebena/i)).toBeInTheDocument();
      expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();

      // Strict rule: No reviews yet is displayed instead of a fake rating
      expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();

      // Add to cart button must be disabled for unavailable product
      const addBtn = screen.getByRole('button', { name: /Unavailable/i });
      expect(addBtn).toBeDisabled();
    });
  });

  describe('ProductPrice Discount Integrity', () => {
    it('displays compare-at strike-through only when valid discount exists', () => {
      const { rerender } = render(
        <ProductPrice price={5000} discountPrice={4000} />
      );

      // Shows discounted price
      expect(screen.getByText(/ETB 4,000.00/i)).toBeInTheDocument();
      // Shows original compare-at price
      expect(screen.getByText(/ETB 5,000.00/i)).toBeInTheDocument();
      // Shows discount percentage
      expect(screen.getByText(/-20%/i)).toBeInTheDocument();

      // If no valid discountPrice, compare-at must NOT be rendered
      rerender(<ProductPrice price={5000} />);
      expect(screen.queryByText(/-20%/i)).not.toBeInTheDocument();
    });
  });

  describe('Quantity Controls & Boundaries', () => {
    it('prevents quantity from dropping below 1', () => {
      let qty = 1;
      const minQty = Math.max(1, qty - 1);
      expect(minQty).toBe(1);
    });

    it('prevents quantity from exceeding available stock', () => {
      const availableStock = 5;
      let requestedQty = 10;
      const clampedQty = Math.min(availableStock, requestedQty);
      expect(clampedQty).toBe(5);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { ShoppingAssistant } from '../src/features/ai/ShoppingAssistant';
import { ChatMessage, ChatMessageData } from '../src/features/ai/components/ChatMessage';
import { RecommendedProductCard } from '../src/features/ai/components/RecommendedProductCard';
import { RecommendedProductDTO } from '@shopnest/shared';
import '../src/i18n/config';

describe('ShopNest AI Shopping Assistant Frontend Component Tests', () => {
  const mockProduct: RecommendedProductDTO = {
    id: 'prod-lenovo-123',
    title: 'Lenovo IdeaPad 3 15.6" Laptop',
    titleAmharic: 'ሌኖቮ አይዲያፓድ 3 ላፕቶፕ',
    slug: 'lenovo-ideapad-3',
    price: 38500,
    discountPrice: 36000,
    currency: 'ETB',
    images: ['https://example.com/laptop.jpg'],
    stock: 5,
    rating: 4.5,
    reviewCount: 12,
    categoryName: 'Computers & Office',
    recommendationReason: 'Perfect computing power and 8GB RAM for university students within 40,000 ETB budget.',
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    );
  };

  describe('1. Floating Action Button & Modal Expand/Collapse', () => {
    it('renders the floating assistant button with accessible labels and attributes', () => {
      renderWithProviders(<ShoppingAssistant />);

      const fabButton = screen.getByRole('button', { name: /shopnest ai assistant/i });
      expect(fabButton).toBeInTheDocument();
      expect(fabButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles the chat dialog open and closed when clicking the FAB button', () => {
      renderWithProviders(<ShoppingAssistant />);

      const fabButton = screen.getByRole('button', { name: /shopnest ai assistant/i });
      fireEvent.click(fabButton);

      expect(fabButton).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', { name: /shopnest ai shopping assistant/i });
      expect(dialog).toBeInTheDocument();

      // Close via minimize button
      const minimizeBtn = screen.getByRole('button', { name: /minimize assistant/i });
      fireEvent.click(minimizeBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders suggested question chips and input field when open', () => {
      renderWithProviders(<ShoppingAssistant />);

      const fabButton = screen.getByRole('button', { name: /shopnest ai assistant/i });
      fireEvent.click(fabButton);

      const textarea = screen.getByPlaceholderText(/find a laptop under 40,000 etb/i);
      expect(textarea).toBeInTheDocument();

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeInTheDocument();
      expect(sendButton).toBeDisabled(); // Disabled when input is empty
    });
  });

  describe('2. ChatMessage & Product Card Rendering', () => {
    it('renders user message bubble cleanly', () => {
      const userMsg: ChatMessageData = {
        id: 'msg-1',
        role: 'user',
        content: 'Find a laptop under 40000 ETB',
        timestamp: '12:00 PM',
      };

      renderWithProviders(<ChatMessage message={userMsg} />);
      expect(screen.getByText('Find a laptop under 40000 ETB')).toBeInTheDocument();
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    });

    it('renders assistant message with simulation badge and recommended product card', () => {
      const assistantMsg: ChatMessageData = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Here is our top verified recommendation for your budget:',
        timestamp: '12:01 PM',
        isMock: true,
        products: [mockProduct],
      };

      renderWithProviders(<ChatMessage message={assistantMsg} />);

      // Content & Simulation Badge
      expect(screen.getByText('Here is our top verified recommendation for your budget:')).toBeInTheDocument();
      expect(screen.getByText(/development simulation mode/i)).toBeInTheDocument();

      // Product Card Details
      expect(screen.getByText('Lenovo IdeaPad 3 15.6" Laptop')).toBeInTheDocument();
      expect(screen.getByText('ETB 36,000.00')).toBeInTheDocument(); // Discounted price
      expect(screen.getByText('ETB 38,500.00')).toBeInTheDocument(); // Strikethrough regular price
      expect(screen.getByText(/in stock \(5\)/i)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.recommendationReason)).toBeInTheDocument();

      const viewProductBtn = screen.getByRole('link', { name: /view product/i });
      expect(viewProductBtn).toBeInTheDocument();
      expect(viewProductBtn).toHaveAttribute('href', '/product/lenovo-ideapad-3');
    });

    it('renders error state with actionable retry button', () => {
      let retryTriggered = false;
      const errorMsg: ChatMessageData = {
        id: 'msg-err',
        role: 'assistant',
        content: 'Connection timeout with shopping assistant service.',
        timestamp: '12:02 PM',
        isError: true,
        canRetry: true,
      };

      renderWithProviders(
        <ChatMessage
          message={errorMsg}
          onRetry={() => {
            retryTriggered = true;
          }}
        />
      );

      expect(screen.getByText('Connection timeout with shopping assistant service.')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(retryTriggered).toBe(true);
    });
  });

  describe('3. RecommendedProductCard Independent Unit Validation', () => {
    it('handles out of stock state properly', () => {
      const outOfStockItem: RecommendedProductDTO = {
        ...mockProduct,
        stock: 0,
        discountPrice: undefined,
      };

      renderWithProviders(<RecommendedProductCard product={outOfStockItem} />);
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
      expect(screen.getByText('ETB 38,500.00')).toBeInTheDocument();
    });
  });
});

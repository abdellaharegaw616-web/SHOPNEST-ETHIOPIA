import { Cart, ICart, Product, Coupon } from '../models';
import { AppError } from '../middleware/errorHandler';
import { CartDTO, CartItemDTO, CartWarning, ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export interface CartCalculationResult {
  cart: ICart;
  dto: CartDTO;
  warnings: CartWarning[];
}

export class CartService {
  /**
   * Revalidates stock and price changes, calculates subtotal, delivery fee, and discount.
   */
  static async validateAndFormatCart(cart: ICart, couponCode?: string, city = 'Addis Ababa'): Promise<CartCalculationResult> {
    const warnings: CartWarning[] = [];
    let hasChanges = false;

    // Populate product details
    await cart.populate('items.product', 'title titleAmharic slug price discountPrice images stock sku isPublished');

    // Filter out items where product was permanently deleted
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      if (!product || !product.isPublished) {
        warnings.push({
          productId: product?._id?.toString() || (item as any)._id?.toString(),
          type: 'out_of_stock',
          message: `An item in your cart is no longer available and was removed.`,
        });
        hasChanges = true;
        continue;
      }

      const currentUnitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

      // Check price changes
      if (item.unitPrice !== currentUnitPrice) {
        warnings.push({
          productId: product._id.toString(),
          type: 'price_changed',
          message: `Price for "${product.title}" changed from ETB ${item.unitPrice} to ETB ${currentUnitPrice}.`,
          oldPrice: item.unitPrice,
          newPrice: currentUnitPrice,
        });
        item.unitPrice = currentUnitPrice;
        hasChanges = true;
      }

      // Check stock availability
      if (product.stock <= 0) {
        warnings.push({
          productId: product._id.toString(),
          type: 'out_of_stock',
          message: `"${product.title}" is now out of stock.`,
          availableStock: 0,
        });
        // We keep or adjust quantity to 0/flagged
        item.quantity = 0;
        hasChanges = true;
      } else if (item.quantity > product.stock) {
        warnings.push({
          productId: product._id.toString(),
          type: 'stock_reduced',
          message: `Quantity for "${product.title}" adjusted from ${item.quantity} to ${product.stock} due to available stock.`,
          availableStock: product.stock,
        });
        item.quantity = product.stock;
        hasChanges = true;
      }

      // Only keep items with quantity >= 1
      if (item.quantity > 0) {
        validItems.push(item);
      }
    }

    if (hasChanges || validItems.length !== cart.items.length) {
      cart.items = validItems as any;
      await cart.save();
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Delivery fee rule: Free over threshold, else standard city/regional fee
    const isAddis = !city || city.toLowerCase().includes('addis');
    const standardFee = isAddis
      ? ETHIOPIA_CONSTANTS.delivery.addisAbabaStandardFee
      : ETHIOPIA_CONSTANTS.delivery.regionalStandardFee;

    const deliveryFee = subtotal >= ETHIOPIA_CONSTANTS.delivery.freeDeliveryThreshold || subtotal === 0 ? 0 : standardFee;

    let discountAmount = 0;
    let appliedCoupon: string | undefined = undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon && coupon.isValid() && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    const dtoItems: CartItemDTO[] = cart.items.map((item) => {
      const product = item.product as any;
      return {
        id: (item as any)._id?.toString(),
        _id: (item as any)._id?.toString(),
        product: {
          id: product._id?.toString(),
          _id: product._id?.toString(),
          title: product.title,
          titleAmharic: product.titleAmharic,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images || [],
          stock: product.stock,
          sku: product.sku,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedAttributes: item.selectedAttributes ? Object.fromEntries(item.selectedAttributes) : undefined,
        lineTotal: item.quantity * item.unitPrice,
      };
    });

    const dto: CartDTO = {
      id: cart._id.toString(),
      _id: cart._id.toString(),
      items: dtoItems,
      subtotal,
      deliveryFee,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount,
      warnings,
    };

    return { cart, dto, warnings };
  }

  static async getCart(userId?: string, guestSessionId?: string, couponCode?: string, city?: string): Promise<CartDTO> {
    if (!userId && !guestSessionId) {
      throw new AppError('Either user ID or guest session ID is required', 400);
    }

    const query = userId ? { user: userId } : { guestSessionId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = await Cart.create({ ...query, items: [], totalAmount: 0 });
    }

    const { dto } = await this.validateAndFormatCart(cart, couponCode, city);
    return dto;
  }

  static async addToCart(
    userId?: string,
    guestSessionId?: string,
    productId?: string,
    quantity = 1,
    selectedAttributes?: Record<string, string>
  ): Promise<CartDTO> {
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isPublished) {
      throw new AppError('Product not found or currently unavailable', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} units available in stock`, 400);
    }

    const unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

    const query = userId ? { user: userId } : { guestSessionId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        throw new AppError(`Cannot add more than ${product.stock} units to cart`, 400);
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].unitPrice = unitPrice;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        unitPrice,
        selectedAttributes: selectedAttributes ? new Map(Object.entries(selectedAttributes)) : undefined,
      });
    }

    await cart.save();
    const { dto } = await this.validateAndFormatCart(cart);
    return dto;
  }

  static async updateCartItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string,
    guestSessionId?: string
  ): Promise<CartDTO> {
    const query = userId ? { user: userId } : { guestSessionId };
    const cart = await Cart.findOne(query).populate('items.product');
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => (item as any)._id?.toString() === itemId || item.product?.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product || !product.isPublished) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      throw new AppError('Product is no longer available', 400);
    }

    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} units available in stock`, 400);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
    }

    await cart.save();
    const { dto } = await this.validateAndFormatCart(cart);
    return dto;
  }

  static async removeFromCart(
    itemId: string,
    userId?: string,
    guestSessionId?: string
  ): Promise<CartDTO> {
    const query = userId ? { user: userId } : { guestSessionId };
    const cart = await Cart.findOne(query);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      (item) => (item as any)._id?.toString() !== itemId && item.product.toString() !== itemId
    );
    await cart.save();
    const { dto } = await this.validateAndFormatCart(cart);
    return dto;
  }

  static async mergeCart(
    userId: string,
    guestSessionId?: string,
    guestItems?: { productId: string; quantity: number; selectedAttributes?: Record<string, string> }[]
  ): Promise<CartDTO> {
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    // Items from guest session in DB if exists
    let guestSessionCart: ICart | null = null;
    if (guestSessionId) {
      guestSessionCart = await Cart.findOne({ guestSessionId });
    }

    const itemsToMerge: { productId: string; quantity: number; selectedAttributes?: Record<string, string> }[] = [];

    if (guestSessionCart && guestSessionCart.items.length > 0) {
      for (const item of guestSessionCart.items) {
        itemsToMerge.push({
          productId: item.product.toString(),
          quantity: item.quantity,
          selectedAttributes: item.selectedAttributes ? Object.fromEntries(item.selectedAttributes) : undefined,
        });
      }
    }

    if (guestItems && guestItems.length > 0) {
      for (const gItem of guestItems) {
        const existing = itemsToMerge.find((m) => m.productId === gItem.productId);
        if (existing) {
          existing.quantity = Math.max(existing.quantity, gItem.quantity);
        } else {
          itemsToMerge.push(gItem);
        }
      }
    }

    // Merge into userCart
    for (const mergeItem of itemsToMerge) {
      const product = await Product.findById(mergeItem.productId);
      if (!product || !product.isPublished || product.stock <= 0) continue;

      const unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const existingUserItemIndex = userCart.items.findIndex(
        (item) => item.product.toString() === mergeItem.productId
      );

      if (existingUserItemIndex > -1) {
        const combinedQty = userCart.items[existingUserItemIndex].quantity + mergeItem.quantity;
        userCart.items[existingUserItemIndex].quantity = Math.min(combinedQty, product.stock);
        userCart.items[existingUserItemIndex].unitPrice = unitPrice;
      } else {
        userCart.items.push({
          product: product._id,
          quantity: Math.min(mergeItem.quantity, product.stock),
          unitPrice,
          selectedAttributes: mergeItem.selectedAttributes ? new Map(Object.entries(mergeItem.selectedAttributes)) : undefined,
        });
      }
    }

    await userCart.save();

    // Clean up guest cart in DB
    if (guestSessionId) {
      await Cart.findOneAndDelete({ guestSessionId });
    }

    const { dto } = await this.validateAndFormatCart(userCart);
    return dto;
  }

  static async clearCart(userId?: string, guestSessionId?: string): Promise<void> {
    const query = userId ? { user: userId } : { guestSessionId };
    await Cart.findOneAndDelete(query);
  }
}

import mongoose from 'mongoose';
import { Product, IProduct, Category, ICategory, InventoryMovement } from '../models';
import { AppError } from '../middleware/errorHandler';

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'all' | 'in_stock' | 'out_of_stock';
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
}

export class CatalogService {
  // --- Category Operations ---
  static async getCategories(): Promise<ICategory[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    return Category.find({ isActive: true }).sort({ name: 1 });
  }

  static async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ ...data, slug });
    return category;
  }

  // --- Product Operations ---
  static async getProducts(options: ProductQueryOptions = {}): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Validate and sanitize pagination bounds
    const rawPage = Number(options.page);
    const page = !isNaN(rawPage) && rawPage > 0 ? Math.min(1000, Math.floor(rawPage)) : 1;

    const rawLimit = Number(options.limit);
    // Cap maximum limit to 50 to prevent excessive resource requests
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(50, Math.floor(rawLimit)) : 12;

    if (mongoose.connection.readyState !== 1) {
      return {
        products: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { isPublished: true };

    // 1. Category Filter (by ObjectId or Slug)
    if (options.category) {
      const categoryDoc = await Category.findOne({
        $or: [
          ...(mongoose.isValidObjectId(options.category) ? [{ _id: options.category }] : []),
          { slug: options.category },
        ],
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    // 2. Search by product name, amharic title, or description
    if (options.search && options.search.trim()) {
      const trimmed = options.search.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { titleAmharic: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { descriptionAmharic: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } },
      ];
    }

    // 3. Price Range Filter (ETB)
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (options.minPrice !== undefined && !isNaN(Number(options.minPrice))) {
        priceFilter.$gte = Math.max(0, Number(options.minPrice));
      }
      if (options.maxPrice !== undefined && !isNaN(Number(options.maxPrice))) {
        priceFilter.$lte = Math.max(0, Number(options.maxPrice));
      }
      if (Object.keys(priceFilter).length > 0) {
        filter.price = priceFilter;
      }
    }

    // 4. Availability Filter
    if (options.availability === 'in_stock' || options.inStock === true) {
      filter.stock = { $gt: 0 };
    } else if (options.availability === 'out_of_stock' || options.inStock === false) {
      filter.stock = { $lte: 0 };
    }

    // 5. Validated Sort Ordering
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (options.sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'popularity':
        sortOption = { reviewCount: -1, rating: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name nameAmharic slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getProductBySlug(slugOrId: string): Promise<IProduct> {
    const isId = mongoose.isValidObjectId(slugOrId);
    const filter: Record<string, unknown> = {
      isPublished: true,
      ...(isId ? { $or: [{ _id: slugOrId }, { slug: slugOrId }] } : { slug: slugOrId }),
    };

    const product = await Product.findOne(filter).populate('category', 'name nameAmharic slug');
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  static async getRelatedProducts(slugOrId: string, limit: number = 4): Promise<IProduct[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    const isId = mongoose.isValidObjectId(slugOrId);
    const filter = isId ? { $or: [{ _id: slugOrId }, { slug: slugOrId }] } : { slug: slugOrId };
    const currentProduct = await Product.findOne(filter);

    if (!currentProduct) {
      return [];
    }

    const safeLimit = Math.max(1, Math.min(12, limit));

    return Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
      isPublished: true,
    })
      .populate('category', 'name nameAmharic slug')
      .sort({ rating: -1, createdAt: -1 })
      .limit(safeLimit);
  }

  static async createProduct(data: Partial<IProduct>, userId?: string): Promise<IProduct> {
    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({ ...data, slug });

    // Record initial inventory movement
    if (product.stock > 0) {
      await InventoryMovement.create({
        product: product._id,
        type: 'stock_in',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial stock on product creation',
        createdBy: userId,
      });
    }

    return product;
  }

  static async updateProduct(id: string, data: Partial<IProduct>, userId?: string): Promise<IProduct> {
    const existing = await Product.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    // Track stock change if modified
    if (data.stock !== undefined && data.stock !== existing.stock) {
      await InventoryMovement.create({
        product: existing._id,
        type: data.stock > existing.stock ? 'stock_in' : 'stock_out',
        quantity: Math.abs(data.stock - existing.stock),
        previousStock: existing.stock,
        newStock: data.stock,
        reason: 'Manual stock adjustment by admin',
        createdBy: userId,
      });
    }

    const updated = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) {
      throw new AppError('Product not found', 404);
    }
    return updated;
  }

  static async deleteProduct(id: string): Promise<void> {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError('Product not found', 404);
    }
  }
}

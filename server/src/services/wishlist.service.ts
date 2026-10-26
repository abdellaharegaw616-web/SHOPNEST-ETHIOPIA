import { Wishlist, IWishlist, Product } from '../models';
import { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';

export class WishlistService {
  static async getWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await Wishlist.findOne({ user: userId }).populate(
      'products',
      'title titleAmharic slug price discountPrice images stock'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    return wishlist;
  }

  static async toggleProduct(userId: string, rawProductId: string): Promise<{ wishlist: IWishlist; action: 'added' | 'removed' }> {
    let targetId = rawProductId;

    // Check if valid ObjectId, else check if it matches a slug
    if (!Types.ObjectId.isValid(rawProductId)) {
      const productBySlug = await Product.findOne({ slug: rawProductId }).select('_id');
      if (productBySlug) {
        targetId = productBySlug._id.toString();
      } else {
        throw new AppError('Product not found or invalid product ID', 404);
      }
    } else {
      const exists = await Product.findById(rawProductId).select('_id');
      if (!exists) {
        throw new AppError('Product not found', 404);
      }
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const prodObjectId = new Types.ObjectId(targetId);
    const index = wishlist.products.findIndex((p) => p.toString() === targetId);

    let action: 'added' | 'removed' = 'added';
    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(prodObjectId);
      action = 'added';
    }

    await wishlist.save();
    const populated = await wishlist.populate('products', 'title titleAmharic slug price discountPrice images stock');
    return { wishlist: populated, action };
  }

  static async clearWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    } else {
      wishlist.products = [];
      await wishlist.save();
    }
    return wishlist;
  }
}

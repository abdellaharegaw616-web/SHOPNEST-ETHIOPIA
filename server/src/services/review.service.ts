import mongoose from 'mongoose';
import { Review, IReview, Product, Order } from '../models';
import { AppError } from '../middleware/errorHandler';

export class ReviewService {
  static async getProductReviews(productIdOrSlug: string): Promise<IReview[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    let targetId = productIdOrSlug;
    if (!mongoose.isValidObjectId(productIdOrSlug)) {
      const product = await Product.findOne({ slug: productIdOrSlug }).select('_id');
      if (product) {
        targetId = product._id.toString();
      } else {
        return [];
      }
    }
    return Review.find({ product: targetId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
  }

  static async getAllReviews(): Promise<IReview[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    return Review.find()
      .populate('user', 'name email')
      .populate('product', 'title slug sku')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  static async createReview(
    userId: string,
    productIdOrSlug: string,
    rating: number,
    comment: string
  ): Promise<IReview> {
    let targetId = productIdOrSlug;
    if (!mongoose.isValidObjectId(productIdOrSlug)) {
      const product = await Product.findOne({ slug: productIdOrSlug }).select('_id');
      if (product) {
        targetId = product._id.toString();
      } else {
        throw new AppError('Product not found', 404);
      }
    }

    const existing = await Review.findOne({ product: targetId, user: userId });
    if (existing) {
      throw new AppError('You have already submitted a review for this product', 400);
    }

    // Real Verified Purchase validation: Check if user has an order containing this product
    const verifiedOrder = await Order.findOne({
      user: userId,
      'items.product': targetId,
      $or: [
        { paymentStatus: 'completed' },
        { orderStatus: { $in: ['processing', 'shipped', 'delivered'] } },
      ],
    });

    const isVerifiedPurchase = !!verifiedOrder;

    const review = await Review.create({
      product: targetId,
      user: userId,
      rating,
      comment,
      isVerifiedPurchase,
    });

    // Recalculate product rating & reviewCount based strictly on actual reviews
    const allReviews = await Review.find({ product: targetId });
    const reviewCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (reviewCount || 1);

    await Product.findByIdAndUpdate(targetId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
    });

    return review;
  }

  static async deleteReview(reviewId: string, userId: string, role?: string): Promise<void> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.user.toString() !== userId && role !== 'admin') {
      throw new AppError('Not authorized to delete this review', 403);
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate rating & reviewCount
    const allReviews = await Review.find({ product: productId });
    const reviewCount = allReviews.length;
    const avgRating =
      reviewCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
    });
  }
}

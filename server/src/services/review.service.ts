import mongoose from 'mongoose';
import { Review, IReview, Product, Order } from '../models';
import { AppError } from '../middleware/errorHandler';

export class ReviewService {
  /**
   * Recalculates product rating & reviewCount strictly from approved reviews
   */
  static async recalculateProductRating(productId: mongoose.Types.ObjectId | string): Promise<void> {
    const allApproved = await Review.find({ product: productId, status: 'approved' });
    const reviewCount = allApproved.length;
    const avgRating =
      reviewCount > 0
        ? allApproved.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
    });
  }

  /**
   * Returns approved reviews for a product (or author's own review if authenticated)
   */
  static async getProductReviews(productIdOrSlug: string, currentUserId?: string): Promise<IReview[]> {
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

    let filter: any = { product: targetId, status: 'approved' };
    if (currentUserId && mongoose.isValidObjectId(currentUserId)) {
      filter = {
        product: targetId,
        $or: [{ status: 'approved' }, { user: currentUserId }],
      };
    }

    return Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Returns all reviews for admin moderation
   */
  static async getAllReviews(statusFilter?: string): Promise<IReview[]> {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    const filter = statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)
      ? { status: statusFilter }
      : {};

    return Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'title slug sku')
      .sort({ createdAt: -1 })
      .limit(150);
  }

  /**
   * Checks whether a customer has purchased the product and can submit a review
   */
  static async checkEligibility(
    userId: string,
    productIdOrSlug: string,
    role?: string
  ): Promise<{
    canReview: boolean;
    hasPurchased: boolean;
    existingReview: IReview | null;
    message?: string;
  }> {
    let targetId = productIdOrSlug;
    if (!mongoose.isValidObjectId(productIdOrSlug)) {
      const product = await Product.findOne({ slug: productIdOrSlug }).select('_id');
      if (product) {
        targetId = product._id.toString();
      } else {
        throw new AppError('Product not found', 404);
      }
    }

    const existingReview = await Review.findOne({ product: targetId, user: userId });

    // Check if user has an order with status delivered/shipped/processing or payment completed
    const verifiedOrder = await Order.findOne({
      user: userId,
      'items.product': targetId,
      $or: [
        { paymentStatus: 'completed' },
        { orderStatus: { $in: ['processing', 'shipped', 'delivered'] } },
      ],
    });

    const hasPurchased = Boolean(verifiedOrder) || role === 'admin';
    const canReview = hasPurchased && !existingReview;

    return {
      canReview,
      hasPurchased,
      existingReview,
      message: existingReview
        ? 'You have already submitted a review for this product.'
        : hasPurchased
        ? 'Verified purchaser - eligible to submit a photo review.'
        : 'Only customers who have purchased and ordered this product can submit a verified review.',
    };
  }

  /**
   * Creates a verified review with rating 1-5, comment, optional title, and optional photos
   */
  static async createReview(
    userId: string,
    productIdOrSlug: string,
    rating: number,
    comment: string,
    title?: string,
    images: string[] = [],
    role?: string
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

    // Enforce verified purchase policy
    const verifiedOrder = await Order.findOne({
      user: userId,
      'items.product': targetId,
      $or: [
        { paymentStatus: 'completed' },
        { orderStatus: { $in: ['processing', 'shipped', 'delivered'] } },
      ],
    });

    const isVerifiedPurchase = Boolean(verifiedOrder) || role === 'admin';

    if (!isVerifiedPurchase) {
      throw new AppError(
        'Only customers with a verified purchase of this product are eligible to submit a review.',
        403
      );
    }

    const review = await Review.create({
      product: targetId,
      user: userId,
      rating,
      title: title?.trim(),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      isVerifiedPurchase: true,
      status: 'approved',
    });

    await this.recalculateProductRating(targetId);
    return review;
  }

  /**
   * Updates an existing review (user can edit their own review)
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string; images?: string[] },
    role?: string
  ): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.user.toString() !== userId && role !== 'admin') {
      throw new AppError('Not authorized to edit this review', 403);
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.title !== undefined) review.title = data.title.trim();
    if (data.comment !== undefined) review.comment = data.comment.trim();
    if (data.images !== undefined) review.images = data.images.slice(0, 3);

    await review.save();
    await this.recalculateProductRating(review.product);
    return review;
  }

  /**
   * Admin moderation: approve or reject reviews
   */
  static async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected' | 'pending',
    rejectionReason?: string
  ): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    review.status = status;
    if (rejectionReason !== undefined) {
      review.rejectionReason = rejectionReason;
    }
    await review.save();
    await this.recalculateProductRating(review.product);
    return review;
  }

  /**
   * Deletes a review (customer can delete own review, or admin can delete)
   */
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
    await this.recalculateProductRating(productId);
  }
}

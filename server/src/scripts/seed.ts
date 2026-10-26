import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { cleanLookup } from '../config/database';
import {
  User,
  Category,
  Product,
  Coupon,
  Order,
  Payment,
  Review,
  InventoryMovement,
} from '../models';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_CUSTOMERS,
  SEED_COUPONS,
} from './seedData';

export interface SeedOptions {
  uri?: string;
  clean?: boolean;
}

export const seedDatabase = async (options: SeedOptions = {}): Promise<{
  categories: number;
  products: number;
  customers: number;
  coupons: number;
  orders: number;
  reviews: number;
}> => {
  const targetUri = options.uri || env.MONGODB_URI;
  const isClean = options.clean ?? process.argv.includes('--clean');

  logger.info('========================================================');
  logger.info(`🌱 ShopNest Ethiopia — Database Seeding Engine`);
  logger.info(`Environment: ${env.NODE_ENV} | Clean Mode: ${isClean}`);
  logger.info('========================================================\n');

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(targetUri, {
        lookup: cleanLookup as any,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
    }
    logger.info(`✅ Connected to MongoDB at: ${mongoose.connection.host}`);

    if (isClean) {
      logger.warn('⚠️  Clean flag detected. Removing existing demonstration records...');
      await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        Coupon.deleteMany({}),
        Order.deleteMany({ orderNumber: /^SNE-DEMO-/ }),
        Payment.deleteMany({ transactionReference: /^TXN-DEMO-/ }),
        Review.deleteMany({}),
        InventoryMovement.deleteMany({ reason: /Demo|Initial stock/i }),
        User.deleteMany({ email: /^demo\./ }),
      ]);
      logger.info('🧹 Cleaned existing demo datasets.');
    }

    // 1. Seed Categories (Idempotent upsert by slug)
    logger.info(`\n1️⃣  Seeding Categories (${SEED_CATEGORIES.length} entries)...`);
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const cat of SEED_CATEGORIES) {
      const categoryDoc = await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          $set: {
            name: cat.name,
            nameAmharic: cat.nameAmharic,
            description: cat.description,
            image: cat.image,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(cat.slug, categoryDoc._id as mongoose.Types.ObjectId);
    }
    logger.info(`✅ ${categoryMap.size} Categories synchronized.`);

    // 2. Seed Products (Idempotent upsert by SKU)
    logger.info(`\n2️⃣  Seeding Products (${SEED_PRODUCTS.length} entries)...`);
    const productMap = new Map<string, mongoose.Types.ObjectId>();

    for (const prod of SEED_PRODUCTS) {
      const categoryId = categoryMap.get(prod.categorySlug);
      if (!categoryId) {
        logger.warn(`Category slug not found for: ${prod.categorySlug}`);
        continue;
      }

      const productDoc = await Product.findOneAndUpdate(
        { sku: prod.sku },
        {
          $set: {
            title: prod.title,
            titleAmharic: prod.titleAmharic,
            slug: prod.slug,
            description: prod.description,
            descriptionAmharic: prod.descriptionAmharic,
            price: prod.price,
            discountPrice: prod.discountPrice,
            category: categoryId,
            stock: prod.stock,
            images: prod.images,
            attributes: prod.attributes,
            isPublished: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      productMap.set(prod.sku, productDoc._id as mongoose.Types.ObjectId);

      // Record initial inventory movement if not present
      const movementExists = await InventoryMovement.findOne({
        product: productDoc._id,
        reason: 'Initial demonstration stock',
      });

      if (!movementExists) {
        await InventoryMovement.create({
          product: productDoc._id,
          type: 'stock_in',
          quantity: prod.stock,
          previousStock: 0,
          newStock: prod.stock,
          reason: 'Initial demonstration stock',
        });
      }
    }
    logger.info(`✅ ${productMap.size} Products synchronized.`);

    // 3. Seed Demo Customers (Idempotent upsert by email)
    logger.info(`\n3️⃣  Seeding Demo Customers (${SEED_CUSTOMERS.length} entries)...`);
    const customerMap = new Map<string, mongoose.Types.ObjectId>();

    for (const cust of SEED_CUSTOMERS) {
      let userDoc = await User.findOne({ email: cust.email });
      if (!userDoc) {
        userDoc = await User.create({
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          password: cust.password,
          role: 'customer',
          addresses: [cust.address],
          isVerified: true,
        });
      } else {
        userDoc.name = cust.name;
        userDoc.phone = cust.phone;
        userDoc.addresses = [cust.address];
        userDoc.isVerified = true;
        await userDoc.save();
      }
      customerMap.set(cust.email, userDoc._id as mongoose.Types.ObjectId);
    }
    logger.info(`✅ ${customerMap.size} Demo Customers synchronized.`);

    // 4. Seed Coupons (Idempotent upsert by code)
    logger.info(`\n4️⃣  Seeding Coupons (${SEED_COUPONS.length} entries)...`);
    for (const coupon of SEED_COUPONS) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + coupon.expiryDaysFromNow);

      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        {
          $set: {
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount,
            expiryDate: expiry,
            usageLimit: coupon.usageLimit,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info(`✅ ${SEED_COUPONS.length} Coupons synchronized.`);

    // 5. Seed Demonstration Orders & Payments
    logger.info('\n5️⃣  Seeding Demonstration Orders & Payment Transactions...');
    const abebeId = customerMap.get('demo.abebe@shopnest.et');
    const tigistId = customerMap.get('demo.tigist@shopnest.et');
    const tvId = productMap.get('SNE-ELC-001');
    const coffeeSetId = productMap.get('SNE-HOM-001');
    const kemisId = productMap.get('SNE-FAS-001');
    let orderCount = 0;

    if (abebeId && tvId && coffeeSetId) {
      const demoOrder1 = await Order.findOneAndUpdate(
        { orderNumber: 'SNE-DEMO-001' },
        {
          $set: {
            orderNumber: 'SNE-DEMO-001',
            user: abebeId,
            items: [
              {
                product: tvId,
                title: 'Smart 4K Ultra HD 55-inch LED TV',
                sku: 'SNE-ELC-001',
                price: 34999,
                quantity: 1,
                subtotal: 34999,
              },
              {
                product: coffeeSetId,
                title: 'Authentic Traditional Clay Coffee Jebena Set',
                sku: 'SNE-HOM-001',
                price: 1550,
                quantity: 1,
                subtotal: 1550,
              },
            ],
            shippingAddress: SEED_CUSTOMERS[0].address,
            paymentMethod: 'telebirr',
            paymentStatus: 'completed',
            orderStatus: 'delivered',
            subtotal: 36549,
            deliveryFee: 0,
            discountAmount: 300,
            totalAmount: 36249,
            trackingHistory: [
              { status: 'pending', notes: 'Demonstration order submitted', timestamp: new Date() },
              { status: 'processing', notes: 'Telebirr payment confirmed', timestamp: new Date() },
              { status: 'delivered', notes: 'Delivered to Bole-142, Addis Ababa', timestamp: new Date() },
            ],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Payment.findOneAndUpdate(
        { transactionReference: 'TXN-DEMO-TELEBIRR-001' },
        {
          $set: {
            order: demoOrder1._id,
            user: abebeId,
            amount: 36249,
            currency: 'ETB',
            provider: 'telebirr',
            transactionReference: 'TXN-DEMO-TELEBIRR-001',
            status: 'completed',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      orderCount++;
    }

    if (tigistId && kemisId) {
      const demoOrder2 = await Order.findOneAndUpdate(
        { orderNumber: 'SNE-DEMO-002' },
        {
          $set: {
            orderNumber: 'SNE-DEMO-002',
            user: tigistId,
            items: [
              {
                product: kemisId,
                title: 'Authentic Handwoven Ethiopian Habesha Kemis',
                sku: 'SNE-FAS-001',
                price: 6950,
                quantity: 1,
                subtotal: 6950,
              },
            ],
            shippingAddress: SEED_CUSTOMERS[1].address,
            paymentMethod: 'cbe_birr',
            paymentStatus: 'completed',
            orderStatus: 'shipped',
            subtotal: 6950,
            deliveryFee: 0,
            discountAmount: 0,
            totalAmount: 6950,
            trackingHistory: [
              { status: 'pending', notes: 'Demonstration order placed', timestamp: new Date() },
              { status: 'shipped', notes: 'Dispatched with Addis courier', timestamp: new Date() },
            ],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Payment.findOneAndUpdate(
        { transactionReference: 'TXN-DEMO-CBE-002' },
        {
          $set: {
            order: demoOrder2._id,
            user: tigistId,
            amount: 6950,
            currency: 'ETB',
            provider: 'cbe_birr',
            transactionReference: 'TXN-DEMO-CBE-002',
            status: 'completed',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      orderCount++;
    }
    logger.info('✅ Demonstration Orders & Payments synchronized.');

    // 6. Seed Sample Reviews
    logger.info('\n6️⃣  Seeding Sample Verified Customer Reviews...');
    let reviewCount = 0;
    if (abebeId && tvId) {
      await Review.findOneAndUpdate(
        { product: tvId, user: abebeId },
        {
          $set: {
            product: tvId,
            user: abebeId,
            rating: 5,
            comment: 'እጅግ በጣም ምርጥ ቴሌቪዥን ነው! የምስል ጥራቱ እና የድምፁ ንፅህና አስደናቂ ነው። በቴሌብር በቀላሉ ከፍዬ በ 24 ሰዓት ውስጥ ደርሶኛል።',
            isVerifiedPurchase: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      reviewCount++;
    }

    if (tigistId && kemisId) {
      await Review.findOneAndUpdate(
        { product: kemisId, user: tigistId },
        {
          $set: {
            product: kemisId,
            user: tigistId,
            rating: 5,
            comment: 'የጥጥ ጥራቱ እና የጥልፉ ውበት በጣም የሚያምር ነው። ለበዓል እና ለሰርግ ዝግጅት እጅግ ተስማሚ ነው።',
            isVerifiedPurchase: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      reviewCount++;
    }
    logger.info('✅ Sample Reviews synchronized.');

    logger.info('\n========================================================');
    logger.info('🎉 Database Seeding Completed Successfully!');
    logger.info('All demo records are idempotent and labeled for demonstration.');
    logger.info('========================================================');

    return {
      categories: categoryMap.size,
      products: productMap.size,
      customers: customerMap.size,
      coupons: SEED_COUPONS.length,
      orders: orderCount,
      reviews: reviewCount,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logger.error('Database seeding failed with error:', errMessage);

    if (errMessage.includes('ECONNREFUSED')) {
      logger.warn('\n💡 Connection Tip:');
      logger.warn(`   Could not connect to MongoDB at: ${targetUri}`);
      logger.warn('   If using MongoDB Atlas, configure your MONGODB_URI in server/.env:');
      logger.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/shopnest_ethiopia?retryWrites=true&w=majority');
      logger.warn('   If using local MongoDB, ensure your service is running: net start MongoDB\n');
    }

    throw error;
  }
};

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async () => {
      await mongoose.disconnect();
      process.exit(1);
    });
}

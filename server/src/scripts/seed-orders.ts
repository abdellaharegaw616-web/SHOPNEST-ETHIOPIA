import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { cleanLookup } from '../config/database';
import { Product, Order, User, Payment } from '../models';
import { OrderStatus, EthiopianPaymentProvider } from '@shopnest/shared';

const SAMPLE_CUSTOMERS = [
  {
    name: 'Abdellah Jafer',
    email: 'abdellaj636@gmail.com',
    phone: '0979567153',
    address: {
      fullName: 'Abdellah Jafer',
      phone: '0979567153',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '03',
      houseNumber: 'Africa-Avenue-101',
      landmark: 'Near Millennium Hall, Africa Avenue',
      isDefault: true,
    },
  },
  {
    name: 'Tigist Tadesse',
    email: 'demo.tigist@shopnest.et',
    phone: '0922334455',
    address: {
      fullName: 'Tigist Tadesse',
      phone: '0922334455',
      city: 'Addis Ababa',
      subCity: 'Kirkos',
      woreda: '02',
      houseNumber: 'KZ-405',
      landmark: 'Behind UNECA, Kazanchis',
      isDefault: true,
    },
  },
  {
    name: 'Dawit Haile',
    email: 'demo.dawit@shopnest.et',
    phone: '0933445566',
    address: {
      fullName: 'Dawit Haile',
      phone: '0933445566',
      city: 'Addis Ababa',
      subCity: 'Yeka',
      woreda: '05',
      houseNumber: 'MEG-112',
      landmark: 'Next to Zefmesh Grand Mall, Megenagna',
      isDefault: true,
    },
  },
  {
    name: 'Meron Bekele',
    email: 'demo.meron@shopnest.et',
    phone: '0944556677',
    address: {
      fullName: 'Meron Bekele',
      phone: '0944556677',
      city: 'Addis Ababa',
      subCity: 'Lideta',
      woreda: '04',
      houseNumber: 'MX-202',
      landmark: 'Around Mexico Square, Commerce College',
      isDefault: true,
    },
  },
  {
    name: 'Salem Kassahun',
    email: 'salem.k@gmail.com',
    phone: '0945801156',
    address: {
      fullName: 'Salem Kassahun',
      phone: '0945801156',
      city: 'Addis Ababa',
      subCity: 'Arada',
      woreda: '01',
      houseNumber: 'PZ-88',
      landmark: 'Near St. George Cathedral, Piazza',
      isDefault: true,
    },
  },
  {
    name: 'Abebe Kebede',
    email: 'demo.abebe@shopnest.et',
    phone: '0911223344',
    address: {
      fullName: 'Abebe Kebede',
      phone: '0911223344',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '01',
      houseNumber: 'ED-14',
      landmark: 'Behind Edna Mall, Cameroon Street',
      isDefault: true,
    },
  },
];

const ORDER_TEMPLATES: Array<{
  orderNumber: string;
  customerIndex: number;
  productCount: number;
  paymentMethod: EthiopianPaymentProvider;
  orderStatus: OrderStatus;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  notes: string;
}> = [
  {
    orderNumber: 'SNE-2026-90101',
    customerIndex: 0,
    productCount: 2,
    paymentMethod: 'telebirr',
    orderStatus: 'pending',
    paymentStatus: 'completed',
    notes: 'Awaiting warehouse pick and packaging in Bole hub',
  },
  {
    orderNumber: 'SNE-2026-90102',
    customerIndex: 1,
    productCount: 1,
    paymentMethod: 'cbe_birr',
    orderStatus: 'processing',
    paymentStatus: 'completed',
    notes: 'Payment confirmed via CBE Birr; parcel being packaged',
  },
  {
    orderNumber: 'SNE-2026-90103',
    customerIndex: 2,
    productCount: 3,
    paymentMethod: 'telebirr',
    orderStatus: 'shipped',
    paymentStatus: 'completed',
    notes: 'Out for local dispatch with ShopNest Express bike courier',
  },
  {
    orderNumber: 'SNE-2026-90104',
    customerIndex: 3,
    productCount: 2,
    paymentMethod: 'cash_on_delivery',
    orderStatus: 'processing',
    paymentStatus: 'pending',
    notes: 'Customer phone confirmed for COD delivery in Lideta',
  },
  {
    orderNumber: 'SNE-2026-90105',
    customerIndex: 4,
    productCount: 1,
    paymentMethod: 'chapa',
    orderStatus: 'delivered',
    paymentStatus: 'completed',
    notes: 'Successfully delivered to customer in Piazza and signed',
  },
  {
    orderNumber: 'SNE-2026-90106',
    customerIndex: 5,
    productCount: 2,
    paymentMethod: 'telebirr',
    orderStatus: 'delivered',
    paymentStatus: 'completed',
    notes: 'Delivered to Bole Edna Mall area, customer gave 5-star rating',
  },
  {
    orderNumber: 'SNE-2026-90107',
    customerIndex: 0,
    productCount: 1,
    paymentMethod: 'telebirr',
    orderStatus: 'shipped',
    paymentStatus: 'completed',
    notes: 'In transit to Africa Avenue, Bole Sub-City operations',
  },
  {
    orderNumber: 'SNE-2026-90108',
    customerIndex: 1,
    productCount: 2,
    paymentMethod: 'cash_on_delivery',
    orderStatus: 'cancelled',
    paymentStatus: 'pending',
    notes: 'Customer requested cancellation before courier dispatch',
  },
];

export async function seedOrders() {
  logger.info('Connecting to MongoDB Atlas...');
  await mongoose.connect(env.MONGODB_URI, {
    lookup: cleanLookup as any,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  const products = await Product.find({}).limit(50);
  if (products.length === 0) {
    logger.error('No products found to create sample orders.');
    return;
  }

  const users = await User.find({});
  const userByEmail = new Map<string, any>();
  users.forEach((u) => userByEmail.set(u.email, u));

  logger.info(`Found ${products.length} products and ${users.length} users. Generating orders...`);

  let count = 0;
  for (let i = 0; i < ORDER_TEMPLATES.length; i++) {
    const tpl = ORDER_TEMPLATES[i];
    const customer = SAMPLE_CUSTOMERS[tpl.customerIndex % SAMPLE_CUSTOMERS.length];
    const userDoc = userByEmail.get(customer.email);

    // Pick 1 to 3 random products
    const selectedProducts = [
      products[(i * 3) % products.length],
      products[(i * 3 + 1) % products.length],
      products[(i * 3 + 2) % products.length],
    ].slice(0, tpl.productCount);

    const items = selectedProducts.map((p, idx) => {
      const qty = idx === 0 ? 1 : 2;
      return {
        product: p._id,
        title: p.title,
        sku: p.sku || `SNE-SKU-${i}-${idx}`,
        price: p.price,
        quantity: qty,
        subtotal: p.price * qty,
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const deliveryFee = subtotal > 1500 ? 0 : 150;
    const discountAmount = i % 2 === 0 ? 200 : 0;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    const trackingHistory = [
      {
        status: 'pending' as OrderStatus,
        notes: `Order registered in system via ${tpl.paymentMethod.replace(/_/g, ' ').toUpperCase()}`,
        timestamp: new Date(Date.now() - (8 - i) * 86400000),
      },
    ];

    if (['processing', 'shipped', 'delivered'].includes(tpl.orderStatus)) {
      trackingHistory.push({
        status: 'processing' as OrderStatus,
        notes: 'Payment confirmed; order dispatched to packing center',
        timestamp: new Date(Date.now() - (7 - i) * 86400000),
      });
    }

    if (['shipped', 'delivered'].includes(tpl.orderStatus)) {
      trackingHistory.push({
        status: 'shipped' as OrderStatus,
        notes: `Dispatched with courier to ${customer.address.subCity}, ${customer.address.city}`,
        timestamp: new Date(Date.now() - (6 - i) * 86400000),
      });
    }

    if (tpl.orderStatus === 'delivered') {
      trackingHistory.push({
        status: 'delivered' as OrderStatus,
        notes: 'Delivery completed and confirmed by recipient',
        timestamp: new Date(Date.now() - (5 - i) * 86400000),
      });
    } else if (tpl.orderStatus === 'cancelled') {
      trackingHistory.push({
        status: 'cancelled' as OrderStatus,
        notes: tpl.notes,
        timestamp: new Date(Date.now() - (5 - i) * 86400000),
      });
    }

    await Order.findOneAndUpdate(
      { orderNumber: tpl.orderNumber },
      {
        $set: {
          orderNumber: tpl.orderNumber,
          user: userDoc?._id || undefined,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          items,
          shippingAddress: customer.address,
          deliveryInstructions: `Deliver to ${customer.address.landmark}`,
          paymentMethod: tpl.paymentMethod,
          paymentStatus: tpl.paymentStatus,
          orderStatus: tpl.orderStatus,
          subtotal,
          deliveryFee,
          discountAmount,
          totalAmount,
          trackingHistory,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also link payment record if completed
    if (tpl.paymentStatus === 'completed') {
      await Payment.findOneAndUpdate(
        { transactionReference: `TXN-PAY-${tpl.orderNumber}` },
        {
          $set: {
            order: (await Order.findOne({ orderNumber: tpl.orderNumber }))?._id,
            user: userDoc?._id || undefined,
            provider: tpl.paymentMethod,
            amount: totalAmount,
            status: 'completed',
            paymentDetails: {
              payerName: customer.name,
              payerPhone: customer.phone,
              channel: tpl.paymentMethod,
            },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    count++;
  }

  logger.info(`✅ Successfully seeded/updated ${count} rich orders in MongoDB Atlas!`);
  await mongoose.disconnect();
}

if (process.argv[1]?.includes('seed-orders.ts')) {
  seedOrders()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error seeding orders:', err);
      process.exit(1);
    });
}

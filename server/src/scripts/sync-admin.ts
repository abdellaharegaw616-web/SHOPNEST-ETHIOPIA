import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { cleanLookup } from '../config/database';
import { User } from '../models';

async function run() {
  logger.info('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI, {
    lookup: cleanLookup as any,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  logger.info(`Connected to ${mongoose.connection.host}`);

  const allUsers = await User.find({});
  logger.info(`Total users found: ${allUsers.length}`);
  for (const u of allUsers) {
    logger.info(`User: ${u.email} | Name: "${u.name}" | Phone: "${u.phone}" | Role: ${u.role}`);
  }

  // Find admin accounts
  const shopnestAdmin = await User.findOne({ email: 'admin@shopnest.et' });
  const gmailAdmin = await User.findOne({ email: 'abdellaj636@gmail.com' });

  if (shopnestAdmin && gmailAdmin && shopnestAdmin._id.toString() !== gmailAdmin._id.toString()) {
    logger.info(`Found two admin accounts. Merging into original session user (${shopnestAdmin._id})...`);
    await User.deleteOne({ _id: gmailAdmin._id });
    shopnestAdmin.email = 'abdellaj636@gmail.com';
    shopnestAdmin.name = 'Abdellah ADMIN';
    shopnestAdmin.phone = '0979567153';
    shopnestAdmin.role = 'admin';
    shopnestAdmin.password = 'AdminSecure2026!';
    shopnestAdmin.isVerified = true;
    if (!shopnestAdmin.addresses || shopnestAdmin.addresses.length === 0) {
      shopnestAdmin.addresses = [{
        fullName: 'Abdellah ADMIN',
        phone: '0979567153',
        city: 'Addis Ababa',
        subCity: 'Bole',
        woreda: '03',
        houseNumber: 'Africa-Avenue',
        landmark: 'Africa Avenue, Bole Sub-City, Addis Ababa, Ethiopia',
        isDefault: true,
      }];
    } else {
      shopnestAdmin.addresses[0].fullName = 'Abdellah ADMIN';
      shopnestAdmin.addresses[0].phone = '0979567153';
      shopnestAdmin.addresses[0].subCity = 'Bole';
      shopnestAdmin.addresses[0].landmark = 'Africa Avenue, Bole Sub-City, Addis Ababa, Ethiopia';
    }
    await shopnestAdmin.save();
    logger.info('✅ Successfully consolidated original admin session to abdellaj636@gmail.com, Abdellah ADMIN, 0979567153!');
  } else if (shopnestAdmin) {
    shopnestAdmin.email = 'abdellaj636@gmail.com';
    shopnestAdmin.name = 'Abdellah ADMIN';
    shopnestAdmin.phone = '0979567153';
    shopnestAdmin.role = 'admin';
    shopnestAdmin.password = 'AdminSecure2026!';
    shopnestAdmin.isVerified = true;
    await shopnestAdmin.save();
    logger.info('✅ Updated shopnestAdmin to abdellaj636@gmail.com, Abdellah ADMIN, 0979567153!');
  } else if (gmailAdmin) {
    gmailAdmin.name = 'Abdellah ADMIN';
    gmailAdmin.phone = '0979567153';
    gmailAdmin.role = 'admin';
    gmailAdmin.password = 'AdminSecure2026!';
    gmailAdmin.isVerified = true;
    await gmailAdmin.save();
    logger.info('✅ Updated gmailAdmin to Abdellah ADMIN, 0979567153!');
  }

  await mongoose.disconnect();
  logger.info('Done!');
  process.exit(0);
}

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});

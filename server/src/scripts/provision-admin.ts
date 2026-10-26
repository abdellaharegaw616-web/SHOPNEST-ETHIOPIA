import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { cleanLookup } from '../config/database';
import { User } from '../models';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

// Helper to parse CLI arguments (e.g., --email=admin@shopnest.et)
const getArg = (key: string): string | undefined => {
  const arg = process.argv.find((a) => a.startsWith(`--${key}=`));
  if (arg) {
    return arg.split('=')[1];
  }
  return undefined;
};

export interface AdminProvisionParams {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  uri?: string;
}

export const provisionAdmin = async (params: AdminProvisionParams = {}): Promise<{
  id: string;
  email: string;
  role: string;
  isNew: boolean;
}> => {
  logger.info('========================================================');
  logger.info('🛡️  ShopNest Ethiopia — Administrator Provisioning Engine');
  logger.info('========================================================\n');

  const targetUri = params.uri || env.MONGODB_URI;

  const email = (
    params.email ||
    getArg('email') ||
    process.env.ADMIN_EMAIL ||
    (env.NODE_ENV !== 'production' ? 'admin@shopnest.et' : undefined)
  )?.toLowerCase();

  const password =
    params.password ||
    getArg('password') ||
    process.env.ADMIN_PASSWORD ||
    (env.NODE_ENV !== 'production' ? 'ShopNestAdmin2026!' : undefined);

  const name =
    params.name ||
    getArg('name') ||
    process.env.ADMIN_NAME ||
    'System Administrator';

  const phone =
    params.phone ||
    getArg('phone') ||
    process.env.ADMIN_PHONE ||
    '+251911000000';

  if (!email || !password) {
    logger.error('Missing required administrator credentials.');
    logger.error('Usage: npm run provision-admin -- --email=<email> --password=<password>');
    throw new Error('Missing admin credentials');
  }

  if (password.length < 8) {
    logger.error('Administrator password must be at least 8 characters long.');
    throw new Error('Password too short');
  }

  if (!ETHIOPIA_CONSTANTS.phoneRegex.test(phone)) {
    logger.error(`Invalid Ethiopian phone format for "${phone}".`);
    throw new Error('Invalid Ethiopian phone');
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(targetUri, {
        lookup: cleanLookup as any,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
    }
    logger.info(`✅ Connected to database: ${mongoose.connection.host}`);

    let adminUser = await User.findOne({ email }).select('+password');
    let isNew = false;

    if (adminUser) {
      logger.info(`Administrator account for "${email}" already exists. Updating role and credentials...`);
      adminUser.name = name;
      adminUser.phone = phone;
      adminUser.role = 'admin';
      adminUser.isVerified = true;
      adminUser.password = password;
      await adminUser.save();
      logger.info(`✅ Account "${email}" elevated and synchronized as Administrator.`);
    } else {
      adminUser = await User.create({
        name,
        email,
        password,
        phone,
        role: 'admin',
        isVerified: true,
        addresses: [
          {
            fullName: name,
            phone,
            city: 'Addis Ababa',
            subCity: 'Kirkos',
            woreda: '01',
            houseNumber: 'HQ-01',
            landmark: 'ShopNest Operations Center',
            isDefault: true,
          },
        ],
      });
      isNew = true;
      logger.info(`✅ New Administrator successfully provisioned: ${email}`);
    }

    logger.info('========================================================');
    logger.info(`Admin Email : ${email}`);
    logger.info(`Role        : ${adminUser.role}`);
    logger.info(`Status      : Active`);
    logger.info('========================================================');

    return {
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      isNew,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logger.error('Administrator provisioning encountered an error:', errMessage);

    if (errMessage.includes('ECONNREFUSED')) {
      logger.warn('\n💡 Connection Tip:');
      logger.warn(`   Could not connect to MongoDB at: ${targetUri}`);
      logger.warn('   If using MongoDB Atlas, configure your MONGODB_URI in server/.env:');
      logger.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/shopnest_ethiopia?retryWrites=true&w=majority\n');
    }

    throw error;
  }
};

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes('provision-admin.ts') || process.argv[1]?.includes('provision-admin.js')) {
  provisionAdmin()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async () => {
      await mongoose.disconnect();
      process.exit(1);
    });
}

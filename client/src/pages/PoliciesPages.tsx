import React from 'react';
import { Truck, RotateCcw, ShieldCheck, FileText, MapPin, Clock } from 'lucide-react';
import { BRAND, ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/20 dark:border-orange-500/30">
          <Truck className="w-4 h-4" />
          <span>የማድረሻ ፖሊሲ (Delivery Policy)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-gray-100">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-[#4B5563] dark:text-gray-400 max-w-2xl">
          Fast, secure, and transparent delivery across Addis Ababa and all regional cities in Ethiopia.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1F2937] dark:text-gray-100">Addis Ababa Delivery</h3>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed">
            Same-day or next-day delivery within all 11 Addis Ababa sub-cities (Bole, Kirkos, Yeka, Lideta, etc.). Standard fee is <strong>150 ETB</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1F2937] dark:text-gray-100">Regional Delivery</h3>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed">
            Dispatches to Hawassa, Bahir Dar, Dire Dawa, Adama, Mekelle, Gondar, and other regional hubs within <strong>2 to 4 business days</strong>. Standard fee is <strong>250 ETB</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1F2937] dark:text-gray-100">Free Delivery Threshold</h3>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed">
            Enjoy <strong>100% Free Shipping</strong> automatically when your order subtotal reaches <strong>2,500 ETB</strong> or higher anywhere in Ethiopia!
          </p>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-6 text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">1. Delivery Verification & Confirmation</h2>
        <p>
          Before dispatching orders, our customer support team or assigned courier will confirm your order details and delivery landmark via your provided Ethiopian phone number (+251 9... or +251 7...). Please ensure your contact line is active.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">2. Delivery Handover & Inspection</h2>
        <p>
          Customers have the right to inspect package seals and product models upon delivery before signing the courier receipt or releasing final cash if Cash on Delivery was selected.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">3. Regional Coverage</h2>
        <p>
          We operate logistics partnerships across the following Ethiopian regions: {ETHIOPIA_CONSTANTS.regions.join(', ')}.
        </p>
      </div>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/20 dark:border-orange-500/30">
          <RotateCcw className="w-4 h-4" />
          <span>የዕቃዎች መመለሻ ፖሊሲ (Return Policy)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-gray-100">
          Return & Refund Policy
        </h1>
        <p className="text-sm text-[#4B5563] dark:text-gray-400 max-w-2xl">
          Shop with absolute confidence. We offer a hassle-free 7-day return policy for eligible products.
        </p>
      </div>

      {/* Conditions */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-6 text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">7-Day Satisfaction Guarantee</h2>
        <p>
          You may return items within <strong>7 calendar days</strong> of receiving your delivery if the item is defective, does not match the catalog description, or arrives damaged.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">Return Eligibility Criteria</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Item must be unused and in the original manufacturer packaging with all serial numbers, tags, and accessories intact.</li>
          <li>For electronics, devices must not have had customized software installed or manufacturer seals tampered with.</li>
          <li>Perishable items, opened personal care products, and intimate apparel are exempt from returns due to hygiene standards.</li>
        </ul>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">Refund Methods</h2>
        <p>
          Once your return is inspected and approved at our Addis Ababa fulfillment center, refunds are processed within 24 to 48 business hours directly to your original payment method:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900">
            <p className="font-bold text-[#1F2937] dark:text-gray-100">Telebirr</p>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">Direct wallet refund to registered phone</p>
          </div>
          <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900">
            <p className="font-bold text-[#1F2937] dark:text-gray-100">CBE Birr</p>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">Instant mobile account reversal</p>
          </div>
          <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900">
            <p className="font-bold text-[#1F2937] dark:text-gray-100">Cash on Delivery</p>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">Bank transfer or store credit voucher</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/20 dark:border-orange-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>የግል መረጃ ጥበቃ (Privacy Protection)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-gray-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#4B5563] dark:text-gray-400 max-w-2xl">
          Learn how ShopNest Ethiopia collects, protects, and handles your personal information.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-6 text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">1. Information We Collect</h2>
        <p>
          We collect your name, phone number, email address, and delivery coordinates solely for fulfilling your orders, providing customer support, and securing your account.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">2. Payment Data Security</h2>
        <p>
          ShopNest Ethiopia <strong>never stores</strong> your payment PINs, mobile banking credentials, or bank card security codes. All transactions are securely routed through certified payment gateways (Telebirr, CBE Birr, Chapa).
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">3. Data Sharing & Third Parties</h2>
        <p>
          We do not sell or rent personal information to third parties. Delivery details are shared strictly with authorized dispatch couriers to ensure successful parcel drop-off.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/20 dark:border-orange-500/30">
          <FileText className="w-4 h-4" />
          <span>የአገልግሎት ውሎች (Terms of Service)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-gray-100">
          Terms & Conditions
        </h1>
        <p className="text-sm text-[#4B5563] dark:text-gray-400 max-w-2xl">
          Standard terms governing user accounts, purchases, and dispute resolution on ShopNest Ethiopia.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-6 text-sm text-[#4B5563] dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">1. User Accounts & Security</h2>
        <p>
          By creating an account on {BRAND.name}, you agree to provide authentic contact and address details. You are responsible for keeping your password and session credentials confidential.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">2. Pricing & Currency</h2>
        <p>
          All prices displayed across the platform are denominated in Ethiopian Birr (ETB) and inclusive of applicable value-added taxes unless stated otherwise.
        </p>

        <h2 className="text-xl font-bold text-[#1F2937] dark:text-gray-100">3. Order Acceptance & Inventory Truth</h2>
        <p>
          Receipt of an electronic order confirmation does not signify our final acceptance of your order. In rare events of unforeseen inventory discrepancy, we reserve the right to inform the customer and issue immediate refunds.
        </p>
      </div>
    </div>
  );
};

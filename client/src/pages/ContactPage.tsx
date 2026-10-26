import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ContactPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language?.startsWith('am');

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-[#E5E7EB] dark:border-gray-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] dark:text-white tracking-tight">
          {isAmharic ? 'የደንበኞች አገልግሎት እና ግንኙነት' : 'Contact Customer Care'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 mt-1">
          {isAmharic
            ? 'ለትዕዛዞች፣ ለትራንስፖርት እና ለማንኛውም ጥያቄዎች 24/7 በአማርኛ እና በእንግሊዝኛ እርስዎን ለመርዳት ዝግጁ ነን።'
            : 'We are available 24/7 in English and Amharic to assist with your orders and inquiries.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs space-y-5 transition-colors">
            <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
              {isAmharic ? 'የአዲስ አበባ ደንበኞች ድጋፍ ማዕከል' : 'Addis Ababa Support Desk'}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#4B5563] dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F2937] dark:text-white">
                    {isAmharic ? 'ዋና ቢሮ' : 'Physical Office'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isAmharic
                      ? 'አፍሪካ ጎዳና (ቦሌ መንገድ)፣ ሚሌኒየም አዳራሽ አጠገብ፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ'
                      : 'Africa Avenue, Bole Sub-City, Addis Ababa, Ethiopia'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F2937] dark:text-white">
                    {isAmharic ? 'የስልክ መስመሮች' : 'Telephone Hotlines'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">+251 911 000 000 (Mobile & Telegram)</p>
                  <p className="text-gray-500 dark:text-gray-400">+251 116 000 000 (Landline)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F2937] dark:text-white">
                    {isAmharic ? 'ኢሜይል' : 'Electronic Inquiries'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">support@shopnestethiopia.com</p>
                  <p className="text-gray-500 dark:text-gray-400">orders@shopnestethiopia.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F2937] dark:text-white">
                    {isAmharic ? 'የሥራ ሰዓታት' : 'Operating Hours'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isAmharic ? 'ሰኞ - ቅዳሜ: 2:00 ጥዋት - 2:00 ምሽት' : 'Monday - Saturday: 8:00 AM - 8:00 PM EAT'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isAmharic ? 'እሁድ: 3:00 ጥዋት - 11:00 ቀትር' : 'Sunday: 9:00 AM - 5:00 PM EAT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] dark:border-gray-800 shadow-2xs transition-colors">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] dark:text-white">
                  {isAmharic ? 'መልእክትዎ ደርሶናል' : 'Message Received'}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mx-auto">
                  {isAmharic
                    ? 'ሾፕኔስት ኢትዮጵያን ስላነጋገሩ እናመሰግናለን። የደንበኞች አገልግሎት ተወካያችን በቅርቡ በስልክ ወይም በኢሜይል ያነጋግርዎታል።'
                    : 'Thank you for contacting ShopNest Ethiopia. Our customer representative will reach back via phone or email shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors"
                >
                  {isAmharic ? 'ሌላ መልእክት ላክ' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                      {isAmharic ? 'ስምዎ *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isAmharic ? 'አበበ ቢቂላ' : 'Abebe Bikila'}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                      {isAmharic ? 'ስልክ ቁጥር *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0911234567"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                    {isAmharic ? 'ኢሜይል *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                    {isAmharic ? 'ርዕሰ ጉዳይ' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={isAmharic ? 'የትዕዛዝ ሁኔታ ወይም የዋስትና ጥያቄ' : 'Inquiry about order delivery or warranty'}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                    {isAmharic ? 'መልእክትዎ *' : 'Your Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      isAmharic
                        ? 'የአዲስ አበባ ደንበኞች አገልግሎት ቡድናችን ዛሬ እንዴት ሊረዳዎት ይችላል?'
                        : 'How can our Addis Ababa support team assist you today?'
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-xs text-[#1F2937] dark:text-white focus:outline-hidden focus:border-[#F97316]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isAmharic ? 'መልእክት ላክ' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

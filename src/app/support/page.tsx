'use client';

import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { locations } from '@/data';

export default function SupportPage() {
  const supportCategories = [
    {
      icon: ShoppingBag,
      title: 'Product Information',
      description: 'Questions about our products, availability, and specifications',
      topics: ['Product details', 'Stock availability', 'Product recommendations', 'Age requirements']
    },
    {
      icon: CreditCard,
      title: 'Orders & Payment',
      description: 'Help with orders, payments, and billing',
      topics: ['Order status', 'Payment methods', 'Billing questions', 'Order modifications']
    },
    {
      icon: Truck,
      title: 'Shipping & Pickup',
      description: 'Delivery, pickup, and shipping information',
      topics: ['Shipping options', 'Store pickup', 'Delivery times', 'Tracking orders']
    },
    {
      icon: Shield,
      title: 'Returns & Exchanges',
      description: 'Return policy, exchanges, and refunds',
      topics: ['Return policy', 'Exchange process', 'Refund status', 'Product warranties']
    }
  ];

  const faqs = [
    {
      question: 'What is the minimum age requirement?',
      answer: 'You must be 21 years or older to purchase products from Z Smoke Shop. Valid ID is required for all purchases.'
    },
    {
      question: 'Do you offer same-day pickup?',
      answer: 'Yes! Place your order online and pick it up the same day at any of our store locations during business hours.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, debit cards, and major credit cards. Some locations may have additional payment options.'
    },
    {
      question: 'Can I return opened products?',
      answer: 'Due to health regulations, we cannot accept returns on opened tobacco or vaping products. Unopened items may be returned within 30 days with receipt.'
    },
    {
      question: 'Do you have a loyalty program?',
      answer: 'Yes! Join our rewards program to earn points on every purchase and receive exclusive offers and discounts.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">
              Help
            </h1>
            <div className="w-24 h-1 bg-gray-900 dark:bg-white mx-auto"></div>
          </motion.div>
        </div>
      </div>

      <div className="container-wide py-16">
        {/* Quick Help Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center p-10 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all group"
            >
              <MessageCircle className="h-12 w-12 text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mb-2 uppercase tracking-wide">
                Live Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-200 dark:group-hover:text-gray-600 text-sm uppercase tracking-wide">
                Instant Support
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center p-10 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all group"
            >
              <Phone className="h-12 w-12 text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mb-2 uppercase tracking-wide">
                Call Us
              </h3>
              <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-200 dark:group-hover:text-gray-600 text-sm uppercase tracking-wide">
                Mon-Fri 9AM-8PM
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -2 }}
              className="text-center p-10 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all group"
            >
              <Mail className="h-12 w-12 text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 mb-2 uppercase tracking-wide">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-200 dark:group-hover:text-gray-600 text-sm uppercase tracking-wide">
                24 Hour Response
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Help Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 uppercase tracking-widest text-center">
            Browse Help Topics
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {supportCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -2 }}
                  className="p-8 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <IconComponent className="h-8 w-8 text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 uppercase tracking-wide">
                        {category.title}
                      </h3>
                    </div>
                    <div className="text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900">
                      →
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="border-2 border-gray-900 dark:border-white p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Store Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-wide">
            Visit Our Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="border-2 border-gray-900 dark:border-white p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Store {location.id}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{location.address}</span>
                  </div>
                  
                  {location.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-900 dark:text-white" />
                      <a 
                        href={`tel:${location.phone}`}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>
                  )}
                  
                  {location.hours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-900 dark:text-white" />
                      <span className="text-gray-700 dark:text-gray-300">{location.hours}</span>
                    </div>
                  )}
                </div>
                
                <Link
                  href="/locations"
                  className="inline-block border-2 border-gray-900 dark:border-white px-6 py-2 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors uppercase tracking-wide"
                >
                  Get Directions
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

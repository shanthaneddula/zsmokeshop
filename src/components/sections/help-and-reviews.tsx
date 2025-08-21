"use client";

import { Phone, Star, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

// Placeholder Google Reviews data - will be replaced with actual Google Reviews API
const googleReviews = [
  {
    id: 1,
    author: "Sarah M.",
    rating: 5,
    text: "Excellent selection and knowledgeable staff. They helped me find exactly what I was looking for. Great customer service!",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: 2,
    author: "Mike R.",
    rating: 5,
    text: "Best smoke shop in Austin! Clean store, fair prices, and the staff really knows their products. Highly recommend!",
    date: "1 month ago",
    verified: true
  },
  {
    id: 3,
    author: "Jessica L.",
    rating: 4,
    text: "Great variety of products and convenient locations. Staff is always friendly and helpful.",
    date: "3 weeks ago",
    verified: true
  },
  {
    id: 4,
    author: "David K.",
    rating: 5,
    text: "Amazing customer service and great prices. The staff is very knowledgeable about all their products.",
    date: "1 week ago",
    verified: true
  },
  {
    id: 5,
    author: "Lisa P.",
    rating: 4,
    text: "Clean store with a wide selection. Staff was helpful in finding what I needed. Will definitely return!",
    date: "2 months ago",
    verified: true
  }
];



export default function HelpAndReviews() {
  const [showHoursPopup, setShowHoursPopup] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check if store is currently open
  const isStoreOpen = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Friday (5) and Saturday (6): 10 AM - 12 AM (midnight)
    if (currentDay === 5 || currentDay === 6) {
      return currentHour >= 10 && currentHour < 24;
    }
    // Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4): 10 AM - 11 PM
    else {
      return currentHour >= 10 && currentHour < 23;
    }
  };

  const handleCallStore = () => {
    if (isStoreOpen()) {
      window.open('tel:+1 (661) 371-1413', '_self');
    } else {
      setShowHoursPopup(true);
    }
  };

  const openGoogleReviews = () => {
    window.open('https://www.google.com/search?q=Z+Smoke+Shop+Austin+reviews', '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  // Carousel navigation
  const scrollToReview = useCallback((index: number) => {
    if (carouselRef.current) {
      const reviewWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * reviewWidth,
        behavior: 'smooth'
      });
      setCurrentReviewIndex(index);
    }
  }, []);

  const nextReview = useCallback(() => {
    const nextIndex = (currentReviewIndex + 1) % googleReviews.length;
    scrollToReview(nextIndex);
  }, [currentReviewIndex, scrollToReview]);

  const prevReview = useCallback(() => {
    const prevIndex = currentReviewIndex === 0 ? googleReviews.length - 1 : currentReviewIndex - 1;
    scrollToReview(prevIndex);
  }, [currentReviewIndex, scrollToReview]);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextReview();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextReview]);

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container-wide w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Help Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-wide uppercase">
                NEED HELP?
              </h3>
              
              <button 
                onClick={handleCallStore}
                className="w-full lg:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
              >
                <Phone className="h-5 w-5" />
                Call Expert Staff
              </button>
            </div>
          </div>

          {/* Customer Reviews Carousel */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-wide uppercase">
                CUSTOMER REVIEWS
              </h3>
              
              {/* Average Rating Display */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(5)}
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">4.8</span>
                <span className="text-gray-500 dark:text-gray-400 font-light">
                  ({googleReviews.length} reviews)
                </span>
              </div>

              {/* Reviews Carousel */}
              <div className="relative">
                {/* Carousel Container */}
                <div 
                  ref={carouselRef}
                  className="flex overflow-x-hidden scroll-smooth"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {googleReviews.map((review) => (
                    <div
                      key={review.id}
                      className="w-full flex-shrink-0 px-2"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-700 h-48">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {review.author}
                            </span>
                            {review.verified && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {review.date}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(review.rating)}
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed line-clamp-4">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevReview}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextReview}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-4 gap-2">
                  {googleReviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToReview(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentReviewIndex
                          ? 'bg-gray-900 dark:bg-white'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* View All Reviews Button */}
              <button
                onClick={openGoogleReviews}
                className="mt-6 w-full lg:w-auto border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold px-6 py-3 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors inline-flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Hours Popup */}
      {showHoursPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Store Hours
              </h3>
              <button
                onClick={() => setShowHoursPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Mon-Thu, Sun:</strong> 10:00 AM - 11:00 PM</p>
              <p><strong>Fri-Sat:</strong> 10:00 AM - 12:00 AM</p>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              We&apos;re currently closed. Please call during business hours.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

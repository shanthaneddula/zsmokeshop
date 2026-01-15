import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white p-8">
          {/* Icon */}
          <div className="w-16 h-16 border-2 border-gray-900 dark:border-white mx-auto flex items-center justify-center mb-6">
            <Wrench className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-black uppercase tracking-widest text-center mb-4 text-gray-900 dark:text-white">
            Under Maintenance
          </h1>
          
          {/* Divider */}
          <div className="w-16 h-0.5 bg-gray-900 dark:bg-white mx-auto mb-6"></div>
          
          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
            We are currently performing scheduled maintenance to improve your experience. 
            Please check back soon.
          </p>
          
          {/* Contact Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <p className="text-center text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
              Need Immediate Assistance?
            </p>
            <p className="text-center text-sm font-bold text-gray-900 dark:text-white">
              Call (512) 227-9820
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4 uppercase tracking-widest">
          Z Smoke Shop
        </p>
      </div>
    </div>
  );
}

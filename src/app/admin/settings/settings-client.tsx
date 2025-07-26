'use client';

import { useState, useEffect } from 'react';
import { 
  Store, 
  Users, 
  Shield, 
  Bell, 
  Settings as SettingsIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calculator,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface StoreSettings {
  // Store Information
  storeName: string;
  storeDescription: string;
  businessPhone: string;
  businessEmail: string;
  
  // Store Locations
  locations: {
    id: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    isActive: boolean;
  }[];
  
  // Tax & Pricing
  taxRate: number;
  currency: string;
  
  // Age Verification
  minimumAge: number;
  ageVerificationRequired: boolean;
  ageVerificationMessage: string;
  
  // Order Management
  orderPrefix: string;
  orderStartNumber: number;
  orderExpirationHours: number;
  
  // Notifications
  lowStockThreshold: number;
  emailNotifications: {
    newOrders: boolean;
    lowStock: boolean;
    systemAlerts: boolean;
  };
  
  // Compliance
  complianceEnabled: boolean;
  defaultComplianceLevel: 'none' | 'age-restricted' | 'regulated';
  
  // System
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState('store');
  const [settings, setSettings] = useState<StoreSettings>({
    // Store Information
    storeName: 'Z Smoke Shop',
    storeDescription: 'Premium smoke shop serving Austin, Texas with quality products and exceptional service.',
    businessPhone: '(512) 555-0123',
    businessEmail: 'info@zsmokeshop.com',
    
    // Store Locations
    locations: [
      {
        id: '1',
        name: 'Z SMOKE SHOP',
        address: '5318 Cameron Rd, Austin, TX 78723',
        phone: '(512) 555-0123',
        hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM',
        isActive: true
      },
      {
        id: '2',
        name: '5 STAR SMOKE SHOP & GIFTS',
        address: '5318 Cameron Rd, Austin, TX 78723',
        phone: '(661) 371-1413',
        hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM',
        isActive: true
      }
    ],
    
    // Tax & Pricing
    taxRate: 8.25, // Austin, TX sales tax
    currency: 'USD',
    
    // Age Verification
    minimumAge: 21,
    ageVerificationRequired: true,
    ageVerificationMessage: 'You must be 21 years or older to enter this site and purchase tobacco products.',
    
    // Order Management
    orderPrefix: 'ZSS',
    orderStartNumber: 1000,
    orderExpirationHours: 24,
    
    // Notifications
    lowStockThreshold: 5,
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      systemAlerts: true
    },
    
    // Compliance
    complianceEnabled: true,
    defaultComplianceLevel: 'age-restricted',
    
    // System
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const tabs = [
    { id: 'store', name: 'Store Info', icon: Store },
    { id: 'locations', name: 'Locations', icon: MapPin },
    { id: 'orders', name: 'Orders', icon: Calculator },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: SettingsIcon }
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implement actual save to API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (section: string, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof updates === 'function' ? updates(prev[section as keyof StoreSettings]) : updates
    }));
  };

  const updateLocation = (locationId: string, updates: any) => {
    setSettings(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === locationId ? { ...loc, ...updates } : loc
      )
    }));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your store configuration and preferences
            </p>
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`
              flex items-center px-6 py-3 font-bold uppercase tracking-wide transition-all duration-200
              ${saveStatus === 'saved' 
                ? 'bg-green-600 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Save className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error!' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wide whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          
          {/* Store Information Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Store Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateSettings('storeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => updateSettings('businessPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateSettings('businessEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={settings.taxRate}
                    onChange={(e) => updateSettings('taxRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Austin, TX sales tax rate
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={settings.storeDescription}
                  onChange={(e) => updateSettings('storeDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  placeholder="Brief description of your store..."
                />
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Store Locations
              </h2>
              
              {settings.locations.map((location, index) => (
                <div key={location.id} className="border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-wide">
                      Location {index + 1}
                    </h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={location.isActive}
                        onChange={(e) => updateLocation(location.id, { isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={location.phone}
                        onChange={(e) => updateLocation(location.id, { phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => updateLocation(location.id, { address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={location.hours}
                      onChange={(e) => updateLocation(location.id, { hours: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Order Management
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Order Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.orderPrefix}
                    onChange={(e) => updateSettings('orderPrefix', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    placeholder="ZSS"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Example: {settings.orderPrefix}1001
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.orderStartNumber}
                    onChange={(e) => updateSettings('orderStartNumber', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Order Expiration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.orderExpirationHours}
                    onChange={(e) => updateSettings('orderExpirationHours', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    How long orders remain valid for pickup
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                      Order Process
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Customers place orders online and receive an order number with total amount (including tax). 
                      They can choose which store location to pick up from. No online payments - payment is collected at pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Compliance & Age Verification
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Minimum Age
                  </label>
                  <select
                    value={settings.minimumAge}
                    onChange={(e) => updateSettings('minimumAge', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  >
                    <option value={18}>18 years old</option>
                    <option value={21}>21 years old</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Default Compliance Level
                  </label>
                  <select
                    value={settings.defaultComplianceLevel}
                    onChange={(e) => updateSettings('defaultComplianceLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                  >
                    <option value="none">No Compliance</option>
                    <option value="age-restricted">Age Restricted</option>
                    <option value="regulated">Regulated Product</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.ageVerificationRequired}
                    onChange={(e) => updateSettings('ageVerificationRequired', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-bold uppercase tracking-wide">
                    Require Age Verification
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.complianceEnabled}
                    onChange={(e) => updateSettings('complianceEnabled', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-bold uppercase tracking-wide">
                    Enable Compliance System
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Age Verification Message
                </label>
                <textarea
                  rows={3}
                  value={settings.ageVerificationMessage}
                  onChange={(e) => updateSettings('ageVerificationMessage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Notifications
              </h2>
              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.lowStockThreshold}
                  onChange={(e) => updateSettings('lowStockThreshold', parseInt(e.target.value))}
                  className="w-full max-w-xs px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Send alert when product stock falls below this number
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-wide">Email Notifications</h3>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.newOrders}
                    onChange={(e) => updateSettings('emailNotifications', {
                      ...settings.emailNotifications,
                      newOrders: e.target.checked
                    })}
                    className="mr-3"
                  />
                  <span>New Orders</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.lowStock}
                    onChange={(e) => updateSettings('emailNotifications', {
                      ...settings.emailNotifications,
                      lowStock: e.target.checked
                    })}
                    className="mr-3"
                  />
                  <span>Low Stock Alerts</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications.systemAlerts}
                    onChange={(e) => updateSettings('emailNotifications', {
                      ...settings.emailNotifications,
                      systemAlerts: e.target.checked
                    })}
                    className="mr-3"
                  />
                  <span>System Alerts</span>
                </label>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                System Settings
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSettings('maintenanceMode', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="font-bold uppercase tracking-wide">
                    Maintenance Mode
                  </span>
                </label>
                
                {settings.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      rows={3}
                      value={settings.maintenanceMessage}
                      onChange={(e) => updateSettings('maintenanceMessage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                      Maintenance Mode Warning
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      When enabled, your website will show a maintenance message to visitors. 
                      Only admin users will be able to access the site normally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

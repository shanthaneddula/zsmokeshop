'use client';

import { useState } from 'react';
import { 
  Store, 
  Shield, 
  Bell, 
  Settings as SettingsIcon,
  MapPin,
  Calculator,
  AlertTriangle,
  Save,
  RefreshCw,
  TrendingUp,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  googlePlaceId: string;
  yelpBusinessId: string;
  appleMapsBusiness: string;
  isPrimary: boolean;
}

interface ReviewSettings {
  enableGoogleReviews: boolean;
  enableYelpReviews: boolean;
  enableAppleReviews: boolean;
  autoRefreshInterval: number;
}

interface BusinessSettings {
  locations: BusinessLocation[];
  reviewSettings: ReviewSettings;
}

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
  
  // Display Settings
  enableCart: boolean;
  showPrices: boolean;
  
  // Featured Products
  featuredProducts: {
    enabled: boolean;
    selectedBadges: string[];
    maxProducts: number;
    sortOrder: 'newest' | 'price-low' | 'price-high' | 'name';
    showOnlyInStock: boolean;
  };
  
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
    businessPhone: '(512) 766-3707',
    businessEmail: 'info@zsmokeshop.com',
    
    // Store Locations
    locations: [
      {
        id: '1',
        name: 'Z SMOKE SHOP',
        address: '719 W William Cannon Dr #105, Austin, TX 78745',
        phone: '(512) 766-3707',
        hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM\nFri-Sat: 10:00 AM - 12:00 AM',
        isActive: true
      },
      {
        id: '2',
        name: '5 STAR SMOKE SHOP & GIFTS',
        address: '5318 Cameron Rd, Austin, TX 78723',
        phone: '(661) 371-1413',
        hours: 'Mon-Thu, Sun: 10:00 AM - 11:00 PM\nFri-Sat: 10:00 AM - 12:00 AM',
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
    
    // Display Settings
    enableCart: true,
    showPrices: true,
    
    // Featured Products
    featuredProducts: {
      enabled: true,
      selectedBadges: ['featured', 'best-seller', 'new'],
      maxProducts: 12,
      sortOrder: 'newest',
      showOnlyInStock: true
    },
    
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'changing' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const tabs = [
    { id: 'store', name: 'Store Info', icon: Store },
    { id: 'locations', name: 'Locations', icon: MapPin },
    { id: 'orders', name: 'Orders', icon: Calculator },
    { id: 'display', name: 'Display', icon: Eye },
    { id: 'featured', name: 'Featured Products', icon: TrendingUp },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Key },
    { id: 'system', name: 'System', icon: SettingsIcon }
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    setIsLoading(true);
    
    try {
      console.log('💾 Saving business settings:', settings);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`Failed to save settings: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Settings saved successfully:', result);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('💥 Save error:', error);
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordStatus('changing');
    setPasswordError('');

    try {
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus('success');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setPasswordStatus('idle');
          setShowPasswordForm(false);
        }, 2000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
        setPasswordStatus('error');
        setTimeout(() => setPasswordStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('Network error. Please try again.');
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
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

          {/* Featured Products Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Display Settings
              </h2>
              
              <div className="space-y-6">
                {/* Enable/Disable Cart */}
                <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={settings.enableCart}
                      onChange={(e) => updateSettings('enableCart', e.target.checked)}
                      className="mr-3 mt-1 accent-gray-900 dark:accent-white"
                    />
                    <div>
                      <span className="block font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                        Enable Shopping Cart
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Show or hide the &quot;Add to Cart&quot; button on product pages and shop. When disabled, customers can browse products but cannot add them to cart or checkout.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Show/Hide Prices */}
                <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={settings.showPrices}
                      onChange={(e) => updateSettings('showPrices', e.target.checked)}
                      className="mr-3 mt-1 accent-gray-900 dark:accent-white"
                    />
                    <div>
                      <span className="block font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                        Show Product Prices
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Display or hide prices on all products. When disabled, product cards and detail pages will not show pricing information. Useful for catalog browsing mode.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide text-sm mb-1">
                        Display Settings Info
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        These settings control what customers see on your website. Changes take effect immediately and apply to all product displays, including shop pages, category pages, and product details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Featured Products Tab */}
          {activeTab === 'featured' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Featured Products Settings
              </h2>
              
              <div className="space-y-6">
                {/* Enable/Disable Featured Products */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.featuredProducts.enabled}
                      onChange={(e) => updateSettings('featuredProducts', {
                        ...settings.featuredProducts,
                        enabled: e.target.checked
                      })}
                      className="mr-3"
                    />
                    <span className="font-bold uppercase tracking-wide">
                      Enable Featured Products Section
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Show/hide the featured products carousel on the homepage
                  </p>
                </div>

                {settings.featuredProducts.enabled && (
                  <>
                    {/* Badge Selection */}
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wide mb-4">
                        Select Badges to Feature
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { value: 'featured', label: 'Featured', color: 'bg-blue-100 text-blue-800' },
                          { value: 'best-seller', label: 'Best Seller', color: 'bg-green-100 text-green-800' },
                          { value: 'new', label: 'New', color: 'bg-purple-100 text-purple-800' },
                          { value: 'sale', label: 'Sale', color: 'bg-red-100 text-red-800' },
                          { value: 'limited', label: 'Limited Edition', color: 'bg-yellow-100 text-yellow-800' }
                        ].map((badge) => (
                          <label key={badge.value} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.featuredProducts.selectedBadges.includes(badge.value)}
                              onChange={(e) => {
                                const newBadges = e.target.checked
                                  ? [...settings.featuredProducts.selectedBadges, badge.value]
                                  : settings.featuredProducts.selectedBadges.filter(b => b !== badge.value);
                                updateSettings('featuredProducts', {
                                  ...settings.featuredProducts,
                                  selectedBadges: newBadges
                                });
                              }}
                              className="mr-3"
                            />
                            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Products with selected badges will appear in the featured section
                      </p>
                    </div>

                    {/* Maximum Products */}
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                        Maximum Products to Display
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="20"
                        value={settings.featuredProducts.maxProducts}
                        onChange={(e) => updateSettings('featuredProducts', {
                          ...settings.featuredProducts,
                          maxProducts: parseInt(e.target.value) || 12
                        })}
                        className="w-32 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Recommended: 8-12 products for optimal carousel performance
                      </p>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                        Sort Order
                      </label>
                      <select
                        value={settings.featuredProducts.sortOrder}
                        onChange={(e) => updateSettings('featuredProducts', {
                          ...settings.featuredProducts,
                          sortOrder: e.target.value as 'newest' | 'price-low' | 'price-high' | 'name'
                        })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      >
                        <option value="newest">Newest First</option>
                        <option value="name">Alphabetical</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>

                    {/* Stock Filter */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.featuredProducts.showOnlyInStock}
                          onChange={(e) => updateSettings('featuredProducts', {
                            ...settings.featuredProducts,
                            showOnlyInStock: e.target.checked
                          })}
                          className="mr-3"
                        />
                        <span className="font-bold uppercase tracking-wide">
                          Show Only In-Stock Products
                        </span>
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Hide out-of-stock products from the featured section
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                Security Settings
              </h2>
              
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                        Admin Password
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Change your admin login password
                      </p>
                    </div>
                    
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            placeholder="Enter new password (min 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {passwordError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
                          <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
                        </div>
                      )}

                      {/* Success Message */}
                      {passwordStatus === 'success' && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded">
                          <p className="text-sm text-green-800 dark:text-green-200">Password changed successfully!</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          disabled={passwordStatus === 'changing' || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                          className={`
                            flex items-center px-4 py-2 font-bold uppercase tracking-wide transition-all
                            ${passwordStatus === 'changing'
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                            }
                          `}
                        >
                          {passwordStatus === 'changing' ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {passwordStatus === 'changing' ? 'Changing...' : 'Change Password'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError('');
                            setPasswordStatus('idle');
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Security Best Practices
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Use a strong password with at least 8 characters</li>
                        <li>• Include uppercase, lowercase, numbers, and special characters</li>
                        <li>• Change your password regularly</li>
                        <li>• Never share your admin credentials</li>
                        <li>• Log out when finished using the admin panel</li>
                      </ul>
                    </div>
                  </div>
                </div>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Image,
  ShoppingBag,
  Users
} from 'lucide-react';
import { User, UserPermissions } from '@/types/users';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
  requiredPermission?: keyof UserPermissions;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    requiredPermission: 'viewOrders',
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    requiredPermission: 'viewProducts',
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
    requiredPermission: 'viewCategories',
  },
  {
    name: 'Store Photos',
    href: '/admin/store-photos',
    icon: Image,
    requiredPermission: 'viewStorePhotos',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    requiredPermission: 'viewSettings',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/admin/auth/me');
      const data = await response.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (item: NavItem): boolean => {
    // If user data is still loading, don't show anything
    if (loading || !currentUser) return false;

    // Main admin has access to everything
    const isMainAdmin = !('permissions' in currentUser);
    if (isMainAdmin) return true;

    // Check admin-only items
    if (item.adminOnly) return false;

    // Check required permission
    if (item.requiredPermission && 'permissions' in currentUser) {
      return currentUser.permissions[item.requiredPermission] === true;
    }

    return true;
  };

  const filteredNavigation = navigation.filter(hasPermission);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-[4.125rem] left-0 z-20 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        h-[calc(100vh-4.125rem-8rem)]
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-gray-900 dark:border-white flex items-center justify-center">
              <span className="text-lg font-black text-gray-900 dark:text-white">Z</span>
            </div>
            <span className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors
                  ${isActive 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-l-2 border-gray-900 dark:border-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center px-3 py-2 text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-5 h-5 mr-3" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium uppercase tracking-wide text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile menu button - only show on mobile */}
        <div className="lg:hidden sticky top-[4.125rem] z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 pt-[4.125rem]">
          {children}
        </main>
      </div>
    </div>
  );
}

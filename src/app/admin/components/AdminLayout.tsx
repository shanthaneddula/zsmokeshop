'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  Settings, 
  X,
  Home,
  Image,
  ShoppingBag,
  Users,
  UserCircle,
  Clock
} from 'lucide-react';
import { User, UserPermissions } from '@/types/users';
import { LucideIcon } from 'lucide-react';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  requiredPermission?: keyof UserPermissions;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    adminOnly: true, // Only admin can see the main dashboard
  },
  {
    name: 'My Dashboard',
    href: '/admin/my-dashboard',
    icon: Home,
    // Available to all employees (not admin-only)
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
    adminOnly: true, // Only admin can access global settings
  },
  {
    name: 'Timesheet',
    href: '/admin/timesheet',
    icon: Clock,
    // No permission required - everyone can track their time
  },
  {
    name: 'Profile',
    href: '/admin/profile',
    icon: UserCircle,
    // No permission required - everyone can access their profile
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

  // Redirect users to their appropriate default route if they don't have permission
  useEffect(() => {
    if (loading || !currentUser) return;

    const isMainAdmin = !('permissions' in currentUser);
    
    // Main admin can access everything
    if (isMainAdmin) return;

    // Profile, timesheet, and my-dashboard routes are always allowed for everyone
    if (pathname.startsWith('/admin/profile') || 
        pathname.startsWith('/admin/timesheet') || 
        pathname.startsWith('/admin/my-dashboard')) {
      return;
    }

    // Check if current route is allowed for this user
    const currentRoute = navigation.find(item => {
      // Exact match
      if (pathname === item.href) return true;
      // Sub-route match (e.g., /admin/orders/123 matches /admin/orders)
      if (item.href !== '/admin' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/')) return true;
      return false;
    });

    // If route not found in navigation, allow it (could be a dynamic route)
    if (!currentRoute) return;

    // If current route requires admin-only access, redirect
    if (currentRoute.adminOnly) {
      router.push('/admin/my-dashboard');
      return;
    }

    // If current route requires a permission the user doesn't have, redirect
    if (currentRoute.requiredPermission && 'permissions' in currentUser) {
      if (!currentUser.permissions[currentRoute.requiredPermission]) {
        router.push('/admin/my-dashboard');
        return;
      }
    }

    // If user is on /admin (dashboard) and is not main admin, redirect
    if (pathname === '/admin' && !isMainAdmin) {
      router.push('/admin/my-dashboard');
    }
    
    // If user is on old /admin route (now should be /admin/dashboard), redirect
    if (pathname === '/admin' && isMainAdmin) {
      router.push('/admin/dashboard');
    }
  }, [currentUser, loading, pathname, router]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-16 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          h-[calc(100vh-4rem)] overflow-y-auto
        `}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border border-gray-900 dark:border-white flex items-center justify-center">
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
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-black uppercase tracking-wide transition-all
                    ${isActive 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center px-4 py-3 text-sm font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5 mr-3" />
              View Store
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

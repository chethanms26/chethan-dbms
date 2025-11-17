import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  BarChart3
} from 'lucide-react';

const Navbar = ({ user, handleLogout }) => {
  const location = useLocation();

  if (!user) return null; // Hide navbar fully on login page

  // Role-based menu items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'CUSTOMER', 'SUPPLIER'] },
    { path: '/products', label: 'Products', icon: Package, roles: ['ADMIN', 'SUPPLIER'] },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['ADMIN', 'CUSTOMER'] },
    { path: '/customers', label: 'Customers', icon: Users, roles: ['ADMIN'] },
    { path: '/inventory', label: 'Inventory', icon: Warehouse, roles: ['ADMIN', 'SUPPLIER'] },
    { path: '/payments', label: 'Payments', icon: BarChart3, roles: ['ADMIN', 'CUSTOMER'] }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left - App Name */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SCM Portal</span>
            </div>

            {/* Navigation Links (Desktop) */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems
                .filter((item) => item.roles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Right side - User + Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 font-medium">
              {user.username || user.role}
            </span>

            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-base font-medium ${
                    active
                      ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

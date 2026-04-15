import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, LayoutDashboard, PlusCircle, User, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from './ui/button';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, userRole, logOut } = useAuth();

  const navItems = [
    { name: 'Discover', path: '/', icon: Search },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">DirectEstate</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {(userRole === 'seller' || userRole === 'agent' || userRole === 'admin') && (
                  <Link to="/add-property">
                    <Button variant="outline" className="hidden md:flex gap-2">
                      <PlusCircle className="w-4 h-4" />
                      List Property
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user.displayName} {userRole && <span className="text-xs text-gray-400 ml-1 capitalize">({userRole})</span>}
                  </span>
                  <Button variant="ghost" size="icon" className="rounded-full bg-gray-100" onClick={logOut}>
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="gap-2">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="gap-2">
                    <User className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

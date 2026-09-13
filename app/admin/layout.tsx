'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  LayoutDashboard,
  Compass,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
  ChevronRight,
  PlusCircle,
  MapPin,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on the login page, render children directly without the admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Failed to log out:', err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin',
    },
    {
      name: 'Tour Packages',
      href: '/admin/tours',
      icon: Compass,
      isActive: pathname.startsWith('/admin/tours'),
      badge: pathname === '/admin/tours/create' ? 'Creating' : undefined,
    },
    {
      name: 'Destinations',
      href: '/admin/destinations',
      icon: MapPin,
      isActive: pathname.startsWith('/admin/destinations'),
      badge: pathname === '/admin/destinations/create' ? 'Creating' : undefined,
    },
  ];

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    if (pathname === '/admin') {
      return [{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }];
    }
    if (pathname === '/admin/tours/create') {
      return [
        { label: 'Admin', href: '/admin' },
        { label: 'Tours', href: '/admin/tours' },
        { label: 'Create Package' },
      ];
    }
    if (pathname.startsWith('/admin/tours') && pathname.includes('/edit')) {
      return [
        { label: 'Admin', href: '/admin' },
        { label: 'Tours', href: '/admin/tours' },
        { label: 'Edit Package' },
      ];
    }
    if (pathname.startsWith('/admin/tours')) {
      return [{ label: 'Admin', href: '/admin' }, { label: 'Tours' }];
    }
    if (pathname === '/admin/destinations/create') {
      return [
        { label: 'Admin', href: '/admin' },
        { label: 'Destinations', href: '/admin/destinations' },
        { label: 'Create Destination' },
      ];
    }
    if (pathname.startsWith('/admin/destinations') && pathname.includes('/edit')) {
      return [
        { label: 'Admin', href: '/admin' },
        { label: 'Destinations', href: '/admin/destinations' },
        { label: 'Edit Destination' },
      ];
    }
    if (pathname.startsWith('/admin/destinations')) {
      return [{ label: 'Admin', href: '/admin' }, { label: 'Destinations' }];
    }
    return [{ label: 'Admin', href: '/admin' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <BrandLogo variant="header" href="/admin" subtext="Admin" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-slate-200/80
          flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-sm
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <BrandLogo variant="sidebar" href="/admin" subtext="Operations Hub" />
          </div>

          {/* Quick Action Button in Sidebar */}
          <div className="p-3">
            <Link
              href="/admin/tours/create"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Tour</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${
                      item.isActive
                        ? 'bg-orange-50 text-orange-950 border border-orange-200/60 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        item.isActive ? 'text-[#FF6B00]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-200/80 text-orange-900">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Live Website Link */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 transition-all shadow-2xs group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span>View Public Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-20 md:hidden"
        />
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-orange-600 transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={`font-bold ${isLast ? 'text-slate-900' : 'text-slate-500'}`}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} closeMobileMenu={closeMobileMenu} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header toggleMobileMenu={toggleMobileMenu} />
        <main className="content-container">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

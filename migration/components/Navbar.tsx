"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

type DropdownMenu = 'support' | 'community' | null;

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownMenu>(null);

  const toggleDropdown = (menu: NonNullable<DropdownMenu>) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleCloseMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        <Link href="/" className="navbar-logo" onClick={handleCloseMenus} aria-label="Bloom After home">
          <Image 
            src="/assets/logo/BLOOM LIGHT primary.png" 
            alt="Bloom After logo" 
            width={130} 
            height={40} 
            priority
          />
        </Link>

        <div className="navbar-links" aria-label="Desktop navigation">
          <Link 
            href="/resources" 
            onClick={handleCloseMenus}
            className={`navbar-link ${pathname === '/resources' ? 'active' : ''}`}
          >
            Resources Hub
          </Link>

          <span 
            className={`navbar-dropdown ${openDropdown === 'support' ? 'open' : ''}`}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              className="navbar-dropdown-toggle" 
              aria-expanded={openDropdown === 'support'} 
              aria-haspopup="true"
              onClick={() => toggleDropdown('support')}
              onMouseEnter={() => setOpenDropdown('support')}
            >
              Get Support <ChevronDown className="navbar-chevron" size={14} aria-hidden="true" />
            </button>
            <div className="navbar-dropdown-menu" aria-label="Get Support">
              <Link href="/clinics" onClick={handleCloseMenus} className={pathname === '/clinics' ? 'active' : ''}>Clinics & Hospitals</Link>
              <Link href="/ngos" onClick={handleCloseMenus} className={pathname === '/ngos' ? 'active' : ''}>NGO Directory</Link>
              <Link href="/crisis-handling" onClick={handleCloseMenus} className={pathname === '/crisis-handling' ? 'active' : ''}>Crisis Handling</Link>
            </div>
          </span>

          <span 
            className={`navbar-dropdown ${openDropdown === 'community' ? 'open' : ''}`}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              className="navbar-dropdown-toggle" 
              aria-expanded={openDropdown === 'community'} 
              aria-haspopup="true"
              onClick={() => toggleDropdown('community')}
              onMouseEnter={() => setOpenDropdown('community')}
            >
              Community <ChevronDown className="navbar-chevron" size={14} aria-hidden="true" />
            </button>
            <div className="navbar-dropdown-menu" aria-label="Community">
              <Link href="/stories" onClick={handleCloseMenus} className={pathname === '/stories' ? 'active' : ''}>Stories</Link>
              <Link href="/lifestyle" onClick={handleCloseMenus} className={pathname === '/lifestyle' ? 'active' : ''}>Lifestyle & Interventions</Link>
            </div>
          </span>

          <Link href="/#team" onClick={handleCloseMenus} className={`navbar-link ${pathname === '/contributors' ? 'active' : ''}`}>
            The Team
          </Link>
        </div>

        <Link href="/clinics" onClick={handleCloseMenus} className="navbar-cta">Find care near you</Link>

        <button
          className="navbar-hamburger"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div 
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} 
        id="mobile-menu" 
        aria-label="Mobile navigation" 
        aria-hidden={!isMobileMenuOpen}
      >
        <span className="mobile-menu-group-label">Learn More</span>
        <Link href="/resources" onClick={handleCloseMenus} className="mobile-menu-link">Resources Hub</Link>

        <span className="mobile-menu-group-label">Get Support</span>
        <Link href="/clinics" onClick={handleCloseMenus} className="mobile-menu-link">Clinics & Hospitals</Link>
        <Link href="/ngos" onClick={handleCloseMenus} className="mobile-menu-link">NGO Directory</Link>
        <Link href="/crisis-handling" onClick={handleCloseMenus} className="mobile-menu-link">Crisis Handling</Link>

        <span className="mobile-menu-group-label">Community</span>
        <Link href="/stories" onClick={handleCloseMenus} className="mobile-menu-link">Stories</Link>
        <Link href="/lifestyle" onClick={handleCloseMenus} className="mobile-menu-link">Lifestyle & Interventions</Link>

        <span className="mobile-menu-group-label">The Team</span>
        <Link href="/#team" onClick={handleCloseMenus} className="mobile-menu-link">Contributors</Link>

        <aside className="mobile-menu-crisis" aria-label="Crisis support">
          <p>If you are in crisis:</p>
          <a href="tel:08001234567">0800 123 4567</a>
        </aside>
      </div>
    </>
  );
}
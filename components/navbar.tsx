"use client";

import React, { useState, useEffect } from 'react';
import { Gift, ChevronDown, Brain, TrendingUp, Target, Image, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import { useDropdown } from '../contexts/DropdownContext';

export function Navbar() {
  const { isFeaturesOpen, setIsFeaturesOpen } = useDropdown();
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI Trend Predictor",
      description: "Predict viral trends before they explode",
      href: "/ai-trend"
    },
    {
      icon: Image,
      title: "Thumbnail Generator",
      description: "AI-powered thumbnail creation",
      href: "/create"
    },
    {
      icon: TrendingUp,
      title: "Trend Analytics",
      description: "Real-time trend tracking & insights",
      href: "/discover"
    },
    {
      icon: Target,
      title: "Keyword Research",
      description: "Find trending keywords & niches",
      href: "/keywords"
    }
  ];

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down (but not if features dropdown is open)
      else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isFeaturesOpen) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isFeaturesOpen]);

  const styles = {
    body: {
      margin: 0,
      padding: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      backgroundColor: 'white',
      minHeight: '5rem'
    },
    navbar: {
      width: '100%',
      padding: '12px 0',
      backgroundColor: 'white',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1001,
      transform: isVisible ? 'translateY(0) scaleY(1)' : 'translateY(-80%) scaleY(0.3)',
      transformOrigin: 'top center',
      opacity: isVisible ? 1 : 0,
      transition: isVisible 
        ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
        : 'all 0.35s cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      boxShadow: 'none',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    },
    navbarContainer: {
      maxWidth: '1080px',
      width: '95%',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '60px',
      '@media (max-width: 768px)': {
        padding: '0 10px'
      }
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    circularN: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: '3px solid #004324',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      fontSize: '24px',
      fontWeight: '900',
      color: '#004324'
    },
    brandText: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start'
    },
    brandName: {
      color: '#004324',
      fontSize: '22px',
      fontWeight: 900,
      lineHeight: 1.2,
      letterSpacing: '0.5px',
      margin: 0,
      '@media (max-width: 768px)': {
        fontSize: '18px'
      }
    },
    tagline: {
      color: '#004324',
      fontSize: '10px',
      fontWeight: 400,
      fontStyle: 'italic' as const,
      lineHeight: 1.2,
      margin: 0,
      marginTop: '1px',
      letterSpacing: '1.5px',
      width: '100%'
    },
    leftGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
      '@media (max-width: 768px)': {
        display: 'none'
      }
    },
    navLink: {
      fontSize: '16px',
      fontWeight: 500,
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
      position: 'relative' as const,
      padding: '8px 12px'
    },
    featuresDropdown: {
      position: 'relative' as const,
      display: 'inline-block'
    },
    featuresButton: {
      fontSize: '16px',
      fontWeight: 500,
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
      position: 'relative' as const,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: 'transparent',
      border: 'none'
    },
    dropdownMenu: {
      position: 'fixed' as const,
      top: '80px',
      left: '0',
      right: '0',
      transform: isFeaturesOpen ? 'scaleY(1)' : 'scaleY(0)',
      transformOrigin: 'top',
      backgroundColor: 'white',
      borderRadius: '0',
      boxShadow: 'none',
      border: 'none',
      width: '100vw',
      height: 'calc(60vh - 1rem)',
      zIndex: 9999,
      padding: '40px 32px',
      opacity: isFeaturesOpen ? 1 : 0,
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      pointerEvents: isFeaturesOpen ? 'auto' as const : 'none' as const,
      overflow: 'hidden'
    },
    overlay: {
      position: 'fixed' as const,
      top: '80px',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 9998,
      opacity: isFeaturesOpen ? 1 : 0,
      transition: 'opacity 0.3s ease-out',
      pointerEvents: isFeaturesOpen ? 'auto' as const : 'none' as const
    },
    dropdownGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0',
      maxWidth: '1400px',
      margin: '0 auto',
      height: '100%',
      alignItems: 'center',
      position: 'relative' as const
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px 24px',
      borderRadius: '0',
      textDecoration: 'none',
      color: '#374151',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      flexDirection: 'column' as const,
      textAlign: 'center' as const,
      backgroundColor: 'transparent',
      border: 'none',
      position: 'relative' as const,
      '&:hover': {
        backgroundColor: '#f0f9f4',
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 30px rgba(0, 67, 36, 0.15)'
      }
    },
    dropdownIcon: {
      width: '32px',
      height: '32px',
      color: '#004324',
      flexShrink: 0,
      marginBottom: '12px'
    },
    dropdownContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      width: '100%'
    },
    dropdownTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      margin: 0,
      lineHeight: 1.3
    },
    dropdownDescription: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
      lineHeight: 1.4
    },
    navButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      '@media (max-width: 768px)': {
        gap: '12px'
      }
    },
    btnDonate: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      backgroundColor: 'white',
      color: '#004324',
      border: '1px solid #004324',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      boxShadow: '0 3px 0 #002a18',
      transform: 'translateY(0)',
      '&:hover': {
        transform: 'translateY(1px)',
        boxShadow: '0 2px 0 #002a18'
      },
      '&:active': {
        transform: 'translateY(3px)',
        boxShadow: '0 0px 0 #002a18'
      },
      '@media (max-width: 768px)': {
        padding: '6px 12px',
        fontSize: '13px'
      }
    },
    btnGetStarted: {
      padding: '8px 16px',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      '@media (max-width: 768px)': {
        padding: '6px 12px',
        fontSize: '13px'
      }
    }
  };

  return (
    <div style={styles.body}>
      {/* Spacer to prevent content jump when navbar becomes fixed */}
      <div style={{ height: '84px' }} />
      <nav style={styles.navbar}>
        <div style={styles.navbarContainer}>
          <div style={styles.leftGroup}>
            <div style={styles.logo}>
              <div style={styles.circularN}>N</div>
              <div style={styles.brandText}>
                <h1 style={styles.brandName}>NexTrend</h1>
             
              </div>
            </div>
            
            <div style={styles.navLinks}>
            <Link 
              href="/" 
              style={{
                ...styles.navLink,
                color: hoveredLink === 'home' ? '#004324' : '#000000'
              }}
              onMouseEnter={() => {
                setHoveredLink('home');
                setIsFeaturesOpen(false);
              }}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              style={{
                ...styles.navLink,
                color: hoveredLink === 'about' ? '#004324' : '#000000'
              }}
              onMouseEnter={() => {
                setHoveredLink('about');
                setIsFeaturesOpen(false);
              }}
              onMouseLeave={() => setHoveredLink(null)}
            >
              About
            </Link>
            <div style={styles.featuresDropdown}>
              <button
                style={{
                  ...styles.featuresButton,
                  color: hoveredLink === 'features' ? '#004324' : '#000000'
                }}
                onMouseEnter={() => {
                  setIsFeaturesOpen(true);
                  setHoveredLink('features');
                }}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Features
                <ChevronDown size={16} style={{ transform: isFeaturesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </button>
            </div>
            <Link 
              href="/contact" 
              style={{
                ...styles.navLink,
                color: hoveredLink === 'contact' ? '#004324' : '#000000'
              }}
              onMouseEnter={() => {
                setHoveredLink('contact');
                setIsFeaturesOpen(false);
              }}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Contact
            </Link>
            </div>
          </div>
          
          <div style={styles.navButtons}>
            <button style={styles.btnDonate}>
              <Gift size={16} />
              <span>Donate</span>
            </button>
            <button 
              style={{
                ...styles.btnGetStarted,
                backgroundColor: isGetStartedHovered ? '#004324' : '#303030',
                transform: isGetStartedHovered ? 'translateY(1px)' : 'translateY(0)',
                boxShadow: isGetStartedHovered ? '0 4px 0 #000000' : '0 6px 0 #000000'
              }}
              onMouseEnter={() => setIsGetStartedHovered(true)}
              onMouseLeave={() => setIsGetStartedHovered(false)}
            >
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Overlay */}
      <div
        style={styles.overlay}
        onMouseEnter={() => setIsFeaturesOpen(false)}
      />
      
      {/* Full-width dropdown */}
      <div
        style={styles.dropdownMenu}
        onMouseEnter={() => setIsFeaturesOpen(true)}
        onMouseLeave={() => setIsFeaturesOpen(false)}
      >
        <div style={styles.dropdownGrid}>
          {features.map((feature, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <Link href={feature.href} style={styles.dropdownItem}>
                <feature.icon style={styles.dropdownIcon} />
                <div style={styles.dropdownContent}>
                  <h4 style={styles.dropdownTitle}>{feature.title}</h4>
                  <p style={styles.dropdownDescription}>{feature.description}</p>
                </div>
              </Link>
              {index < features.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '20%',
                  bottom: '20%',
                  width: '1px',
                  backgroundColor: '#e5e7eb',
                  zIndex: 1
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
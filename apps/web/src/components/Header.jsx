import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { motion } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Activities', path: '/activities' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Team', path: '/team' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300">
              <img 
                src="/nss-logo.png" 
                alt="NSS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                NSS SRM RMP
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-primary/5 border border-primary/10 p-1.5 rounded-full backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2 text-sm font-semibold transition-all duration-300 rounded-full ${
                  isActive(link.path) 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_4px_15px_rgba(0,163,255,0.3)]"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Auth / Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {!isAuthenticated ? (
              <Button asChild className="rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 px-6 font-semibold shadow-lg shadow-primary/25">
                <Link to="/login">Volunteer Login</Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/my-hours"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Dashboard
                </Link>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="rounded-full border-primary/20 hover:bg-primary/10 text-foreground hover:text-primary hover:scale-105 transition-all duration-300"
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden relative z-10">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10 rounded-full">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-white/10 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                      <img 
                        src="/nss-logo.png" 
                        alt="NSS Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-lg font-bold text-foreground">Menu</span>
                  </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-primary/10 text-primary border border-primary/10'
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {link.name}
                      {isActive(link.path) && <ArrowRight className="w-4 h-4 text-primary" />}
                    </Link>
                  ))}
                  
                  {isAuthenticated && (
                    <Link
                      to="/my-hours"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-4 rounded-xl text-base font-medium text-primary hover:bg-white/5 border border-transparent transition-all duration-300 mt-4"
                    >
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </nav>

                <div className="p-6 border-t border-white/10 bg-white/5">
                  {!isAuthenticated ? (
                    <Button asChild className="w-full rounded-xl bg-white text-background hover:bg-white/90 h-12 text-base font-semibold">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Volunteer Login
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-xl border-primary/20 text-foreground hover:bg-primary/10 h-12 text-base"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, ArrowUp, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/srmist_nss?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  return (
    <footer className="relative bg-white pt-20 pb-10 border-t border-primary/10 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-6 inline-flex">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">N</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">NSS SRM RMP</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-8">
              Empowering youth through community service, social responsibility, and dedicated action. Join us in building a better tomorrow.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-colors duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-foreground font-semibold mb-6 tracking-wide uppercase text-sm">Navigation</h3>
            <ul className="space-y-4">
              {['About Us', 'Events', 'Gallery', 'Team'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-foreground font-semibold mb-6 tracking-wide uppercase text-sm">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1 leading-relaxed">SRM Institute Of Science and Technology, Ramapuram, Chennai, Tamil Nadu 600089</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>nsssrmistrmp@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary/10 flex flex-col items-center justify-center gap-2 relative">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} NSS SRM RMP. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Designed & Developed by Sai Vishnu Kandur C
          </p>

          <button
            onClick={scrollToTop}
            className="absolute right-0 bottom-0 md:bottom-2 w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg transition-all duration-300 group hidden md:flex"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
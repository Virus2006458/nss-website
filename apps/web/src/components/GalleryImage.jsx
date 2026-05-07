import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const GalleryImage = ({ src, alt, index = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative overflow-hidden rounded-xl cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 flex items-center justify-center transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={src} alt={alt} className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GalleryImage;
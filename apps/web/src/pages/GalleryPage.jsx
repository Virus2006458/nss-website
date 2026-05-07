import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackImages = [
  { id: '1', url: 'https://images.unsplash.com/photo-1698691962607-934adb8e7de1', alt: 'Tree Plantation' },
  { id: '2', url: 'https://images.unsplash.com/photo-1587987978606-3f39c0e18db5', alt: 'Blood Donation' },
  { id: '3', url: 'https://images.unsplash.com/photo-1596365456177-5dd99bdcbea3', alt: 'Community Camp' },
  { id: '4', url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a', alt: 'Service' },
  { id: '5', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433', alt: 'Education' },
  { id: '6', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', alt: 'Relief' }
];

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Fetch directly from the gallery_images table
        const { data: records, error } = await supabase.from('gallery_images').select('*').order('created', { ascending: false });
        
        if (records && records.length > 0) {
          const formatted = records.map(r => ({
            id: r.id,
            url: r.image_url,
            alt: r.title || 'Gallery image'
          }));
          setImages(formatted);
        } else {
          setImages(fallbackImages);
        }
      } catch (error) {
        console.log('Using fallback gallery images');
        setImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleNext = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gallery - NSS SRM RMP</title>
      </Helmet>

      <Header />

      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
            Our <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Capturing moments of dedication, service, and community transformation.
          </p>
        </motion.div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className={`w-full bg-primary/5 rounded-3xl ${i % 2 === 0 ? 'h-64' : 'h-96'}`} />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className="relative overflow-hidden rounded-3xl cursor-pointer group break-inside-avoid"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].alt}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
                
                {/* Controls */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default GalleryPage;
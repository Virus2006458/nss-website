// Triggering deployment retry
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Globe2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CircularGallery from '@/components/CircularGallery.jsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient.js';

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const [joinConfig, setJoinConfig] = useState({ use_external_link: false, external_link: '' });
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          // Assuming 'created' or 'created_at' exists; let's not order by it just in case to avoid column not found error.
          // GalleryManagement uses .order('created', { ascending: false });
          .order('created', { ascending: false });

        if (data && !error && data.length > 0) {
          setGalleryItems(
            data.map(img => ({
              image: img.image_url,
              text: img.title || 'NSS SRM'
            }))
          );
        } else {
          // Fallback if gallery is empty in DB
          setGalleryItems([
            { image: 'https://images.unsplash.com/photo-1593113514676-5fa336829739', text: 'Clean Drive' },
            { image: 'https://images.unsplash.com/photo-1616680214084-22670de1bc82', text: 'Plantation' },
            { image: 'https://images.unsplash.com/photo-1542838132-92c53300491e', text: 'Food Relief' },
            { image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b', text: 'Rural Camp' },
            { image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8', text: 'Awareness' },
            { image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', text: 'Donation' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'join_button_config')
          .single();

        if (data && !error) {
          setJoinConfig({
            use_external_link: data.use_external_link || false,
            external_link: data.external_link || ''
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 15 } }
  };

  const features = [
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Engaging in meaningful projects that create lasting, sustainable change in local communities.'
    },
    {
      icon: Users,
      title: 'Youth Empowerment',
      description: 'Developing leadership, empathy, and organizational skills among student volunteers.'
    },
    {
      icon: Globe2,
      title: 'Social Awareness',
      description: 'Organizing campaigns and drives to educate and address critical societal challenges.'
    },
    {
      icon: Shield,
      title: 'Civic Responsibility',
      description: 'Fostering a strong sense of duty and national integration through selfless service.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>NSS SRM RMP - National Service Scheme</title>
        <meta name="description" content="Join NSS SRM RMP in creating positive change through community service and youth empowerment." />
      </Helmet>

      <Header />

      {/* Immersive Hero Section */}
      <section className="hero-section min-h-[100dvh] flex flex-col justify-center py-24">
        {/* Content */}
        <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariant}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8 shadow-sm hover:border-primary/50 transition-all duration-500 group cursor-default"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-primary tracking-wide uppercase">Not Me But You</span>
            </motion.div>

            <motion.h1 variants={itemVariant} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-8 tracking-tighter leading-[1.1] uppercase">
              <span className="whitespace-nowrap">VOLUNTEER WITH US</span><br />
              <span className="text-gradient">MAKE A DIFFERENCE</span>
            </motion.h1>

            <motion.p variants={itemVariant} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              We invite all interested Students to join the NSS Cell as Volunteers. Join us and be a part of social service and community development!</motion.p>

            <motion.div variants={itemVariant} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" disabled={isConfigLoading} className="rounded-full bg-primary text-white hover:bg-primary/90 text-lg px-10 py-7 h-auto group transition-all duration-300 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed">
                {isConfigLoading ? (
                  <span>
                    Loading...
                  </span>
                ) : joinConfig.use_external_link && joinConfig.external_link ? (
                  <a href={joinConfig.external_link} target="_blank" rel="noopener noreferrer">
                    Join Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <Link to="/contact">
                    Join Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/20 bg-primary/5 backdrop-blur-md hover:bg-primary/10 text-primary text-lg px-10 py-7 h-auto transition-all duration-300 hover:scale-105 active:scale-95">
                <Link to="/about">Discover Our Mission</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* Impact Stats */}
      <section className="relative z-20 -mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass-panel rounded-3xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { label: 'Active Volunteers', value: '150+' },
              { label: 'Service Hours', value: '12k+' },
              { label: 'Communities Served', value: '25+' }
            ].map((stat, i) => (
              <div key={i} className="pt-6 md:pt-0 md:px-8 text-center first:pt-0 first:md:pl-0 last:md:pr-0">
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-primary uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Core Focus Areas (Zig-zag Layout) */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Our Core Focus</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Driven by purpose, guided by compassion. We channel our energy into areas where we can make the most significant impact.
            </p>
          </div>

          <div className="space-y-32">
            {[
              {
                title: "Environmental Conservation",
                desc: "Our volunteers actively participate in initiatives like the Adayar Cleaning Drive and tree plantation projects to restore and protect our local ecosystems.",
                img: "/adayar_drive.jpg",
                color: "from-emerald-500 to-teal-400",
                icon: Globe2
              },
              {
                title: "Health & Wellbeing",
                desc: "Organizing blood donation camps, rural health checkups, and sanitation awareness programs to build healthier communities.",
                img: "/blood.jpeg",
                color: "from-rose-500 to-orange-400",
                icon: Heart
              },
              {
                title: "Rural Development",
                desc: "Empowering rural communities through literacy drives, infrastructure support, and sustainable development programs in adopted villages.",
                img: "/village.jpg",
                color: "from-amber-500 to-orange-600",
                icon: Users
              }
            ].map((feature, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`relative ${i % 2 !== 0 ? 'lg:order-last' : ''}`}
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                    <img src={feature.img} alt={feature.title} className="w-full h-full object-cover" />
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute -bottom-6 ${i % 2 === 0 ? '-right-6' : '-left-6'} w-48 h-48 bg-primary/5 backdrop-blur-3xl rounded-3xl border border-primary/10 -z-10`} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-xl"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-6 p-[1px]`}>
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">{feature.desc}</p>
                  <Button asChild variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-semibold text-lg group">
                    <Link to="/about">
                      Learn more
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Gallery Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Glimpses of NSS</h2>
          <p className="text-lg text-muted-foreground">Interactive gallery of our recent community activities and campaigns.</p>
        </div>
        <div style={{ height: '600px', position: 'relative' }}>
          {galleryItems ? (
            <CircularGallery
              bend={3}
              textColor="#003366"
              borderRadius={0.05}
              scrollEase={0.05}
              items={galleryItems}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-medium animate-pulse">Loading interactive gallery...</span>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Cleanliness', 'Donations', 'Teaching', 'Welfare', 'Awareness'];

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: records, error } = await supabase.from('activities').select('*').order('created', { ascending: false });
        if (error && error.code !== '42P01') throw error;
        setActivities(records || []);
      } catch (error) {
        if (error.code !== '42P01') console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeTab === 'All') return activities;
    return activities.filter(act => act.category === activeTab);
  }, [activities, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Activities - NSS SRM RMP</title>
      </Helmet>

      <Header />

      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
            Our <span className="text-gradient">Activities</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Making a real impact through continuous community service.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
          <div className="flex flex-wrap justify-center gap-2 bg-primary/5 border border-primary/10 p-1.5 rounded-full backdrop-blur-md">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-primary/5 border border-primary/10 p-1 rounded-lg backdrop-blur-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`rounded-md w-10 h-10 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={`rounded-md w-10 h-10 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-primary/5 overflow-hidden h-[400px]">
                <Skeleton className="w-full h-[220px] bg-primary/10" />
                <div className="p-6 space-y-4">
                  <Skeleton className="w-3/4 h-6 bg-primary/10" />
                  <Skeleton className="w-full h-4 bg-primary/10" />
                  <Skeleton className="w-5/6 h-4 bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-primary/10">
            <h3 className="text-2xl font-bold text-foreground mb-2">No Activities Found</h3>
            <p className="text-muted-foreground">There are no activities matching this category yet.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}
          >
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((act, index) => (
                <motion.div
                  key={act.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={`glass-panel rounded-2xl overflow-hidden border border-primary/5 hover:border-primary/30 hover:shadow-lg transition-all duration-500 group flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}
                >
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'sm:w-2/5 shrink-0' : 'w-full aspect-[4/3]'}`}>
                    <img
                      src={act.image_url}
                      alt={act.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{act.category}</span>
                    </div>
                  </div>

                  <div className={`p-6 flex flex-col justify-center ${viewMode === 'list' ? 'sm:w-3/5' : ''}`}>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {act.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ActivitiesPage;

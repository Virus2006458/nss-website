import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Calendar } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EventCard from '@/components/EventCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: records, error } = await supabase.from('events').select('*').order('date', { ascending: false });
        setEvents(records || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Events - NSS SRM RMP</title>
        <meta name="description" content="Discover upcoming and past community service events." />
      </Helmet>

      <Header />

      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Our <span className="text-gradient">Events</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Explore our initiatives and join us in making a tangible difference in the community.
          </p>
          
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 bg-primary/5 border border-primary/10 p-1.5 rounded-full backdrop-blur-md">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'upcoming' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === 'past' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                Completed Events
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 glass-panel rounded-xl p-3 h-[320px]">
                <Skeleton className="w-full h-[120px] rounded-lg bg-primary/5 shrink-0" />
                <Skeleton className="h-5 w-3/4 bg-primary/5 mt-1" />
                <Skeleton className="h-3 w-full bg-primary/5" />
                <Skeleton className="h-3 w-5/6 bg-primary/5" />
                <div className="mt-auto space-y-2">
                  <Skeleton className="h-3 w-1/2 bg-primary/5" />
                  <Skeleton className="h-3 w-1/3 bg-primary/5" />
                </div>
                <Skeleton className="h-9 w-full rounded-md bg-primary/5 mt-1" />
              </div>
            ))}
          </div>
        ) : events.filter(e => e.eventType === activeTab).length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl border border-primary/10">
            <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No {activeTab === 'upcoming' ? 'Upcoming' : 'Completed'} Events Found</h3>
            <p className="text-muted-foreground">Check back soon for new opportunities to serve.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.filter(e => e.eventType === activeTab).map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </motion.div>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default EventsPage;
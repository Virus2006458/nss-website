import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'Senate Members',
  'Heads',
  'Leads',
  'Student Co-ordinator'
];

const ROLE_PRIORITY = {
  'Office Bearer': 1,
  'Group Captain': 2,
  'President': 3,
  'Vice President': 4,
  'President-Elect': 5,
  'Student Co-ordinator': 6,
  'Secretary': 7,
  'Joint Secretary': 8,
  'Treasurer': 9,
  'Deputy Treasurer': 10,
  'General admin': 11,
};

const getRolePriority = (role) => {
  return ROLE_PRIORITY[role] || 100;
};

const getInitials = (name) => {
  if (!name) return 'NSS';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Senate Members');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data: records, error } = await supabase.from('team_members').select('*').order('created', { ascending: true });
        setTeamMembers(records || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    let filtered = [];
    if (activeTab === 'Senate Members') {
      const senateRoles = [
        'President', 'Vice President', 'Secretary', 'Joint Secretary', 
        'Treasurer', 'Deputy Treasurer', 'General admin', 'Office Bearer',
        'Group Captain', 'President-Elect'
      ];
      filtered = teamMembers.filter(m => senateRoles.includes(m.role));
    } else if (activeTab === 'Heads') {
      filtered = teamMembers.filter(m => m.role?.toLowerCase().includes('head'));
    } else if (activeTab === 'Leads') {
      filtered = teamMembers.filter(m => m.role?.toLowerCase().includes('lead'));
    } else {
      filtered = teamMembers.filter(m => m.role?.toLowerCase() === activeTab.toLowerCase());
    }

    return [...filtered].sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role));
  }, [teamMembers, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Our Team - NSS SRM RMP</title>
      </Helmet>

      <Header />

      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
            Meet the <span className="text-gradient">Team</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The dedicated individuals leading our mission and inspiring positive change.
          </p>
        </motion.div>

        {/* Pill-shaped Tabs */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap justify-center gap-2 bg-primary/5 border border-primary/10 p-1.5 rounded-full backdrop-blur-md max-w-4xl">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === cat 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {activeTab === cat && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(0,163,255,0.4)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full bg-primary/5 mb-6" />
                <Skeleton className="h-6 w-3/4 bg-primary/5 mb-3" />
                <Skeleton className="h-4 w-1/2 bg-primary/5" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl max-w-3xl mx-auto border border-primary/10">
            <h3 className="text-2xl font-bold text-foreground mb-2">No members found</h3>
            <p className="text-muted-foreground">There are currently no members listed under {activeTab}.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Top Leadership Section */}
            {activeTab === 'Senate Members' && (
              <div className="space-y-8">
                {/* 1. Office Bearer (Centered at the very top) */}
                <div className="flex justify-center">
                  <AnimatePresence mode="popLayout">
                    {filteredMembers
                      .filter(m => m.role === 'Office Bearer')
                      .map((member) => (
                        <motion.div
                          key={member.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel rounded-[2.5rem] p-6 md:p-10 border-2 border-primary/10 relative overflow-hidden group shadow-xl max-w-3xl w-full"
                        >
                          <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary tracking-[0.2em] uppercase z-20">
                            EST. {member.tag || '2025'}
                          </div>
                          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
                            <div className="w-full md:w-2/5 aspect-square rounded-[2rem] overflow-hidden border-4 border-primary/20 shadow-xl relative z-10">
                              <img src={member.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=000&color=fff`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={member.name} />
                            </div>
                            <div className="w-full md:w-3/5 text-center md:text-left space-y-4">
                              <div className="space-y-0">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Meet our</p>
                                <h4 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight leading-tight">{member.role}</h4>
                              </div>
                              <div className="inline-block px-5 py-2 rounded-xl bg-primary text-white font-black text-lg tracking-wider border-b-4 border-blue-700 shadow-lg transform -rotate-1">{member.name}</div>
                              <p className="text-muted-foreground leading-relaxed text-base font-medium italic">"{member.bio || `Leading with vision and dedication.`}"</p>
                            </div>
                          </div>
                          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>

                {/* 2. Other Top Hierarchy Roles (Side by Side) */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredMembers
                      .filter(m => ['Group Captain', 'President', 'Vice President', 'President-Elect'].includes(m.role))
                      .sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role))
                      .map((member) => (
                        <motion.div
                          key={member.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel rounded-[2.5rem] p-8 md:p-12 border-2 border-primary/10 relative overflow-hidden group shadow-xl"
                        >
                          <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary tracking-[0.2em] uppercase z-20">
                            EST. {member.tag || '2025'}
                          </div>
                          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
                            <div className="w-full md:w-2/5 aspect-square rounded-[2rem] overflow-hidden border-4 border-primary/20 shadow-lg relative z-10">
                              <img src={member.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=000&color=fff`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={member.name} />
                            </div>
                            <div className="w-full md:w-3/5 text-center md:text-left space-y-4">
                              <div className="space-y-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Meet our</p>
                                <h4 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight leading-tight"><span className="text-primary underline underline-offset-4 decoration-2">{member.role}</span></h4>
                              </div>
                              <div className="inline-block px-4 py-1.5 rounded-lg bg-primary text-white font-bold text-sm tracking-wide border-b-2 border-blue-700 shadow">{member.name}</div>
                              <p className="text-muted-foreground leading-snug text-sm italic transition-all duration-500 line-clamp-3 group-hover:line-clamp-none">
                                "{member.bio || `Leading with vision and dedication.`}"
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Other Members Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredMembers
                  .filter(m => {
                    if (activeTab === 'Senate Members') {
                      return !['Office Bearer', 'Group Captain', 'President', 'Vice President', 'President-Elect'].includes(m.role);
                    }
                    return true;
                  })
                  .map((member, index) => {
                    return (
                      <motion.div
                        key={member.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-panel rounded-[2rem] p-8 border border-primary/5 flex flex-col items-center text-center transition-all duration-300 hover:border-primary/30 group hover:shadow-lg"
                      >
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/10 shadow-lg bg-primary/5 flex items-center justify-center">
                          {member.image_url ? (
                            <img 
                              src={member.image_url} 
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              alt={member.name}
                            />
                          ) : (
                            <span className="text-3xl font-extrabold text-primary tracking-wider">
                              {getInitials(member.name)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                        <div className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                          {member.role || activeTab}
                        </div>
                        {member.bio && (
                          <div className="mt-2 w-full">
                            <p className="text-xs text-muted-foreground italic leading-relaxed transition-all duration-500 line-clamp-2 group-hover:line-clamp-none">
                              "{member.bio}"
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default TeamPage;
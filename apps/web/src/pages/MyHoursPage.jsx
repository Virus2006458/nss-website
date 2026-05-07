import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Calendar, Award, Clock, Star } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient';
import LiveEventsTab from '@/components/dashboard/LiveEventsTab.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const MyHoursPage = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const totalHours = activities.reduce((sum, activity) => sum + Number(activity.hoursEarned || 0), 0);
  const targetHours = 120;
  const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentUser) return;
      try {
        const { data: records, error } = await supabase
          .from('volunteer_hours')
          .select('*')
          .eq('volunteerId', currentUser.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        setActivities(records || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredActivities(
        activities.filter((a) =>
          a.activityName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredActivities(activities);
    }
  }, [searchTerm, activities]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - NSS SRM RMP</title>
      </Helmet>

      <Header />

      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight flex items-center gap-4">
            Dashboard
            <span className="px-3 py-1 text-xs md:text-sm font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
              {currentUser?.role || 'Volunteer'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="text-primary font-semibold">{currentUser?.name || 'Volunteer'}</span>. Here's your impact summary.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Hours Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl p-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary animate-pulse opacity-30" style={{ animationDuration: '4s' }} />
            
            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-[calc(1.5rem-1px)] p-8 flex flex-col justify-between border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-primary">
                  Target: {targetHours}h
                </span>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Hours</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-extrabold text-foreground tracking-tighter">{totalHours}</span>
                  <span className="text-2xl text-muted-foreground font-medium">hrs</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-bold">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-primary/10 overflow-hidden border border-primary/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary relative"
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
              <Clock className="w-8 h-8 text-primary mb-4" />
              <div className="text-3xl font-bold text-foreground mb-1">{activities.length}</div>
              <div className="text-sm text-muted-foreground">Events Attended</div>
            </div>
            
            <div className="flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
              <Star className="w-8 h-8 text-primary mb-4" />
              <div className="text-3xl font-bold text-foreground mb-1">{currentUser?.rollNumber || '-'}</div>
              <div className="text-sm text-muted-foreground">Roll Number</div>
            </div>
          </motion.div>
        </div>

        {/* Activity Table Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs defaultValue="log" className="w-full">
            <TabsList className="bg-primary/5 border border-primary/10 p-1 rounded-2xl mb-8 inline-flex h-auto">
              <TabsTrigger 
                value="log" 
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white py-3 px-8 text-sm font-bold transition-all duration-300"
              >
                Impact Log
              </TabsTrigger>
              <TabsTrigger 
                value="live" 
                className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white py-3 px-8 text-sm font-bold transition-all duration-300 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Live Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="log" className="m-0 outline-none">
              <div className="glass-panel rounded-3xl overflow-hidden border border-primary/10">
          <div className="p-6 md:p-8 border-b border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-primary/5 border-primary/10 focus-visible:ring-primary focus-visible:border-primary text-foreground h-12 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-foreground mb-2">No activities found</p>
                <p className="text-muted-foreground">Start serving to see your impact here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary/[0.02]">
                    <TableRow className="border-primary/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium py-5 px-8">Date</TableHead>
                      <TableHead className="text-muted-foreground font-medium py-5">Activity Name</TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium py-5 px-8">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredActivities.map((activity, i) => (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={activity.id}
                          className="border-primary/5 hover:bg-primary/[0.02] transition-colors group"
                        >
                          <TableCell className="py-5 px-8 text-foreground/80 font-medium">
                            {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-5 text-foreground font-medium group-hover:text-primary transition-colors">
                            {activity.activityName}
                          </TableCell>
                          <TableCell className="py-5 px-8 text-right">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                              +{activity.hoursEarned}h
                            </span>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
              </div>
            </TabsContent>

            <TabsContent value="live" className="m-0 outline-none">
              <div className="glass-panel rounded-3xl overflow-hidden border border-primary/10">
                <div className="p-6 md:p-8 border-b border-primary/10">
                  <h2 className="text-2xl font-bold text-foreground">Live Attendance</h2>
                  <p className="text-muted-foreground mt-1">Check-in to ongoing events and record your service hours.</p>
                </div>
                <LiveEventsTab />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default MyHoursPage;
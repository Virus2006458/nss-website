import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext.jsx';
import EventsManagement from '@/components/admin/EventsManagement.jsx';
import GalleryManagement from '@/components/admin/GalleryManagement.jsx';
import ActivitiesManagement from '@/components/admin/ActivitiesManagement.jsx';
import VolunteerManagement from '@/components/admin/VolunteerManagement.jsx';
import TeamManagement from '@/components/admin/TeamManagement.jsx';
import ContactSubmissions from '@/components/admin/ContactSubmissions.jsx';
import QRScanner from '@/components/admin/QRScanner.jsx';
import LiveSessions from '@/components/admin/LiveSessions.jsx';
import SettingsManagement from '@/components/admin/SettingsManagement.jsx';
import { motion } from 'framer-motion';
import { QrCode, Activity, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { currentAdmin, adminLogout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>Admin Dashboard - NSS SRM RMP</title>
      </Helmet>

      {/* Admin Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Admin Console</h1>
              <p className="text-xs text-muted-foreground">{currentAdmin?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-primary/20 text-foreground hover:bg-primary/5">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="bg-primary/5 border border-primary/10 p-1 rounded-xl mb-8 inline-flex flex-wrap h-auto">
              <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Events</TabsTrigger>
              <TabsTrigger value="activities" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Activities</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Gallery</TabsTrigger>
              <TabsTrigger value="volunteers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Volunteers</TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Team</TabsTrigger>
              <TabsTrigger value="inbox" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2.5 px-6">Inbox</TabsTrigger>
              <TabsTrigger value="scanner" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white py-2.5 px-6 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Scanner
              </TabsTrigger>
              <TabsTrigger value="live-now" className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white py-2.5 px-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live Now
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2.5 px-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="events" className="m-0 outline-none"><EventsManagement /></TabsContent>
              <TabsContent value="activities" className="m-0 outline-none"><ActivitiesManagement /></TabsContent>
              <TabsContent value="gallery" className="m-0 outline-none"><GalleryManagement /></TabsContent>
              <TabsContent value="volunteers" className="m-0 outline-none"><VolunteerManagement /></TabsContent>
              <TabsContent value="team" className="m-0 outline-none"><TeamManagement /></TabsContent>
              <TabsContent value="inbox" className="m-0 outline-none"><ContactSubmissions /></TabsContent>
              <TabsContent value="scanner" className="m-0 outline-none"><QRScanner /></TabsContent>
              <TabsContent value="live-now" className="m-0 outline-none"><LiveSessions /></TabsContent>
              <TabsContent value="settings" className="m-0 outline-none"><SettingsManagement /></TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
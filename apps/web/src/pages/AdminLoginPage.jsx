import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await adminLogin(email, password);
      try { toast.success('Admin access granted'); } catch (err) {}
      navigate('/admin');
    } catch (error) {
      console.error(error);
      try { toast.error('Invalid admin credentials. Access denied.'); } catch (err) {}
      alert('Login Failed: ' + (error.message || 'Invalid admin credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <Helmet>
        <title>Admin Portal - NSS SRM RMP</title>
      </Helmet>

      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-glow)]">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground">Restricted access for NSS coordinators</p>
        </div>

        <div className="glass-panel rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-muted-foreground group-focus-within:text-primary transition-colors">Admin Email</Label>
              <Input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-primary/5 border-primary/10 text-foreground h-12 rounded-xl focus-visible:ring-primary"
                placeholder="admin@srm.edu.in"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
              <Input
                id="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-primary/5 border-primary/10 text-foreground h-12 rounded-xl focus-visible:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover-scale btn-glow border-0"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
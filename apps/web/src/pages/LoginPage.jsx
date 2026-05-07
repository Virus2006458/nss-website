import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(rollNumber);
      toast.success('Login successful');
      navigate('/my-hours');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid roll number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Volunteer Login - NSS SRM RMP</title>
        <meta
          name="description"
          content="Login to your NSS volunteer account to track your service hours and view your activities."
        />
      </Helmet>

      <Header />

      <section className="min-h-screen pt-32 pb-24 bg-gradient-to-br from-muted to-background flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-3 text-balance leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Volunteer Login
              </h1>
              <p className="text-muted-foreground">
                Access your volunteer dashboard and track your service hours
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    className="mt-2 text-foreground"
                    placeholder="Enter your roll number"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use your registered roll number to login
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-center text-muted-foreground">
                  Not registered yet?{' '}
                  <a href="/contact" className="text-primary hover:underline font-medium">
                    Join NSS
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LoginPage;
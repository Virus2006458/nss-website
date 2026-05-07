import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', contactNumber: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('contact_submissions').insert([formData]);
      if (error) throw error;
      
      setSubmitted(true);
      toast.success('Application submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit application: ' + (error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Join Us - NSS SRM RMP</title>
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
            Start Your <span className="text-gradient">Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to make an impact? Drop your details below and our coordinators will reach out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 relative"
          >
            {/* Animated background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 animate-pulse pointer-events-none" />

            <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    <div className="space-y-2 group">
                      <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                        Full Name
                      </Label>
                      <Input
                        id="name" name="name" type="text" required
                        value={formData.name} onChange={handleChange}
                        className="bg-primary/5 border-primary/10 text-foreground h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                        Email Address
                      </Label>
                      <Input
                        id="email" name="email" type="email" required
                        value={formData.email} onChange={handleChange}
                        className="bg-primary/5 border-primary/10 text-foreground h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="john@srm.edu.in"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <Label htmlFor="rollNumber" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                        Roll Number
                      </Label>
                      <Input
                        id="rollNumber" name="rollNumber" type="text" required
                        value={formData.rollNumber} onChange={handleChange}
                        className="bg-primary/5 border-primary/10 text-foreground h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="RA2111..."
                      />
                    </div>

                    <div className="space-y-2 group">
                      <Label htmlFor="contactNumber" className="text-sm font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                        Contact Number
                      </Label>
                      <Input
                        id="contactNumber" name="contactNumber" type="tel" required
                        value={formData.contactNumber} onChange={handleChange}
                        className="bg-primary/5 border-primary/10 text-foreground h-14 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Submit Application <Send className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-4">Application Received!</h3>
                    <p className="text-muted-foreground mb-8">
                      Thank you for your interest in joining NSS. We will review your application and contact you soon.
                    </p>
                    <Button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', rollNumber: '' }); }}
                      variant="outline"
                      className="border-primary/20 text-foreground hover:bg-primary/10"
                    >
                      Submit Another
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Have specific queries? Feel free to reach out to our coordinators directly.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 glass-panel rounded-2xl group hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Location</h3>
                  <p className="text-sm text-muted-foreground">SRM Institute Of Science and Technology, Ramapuram, Chennai, Tamil Nadu 600089</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 glass-panel rounded-2xl group hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">nsssrmistrmp@gmail.com</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
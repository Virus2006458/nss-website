import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJoinModal } from '@/contexts/JoinModalContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const JoinNSSModal = () => {
  const { isOpen, closeModal } = useJoinModal();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('volunteers').insert([{
        name: formData.name,
        rollNumber: formData.rollNumber,
        dob: formData.dob,
        totalHours: 0
      }]);

      if (error) throw error;

      toast.success('Successfully joined NSS!');

      // Auto-login
      await login(formData.rollNumber);

      // Close and redirect
      closeModal();
      setFormData({ name: '', rollNumber: '', dob: '' });
      navigate('/my-hours');
    } catch (error) {
      console.error('Error joining NSS:', error);
      toast.error('Failed to join. Roll number might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-primary/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Join NSS SRM RMP</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your details to create your volunteer account and start tracking your impact.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="join-name" className="text-foreground">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="join-name" name="name" required
              value={formData.name} onChange={handleChange}
              className="bg-primary/5 border-primary/10 text-foreground focus-visible:ring-primary"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-roll" className="text-foreground">Roll Number <span className="text-destructive">*</span></Label>
            <Input
              id="join-roll" name="rollNumber" required
              value={formData.rollNumber} onChange={handleChange}
              className="bg-primary/5 border-primary/10 text-foreground focus-visible:ring-primary"
              placeholder="RA2111..."
            />
            <p className="text-xs text-muted-foreground">This will be used to log in.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-dob" className="text-foreground">Date of Birth <span className="text-destructive">*</span></Label>
            <Input
              id="join-dob" name="dob" type="date" required
              value={formData.dob} onChange={handleChange}
              className="bg-primary/5 border-primary/10 text-foreground focus-visible:ring-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover-scale btn-glow border-0"
          >
            {loading ? 'Creating Account...' : (
              <span className="flex items-center gap-2">
                Join Now <Send className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinNSSModal;
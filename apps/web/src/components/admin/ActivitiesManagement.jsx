import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const CATEGORIES = ['Cleanliness', 'Donations', 'Teaching', 'Welfare', 'Awareness'];

const ActivitiesManagement = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Cleanliness'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchActivities = async () => {
    try {
      const { data: records, error } = await supabase.from('activities').select('*').order('created', { ascending: false });
      if (error && error.code !== '42P01') throw error; // Ignore table not found error initially
      setActivities(records || []);
    } catch (error) {
      if (error.code !== '42P01') {
        toast.error('Failed to fetch activities. Did you run the SQL?');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleOpenModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        title: activity.title,
        description: activity.description || '',
        category: activity.category || 'Cleanliness'
      });
    } else {
      setEditingActivity(null);
      setFormData({ title: '', description: '', category: 'Cleanliness' });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !editingActivity) return toast.error('Please select an image');
    
    setUploading(true);
    try {
      let imageUrl = editingActivity?.image_url || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `activities/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const activityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl
      };

      if (editingActivity) {
        const { error } = await supabase.from('activities').update(activityData).eq('id', editingActivity.id);
        if (error) throw error;
        toast.success('Activity updated successfully');
      } else {
        const { error } = await supabase.from('activities').insert([activityData]);
        if (error) throw error;
        toast.success('Activity created successfully');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save activity: ' + (error.message || 'Unknown error'));
      alert('Error: ' + (error.message || 'Make sure you ran the SQL command to create the table!'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await supabase.from('activities').delete().eq('id', id);
        toast.success('Activity deleted');
        fetchActivities();
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Activities Management</h2>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Activity
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl text-muted-foreground">
          No activities found. Ensure you have run the SQL script to create the table.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="glass-panel rounded-2xl overflow-hidden group border border-primary/5">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={act.image_url} 
                  alt={act.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-primary flex items-center gap-1 border border-primary/10">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  {act.category}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button variant="secondary" size="icon" onClick={() => handleOpenModal(act)} className="h-8 w-8 rounded-full bg-blue-500/80 text-white hover:bg-blue-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(act.id)} className="h-8 w-8 rounded-full bg-red-500/80 text-white hover:bg-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{act.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingActivity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title *</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Category *</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-primary/10 text-foreground">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description *</Label>
              <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" rows={4} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Image {editingActivity ? '(Optional)' : '*'}</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <Button type="submit" disabled={uploading} className="w-full bg-primary hover:bg-primary/90 text-white mt-4">
              {uploading ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivitiesManagement;

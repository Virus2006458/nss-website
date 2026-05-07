import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', eventType: 'upcoming', googleFormLink: '', isLive: false
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data: records, error } = await supabase.from('events').select('*').order('date', { ascending: false });
      setEvents(records || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date.split('T')[0],
        location: event.location || '',
        eventType: event.eventType || 'upcoming',
        googleFormLink: event.googleFormLink || '',
        isLive: event.isLive || false
      });
    } else {
      setEditingEvent(null);
      setFormData({ title: '', description: '', date: '', location: '', eventType: 'upcoming', googleFormLink: '', isLive: false });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = editingEvent?.image_url || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        eventType: formData.eventType,
        googleFormLink: formData.googleFormLink,
        image_url: imageUrl,
        isLive: formData.isLive
      };

      if (editingEvent) {
        const { error } = await supabase.from('events').update(eventData).eq('id', editingEvent.id);
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase.from('events').insert([eventData]);
        if (error) throw error;
        toast.success('Event created successfully');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save event: ' + (error.message || 'Unknown error'));
      alert('Error: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await supabase.from('events').delete().eq('id', id);
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleToggleLive = async (event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ isLive: !event.isLive })
        .eq('id', event.id);

      if (error) throw error;
      toast.success(`Event ${!event.isLive ? 'is now Live' : 'is no longer Live'}`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update live status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Events Management</h2>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/10">
              <TableHead className="text-foreground font-bold">Title</TableHead>
              <TableHead className="text-foreground font-bold">Date</TableHead>
              <TableHead className="text-foreground font-bold">Location</TableHead>
              <TableHead className="text-foreground font-bold">Status</TableHead>
              <TableHead className="text-foreground font-bold">Live</TableHead>
              <TableHead className="text-foreground font-bold">Link</TableHead>
              <TableHead className="text-right text-foreground font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No events found</TableCell></TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id} className="border-primary/5 hover:bg-primary/5">
                  <TableCell className="font-medium text-foreground">{event.title}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground">{event.location || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${event.eventType === 'upcoming' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {event.eventType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={event.isLive} 
                      onCheckedChange={() => handleToggleLive(event)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </TableCell>
                  <TableCell>
                    {event.googleFormLink ? (
                      <a 
                        href={event.googleFormLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" /> Form
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(event)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title *</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Date *</Label>
                <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Status</Label>
                <Select value={formData.eventType} onValueChange={v => setFormData({...formData, eventType: v})}>
                  <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-primary/10 text-foreground">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Location</Label>
              <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Google Form Link (Optional)</Label>
              <Input 
                type="url" 
                value={formData.googleFormLink} 
                onChange={e => setFormData({...formData, googleFormLink: e.target.value})} 
                className="bg-primary/5 border-primary/10 text-foreground" 
                placeholder="https://forms.gle/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Image (Optional)</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-foreground">Live Event</Label>
                <p className="text-xs text-muted-foreground">Make this event visible in the Live tab</p>
              </div>
              <Switch 
                checked={formData.isLive} 
                onCheckedChange={v => setFormData({...formData, isLive: v})} 
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
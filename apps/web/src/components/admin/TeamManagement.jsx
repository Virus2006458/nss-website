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

const TeamManagement = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', designation: '', bio: '', tag: '2025' });
  const [photoFile, setPhotoFile] = useState(null);

  const fetchTeam = async () => {
    try {
      const { data: records, error } = await supabase.from('team_members').select('*');
      if (error) throw error;
      
      const sortedTeam = (records || []).sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role));
      setTeam(sortedTeam);
    } catch (error) {
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({ name: member.name, designation: member.role, bio: member.bio || '', tag: member.tag || '2025' });
    } else {
      setEditingMember(null);
      setFormData({ name: '', designation: '', bio: '', tag: '2025' });
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = editingMember?.image_url || '';

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `team/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const memberData = {
        name: formData.name,
        role: formData.designation, // Map 'designation' to 'role' based on SQL schema
        bio: formData.bio,
        tag: formData.tag,
        image_url: imageUrl
      };

      if (editingMember) {
        const { error } = await supabase.from('team_members').update(memberData).eq('id', editingMember.id);
        if (error) throw error;
        toast.success('Team member updated');
      } else {
        const { error } = await supabase.from('team_members').insert([memberData]);
        if (error) throw error;
        toast.success('Team member added');
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save team member: ' + (error.message || 'Unknown error'));
      alert('Error: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this team member?')) {
      try {
        await supabase.from('team_members').delete().eq('id', id);
        toast.success('Member deleted');
        fetchTeam();
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading team...</div>
      ) : team.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl text-muted-foreground">No team members found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.id} className="glass-panel rounded-xl p-6 flex flex-col items-center text-center relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="secondary" size="icon" onClick={() => handleOpenModal(member)} className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/40">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(member.id)} className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary/30">
                <img 
                  src={member.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-bold mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground line-clamp-3 italic">{member.bio}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingMember ? 'Edit Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name *</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Role (Designation) *</Label>
              <Select value={formData.designation} onValueChange={v => setFormData({...formData, designation: v})}>
                <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent className="bg-white border-primary/10 text-foreground">
                  <SelectItem value="Student Co-ordinator">Student Co-ordinator</SelectItem>
                  <SelectItem value="President">President</SelectItem>
                  <SelectItem value="Vice President">Vice President</SelectItem>
                  <SelectItem value="Secretary">Secretary</SelectItem>
                  <SelectItem value="Joint Secretary">Joint Secretary</SelectItem>
                  <SelectItem value="Treasurer">Treasurer</SelectItem>
                  <SelectItem value="Deputy Treasurer">Deputy Treasurer</SelectItem>
                  <SelectItem value="General admin">General admin</SelectItem>
                  <SelectItem value="Logistics Head">Logistics Head</SelectItem>
                  <SelectItem value="Traffic Monitoring Head">Traffic Monitoring Head</SelectItem>
                  <SelectItem value="Media Head">Media Head</SelectItem>
                  <SelectItem value="Documentation Head">Documentation Head</SelectItem>
                  <SelectItem value="Photography Lead">Photography Lead</SelectItem>
                  <SelectItem value="Videography Lead">Videography Lead</SelectItem>
                  <SelectItem value="Design Lead">Design Lead</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="Office Bearer">Office Bearer</SelectItem>
                  <SelectItem value="Group Captain">Group Captain</SelectItem>
                  <SelectItem value="President-Elect">President-Elect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.designation === 'President' || formData.designation === 'Vice President') && (
              <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
                <Label className="text-primary font-bold">Signature Styling (Bio) *</Label>
                <Textarea 
                  required 
                  placeholder="Enter the leadership message/vision for the website..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  className="bg-primary/5 border-primary/10 text-foreground focus:border-primary" 
                  rows={3} 
                />
                <div className="space-y-2">
                  <Label className="text-primary font-bold">Established Year (EST.) *</Label>
                  <Input 
                    required 
                    placeholder="e.g. 2025"
                    value={formData.tag} 
                    onChange={e => setFormData({...formData, tag: e.target.value})} 
                    className="bg-primary/5 border-primary/10 text-foreground" 
                  />
                </div>
                <p className="text-[10px] text-primary/70 italic">This will be displayed as "EST. [Year]" on the premium spotlight section.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-foreground">Photo (Optional)</Label>
              <Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              {editingMember ? 'Update Member' : 'Add Member'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
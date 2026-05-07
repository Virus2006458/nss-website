import React, { useState, useEffect } from 'react';
import { Plus, Trash2, History, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVol, setEditingVol] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', rollNumber: '', dob: '', role: 'Volunteer' });
  
  // Forms
  const [volForm, setVolForm] = useState({ name: '', rollNumber: '', dob: '', role: 'Volunteer' });
  const [hoursForm, setHoursForm] = useState({ volunteerId: '', eventId: '', date: '', hoursEarned: '' });
  
  const fileInputRef = React.useRef(null);
  const [importing, setImporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volRes, eventsRes] = await Promise.all([
        supabase.from('volunteers').select('*').order('created', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: false })
      ]);
      
      setVolunteers(volRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('volunteers').insert([{
        name: volForm.name,
        rollNumber: volForm.rollNumber,
        dob: volForm.dob,
        role: volForm.role,
        totalHours: 0
      }]);
      if (error) throw error;
      
      toast.success('Volunteer added successfully');
      setVolForm({ name: '', rollNumber: '', dob: '', role: 'Volunteer' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to add volunteer');
    }
  };

  const handleEditClick = (vol) => {
    setEditingVol(vol);
    setEditForm({
      name: vol.name || '',
      rollNumber: vol.rollNumber || '',
      dob: vol.dob || '',
      role: vol.role || 'Volunteer'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateVolunteer = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({
          name: editForm.name,
          rollNumber: editForm.rollNumber,
          dob: editForm.dob,
          role: editForm.role
        })
        .eq('id', editingVol.id);

      if (error) throw error;
      
      toast.success('Volunteer updated successfully');
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to update volunteer');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (json.length === 0) {
        throw new Error('The excel sheet is empty');
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of json) {
        // Look for common column names
        const name = row['Name'] || row['name'] || row['Full Name'] || row['full name'] || row['Student Name'];
        const rollNumber = row['Roll Number'] || row['roll number'] || row['Roll No'] || row['Roll No.'] || row['rollno'] || row['Reg No'];
        const role = row['Role'] || row['role'] || row['Designation'] || 'Volunteer';
        
        // Handle dates properly if Excel converted them to numbers or formatted strings
        let dob = row['DOB'] || row['dob'] || row['Date of Birth'] || '';
        
        // If it's an Excel serial date number
        if (typeof dob === 'number') {
          const jsDate = new Date(Math.round((dob - 25569) * 86400 * 1000));
          dob = jsDate.toISOString().split('T')[0];
        }

        if (name && rollNumber) {
          const { error } = await supabase.from('volunteers').insert([{
            name: String(name).trim(),
            rollNumber: String(rollNumber).trim(),
            dob: dob ? String(dob).trim() : '2000-01-01', // fallback if empty
            role: String(role).trim(),
            totalHours: 0
          }]);
          
          if (error) {
            console.error('Error importing row:', row, error);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} volunteers!`);
        fetchData();
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} rows failed to import (missing name/roll no or duplicate).`);
      }
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to parse excel file: ' + (error.message || 'Unknown error'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddHours = async (e) => {
    e.preventDefault();
    if (!hoursForm.volunteerId || !hoursForm.eventId) {
      toast.error('Please select a volunteer and an event');
      return;
    }

    try {
      const event = events.find(ev => ev.id === hoursForm.eventId);
      const volunteer = volunteers.find(v => v.id === hoursForm.volunteerId);
      
      // 1. Create hours record
      const { error: hoursError } = await supabase.from('volunteer_hours').insert([{
        volunteerId: hoursForm.volunteerId,
        activityName: event.title,
        date: new Date(hoursForm.date).toISOString(),
        hoursEarned: parseFloat(hoursForm.hoursEarned),
        description: 'Attended: ' + event.title
      }]);
      if (hoursError) throw hoursError;

      // 2. Update total hours on volunteer
      const newTotal = (volunteer.totalHours || 0) + parseFloat(hoursForm.hoursEarned);
      await supabase.from('volunteers').update({ totalHours: newTotal }).eq('id', volunteer.id);

      toast.success('Hours updated successfully');
      setHoursForm({ volunteerId: '', eventId: '', date: '', hoursEarned: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to update hours');
    }
  };

  const handleViewHistory = async (vol) => {
    setSelectedVol(vol);
    try {
      const { data: records, error } = await supabase
        .from('volunteer_hours')
        .select('*')
        .eq('volunteerId', vol.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setHistory(records || []);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch history');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this volunteer? This will also delete their hours history.')) {
      try {
        await supabase.from('volunteers').delete().eq('id', id);
        toast.success('Volunteer deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete volunteer');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Volunteer Management</h2>
      </div>

      <Tabs defaultValue="add-volunteer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-primary/5 border border-primary/10 p-1 rounded-xl mb-6">
          <TabsTrigger value="add-volunteer" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground rounded-lg">
            Add & Manage Volunteers
          </TabsTrigger>
          <TabsTrigger value="update-hours" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground rounded-lg">
            Update Hours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-volunteer" className="space-y-6">
          {/* Add Volunteer Form */}
          <div className="glass-panel rounded-xl p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Register New Volunteer</h3>
              
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import Excel / CSV'}
                </Button>
              </div>
            </div>
            <form onSubmit={handleAddVolunteer} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-foreground">Full Name *</Label>
                <Input required value={volForm.name} onChange={e => setVolForm({...volForm, name: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Roll Number *</Label>
                <Input required value={volForm.rollNumber} onChange={e => setVolForm({...volForm, rollNumber: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" placeholder="e.g. RA2111..." />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Role *</Label>
                <Select value={volForm.role} onValueChange={v => setVolForm({...volForm, role: v})}>
                  <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-primary/10 text-foreground">
                    <SelectItem value="Logistics Head">Logistics Head</SelectItem>
                    <SelectItem value="Traffic Monitoring Head">Traffic Monitoring Head</SelectItem>
                    <SelectItem value="Media Head">Media Head</SelectItem>
                    <SelectItem value="Documentation Head">Documentation Head</SelectItem>
                    <SelectItem value="Photography Lead">Photography Lead</SelectItem>
                    <SelectItem value="Videography Lead">Videography Lead</SelectItem>
                    <SelectItem value="Design Lead">Design Lead</SelectItem>
                    <SelectItem value="President">President</SelectItem>
                    <SelectItem value="Vice President">Vice President</SelectItem>
                    <SelectItem value="Secretary">Secretary</SelectItem>
                    <SelectItem value="Joint Secretary">Joint Secretary</SelectItem>
                    <SelectItem value="Treasurer">Treasurer</SelectItem>
                    <SelectItem value="Deputy Treasurer">Deputy Treasurer</SelectItem>
                    <SelectItem value="General admin">General admin</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Date of Birth *</Label>
                <Input type="date" required value={volForm.dob} onChange={e => setVolForm({...volForm, dob: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white h-10">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </form>
          </div>

          {/* Volunteer List */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="border-primary/10">
                  <TableHead className="text-foreground font-bold">Name</TableHead>
                  <TableHead className="text-foreground font-bold">Roll Number</TableHead>
                  <TableHead className="text-foreground font-bold">Role</TableHead>
                  <TableHead className="text-foreground font-bold">DOB</TableHead>
                  <TableHead className="text-foreground font-bold">Total Hours</TableHead>
                  <TableHead className="text-right text-foreground font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : volunteers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No volunteers found</TableCell></TableRow>
                ) : (
                  volunteers.map((vol) => (
                    <TableRow key={vol.id} className="border-primary/5 hover:bg-primary/5">
                      <TableCell className="font-medium text-foreground">{vol.name || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{vol.rollNumber}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-primary/5 border border-primary/10 text-primary">
                          {vol.role || 'Volunteer'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{vol.dob || '-'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-bold">
                          {vol.totalHours || 0}h
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewHistory(vol)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(vol)} className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vol.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="update-hours">
          <div className="glass-panel rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-6">Record Event Attendance</h3>
            <form onSubmit={handleAddHours} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Select Volunteer *</Label>
                <Select value={hoursForm.volunteerId} onValueChange={v => setHoursForm({...hoursForm, volunteerId: v})}>
                  <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue placeholder="Choose a volunteer..." /></SelectTrigger>
                  <SelectContent className="bg-white border-primary/10 text-foreground max-h-60">
                    {volunteers.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name} ({v.rollNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Select Event *</Label>
                <Select value={hoursForm.eventId} onValueChange={v => {
                  const ev = events.find(e => e.id === v);
                  setHoursForm({...hoursForm, eventId: v, date: ev ? ev.date.split('T')[0] : ''});
                }}>
                  <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue placeholder="Choose an event..." /></SelectTrigger>
                  <SelectContent className="bg-white border-primary/10 text-foreground max-h-60">
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Date Attended *</Label>
                  <Input type="date" required value={hoursForm.date} onChange={e => setHoursForm({...hoursForm, date: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Hours Earned *</Label>
                  <Input type="number" step="0.5" min="0.5" required value={hoursForm.hoursEarned} onChange={e => setHoursForm({...hoursForm, hoursEarned: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" placeholder="e.g. 2.5" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
                <Plus className="w-5 h-5 mr-2" /> Add Hours to Profile
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* View History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground max-w-2xl">
          <DialogHeader><DialogTitle className="text-foreground">Activity History: {selectedVol?.name}</DialogTitle></DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No activities recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10">
                    <TableHead className="text-foreground font-bold">Date</TableHead>
                    <TableHead className="text-foreground font-bold">Activity</TableHead>
                    <TableHead className="text-right text-foreground font-bold">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h.id} className="border-primary/5">
                      <TableCell className="text-muted-foreground">{new Date(h.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-foreground">{h.activityName}</TableCell>
                      <TableCell className="text-right text-primary font-bold">+{h.hoursEarned}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Volunteer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Edit Volunteer: {editingVol?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateVolunteer} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Full Name *</Label>
              <Input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Roll Number *</Label>
              <Input required value={editForm.rollNumber} onChange={e => setEditForm({...editForm, rollNumber: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Role *</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm({...editForm, role: v})}>
                <SelectTrigger className="bg-primary/5 border-primary/10 text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-primary/10 text-foreground">
                  <SelectItem value="Logistics Head">Logistics Head</SelectItem>
                  <SelectItem value="Traffic Monitoring Head">Traffic Monitoring Head</SelectItem>
                  <SelectItem value="Media Head">Media Head</SelectItem>
                  <SelectItem value="Documentation Head">Documentation Head</SelectItem>
                  <SelectItem value="Photography Lead">Photography Lead</SelectItem>
                  <SelectItem value="Videography Lead">Videography Lead</SelectItem>
                  <SelectItem value="Design Lead">Design Lead</SelectItem>
                  <SelectItem value="President">President</SelectItem>
                  <SelectItem value="Vice President">Vice President</SelectItem>
                  <SelectItem value="Secretary">Secretary</SelectItem>
                  <SelectItem value="Joint Secretary">Joint Secretary</SelectItem>
                  <SelectItem value="Treasurer">Treasurer</SelectItem>
                  <SelectItem value="Deputy Treasurer">Deputy Treasurer</SelectItem>
                  <SelectItem value="General admin">General admin</SelectItem>
                  <SelectItem value="Volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Date of Birth *</Label>
              <Input type="date" required value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-12">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerManagement;
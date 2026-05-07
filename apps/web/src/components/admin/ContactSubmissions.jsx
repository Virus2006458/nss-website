import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created', { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Contact Submissions</h2>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/10">
              <TableHead className="text-foreground font-bold">Date</TableHead>
              <TableHead className="text-foreground font-bold">Name</TableHead>
              <TableHead className="text-foreground font-bold">Roll Number</TableHead>
              <TableHead className="text-foreground font-bold">Email</TableHead>
              <TableHead className="text-foreground font-bold">Contact Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : submissions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No submissions found</TableCell></TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow key={sub.id} className="border-primary/5 hover:bg-primary/5">
                  <TableCell className="text-muted-foreground">
                    {new Date(sub.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{sub.name}</TableCell>
                  <TableCell className="text-primary font-mono">{sub.rollNumber}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <a href={`mailto:${sub.email}`} className="hover:text-primary transition-colors">{sub.email}</a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <a href={`tel:${sub.contactNumber}`} className="hover:text-primary transition-colors">{sub.contactNumber || '-'}</a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContactSubmissions;

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const LiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          events:event_id (title),
          volunteers:student_id (name, rollNumber)
        `)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('LiveSessions Query Error:', error);
        throw error;
      }
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const calculateElapsed = (startTime) => {
    const diff = new Date() - new Date(startTime);
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Live Attendance Sessions</h2>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {sessions.length} Volunteers Live
        </Badge>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/10">
              <TableHead className="text-foreground font-bold">Volunteer</TableHead>
              <TableHead className="text-foreground font-bold">Event</TableHead>
              <TableHead className="text-foreground font-bold">Started At</TableHead>
              <TableHead className="text-foreground font-bold">Elapsed Hours</TableHead>
              <TableHead className="text-foreground font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No volunteers are currently recording hours.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id} className="border-primary/5 hover:bg-primary/5">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>{session.volunteers?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-muted-foreground">{session.volunteers?.rollNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {session.events?.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.start_time).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-primary font-bold">
                    {calculateElapsed(session.start_time)}h
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Live
                    </span>
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

export default LiveSessions;

import React, { useState, useEffect } from 'react';
import { Play, Square, QrCode, Clock, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('0.00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMs = now - start;
      const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
      setElapsed(diffHours);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-mono font-bold text-foreground">{elapsed}</span>
      <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Live Hours Accumulating</span>
    </div>
  );
};

const LiveEventsTab = () => {
  const { currentUser } = useAuth();
  const [liveEvents, setLiveEvents] = useState([]);
  const [attendance, setAttendance] = useState({}); // eventId -> attendance record
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // eventId being processed

  const fetchLiveEvents = async () => {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('isLive', true);

      if (error) throw error;
      setLiveEvents(events || []);

      if (currentUser) {
        const { data: logs, error: logsError } = await supabase
          .from('attendance_logs')
          .select('*')
          .eq('student_id', currentUser.id)
          .in('status', ['active', 'completed']);

        if (logsError) throw logsError;
        
        const attendanceMap = {};
        logs?.forEach(log => {
          attendanceMap[log.event_id] = log;
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching live events:', error);
      toast.error('Failed to load live events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEvents();
  }, [currentUser]);

  const handleStart = async (eventId) => {
    if (!currentUser) {
      console.error('No current user found');
      toast.error('You must be logged in to record attendance');
      return;
    }
    
    setProcessing(eventId);
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .insert([{
          student_id: currentUser.id,
          event_id: eventId,
          start_time: new Date().toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setAttendance(prev => ({ ...prev, [eventId]: data }));
      toast.success('Event session started!');
    } catch (error) {
      console.error('Start error:', error);
      toast.error('Failed to start session: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };

  const handleEnd = async (eventId) => {
    console.log('Stop Recording clicked for:', eventId);
    const log = attendance[eventId];
    if (!log) {
      console.error('No attendance log found for event:', eventId);
      toast.error('No active session found to stop');
      return;
    }

    setProcessing(eventId);
    try {
      const endTime = new Date();
      const startTime = new Date(log.start_time);
      const diffMs = endTime - startTime;
      const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);
      
      // Generate a unique QR code (just the logId for better scannability)
      const qrData = log.id;
      const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      console.log('Updating log:', log.id, 'with hours:', hours);
      const { data, error } = await supabase
        .from('attendance_logs')
        .update({
          end_time: endTime.toISOString(),
          hours: parseFloat(hours),
          qr_code: qrData,
          qr_expires_at: expiry,
          status: 'completed'
        })
        .eq('id', log.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);
      setAttendance(prev => ({ ...prev, [eventId]: data }));
      toast.success('Session ended. Show the QR code to Admin.');
    } catch (error) {
      console.error('End error:', error);
      window.alert('STOP RECORDING ERROR: ' + error.message);
      toast.error('Failed to end session: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(null);
    }
  };

  const handleRegenerateQR = async (eventId) => {
    const log = attendance[eventId];
    if (!log) return;

    setProcessing(eventId);
    try {
      const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const qrData = log.id;

      const { data, error } = await supabase
        .from('attendance_logs')
        .update({
          qr_code: qrData,
          qr_expires_at: expiry
        })
        .eq('id', log.id)
        .select()
        .single();

      if (error) throw error;
      
      setAttendance(prev => ({ ...prev, [eventId]: data }));
      toast.success('QR Code refreshed!');
    } catch (error) {
      toast.error('Failed to refresh QR');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-primary/5 animate-pulse rounded-2xl border border-primary/10" />
        ))}
      </div>
    );
  }

  if (liveEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-primary/40" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Live Events</h3>
        <p className="text-muted-foreground max-w-xs">There are no events currently marked as live by the admin. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {liveEvents.map((event) => {
        const log = attendance[event.id];
        const isStarted = log?.status === 'active';
        const isCompleted = log?.status === 'completed' || log?.status === 'verified';
        const isVerified = log?.status === 'verified';

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="bg-primary/5 border-primary/10 overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/30 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Live Now
                  </div>
                  {isVerified && (
                    <div className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded border border-green-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3 h-3" /> {event.location || 'NSS Campus'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {!isStarted && !isCompleted && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description || 'Join this live event to record your hours.'}
                  </p>
                )}

                {isStarted && (
                  <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 space-y-4">
                    <div className="flex items-center justify-between text-xs text-primary font-bold uppercase">
                      <span>Session Active</span>
                      <Clock className="w-4 h-4 animate-spin" />
                    </div>
                    <LiveTimer startTime={log.start_time} />
                    <p className="text-[10px] text-center text-muted-foreground">
                      Started at {new Date(log.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {isCompleted && !isVerified && (
                  <div className="flex flex-col items-center gap-4 bg-white/95 p-4 rounded-xl">
                    <QRCodeSVG 
                      value={log.qr_code} 
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="text-center">
                      <p className="text-xs font-bold text-black uppercase mb-1">Unique Check-out QR</p>
                      <p className="text-[10px] text-gray-500">Expires in 5 minutes</p>
                    </div>
                  </div>
                )}

                {isVerified && (
                  <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground">Attendance Verified!</p>
                    <p className="text-sm text-green-600 font-medium">+{log.hours} hours added to your log</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2">
                {!isStarted && !isCompleted && (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                    onClick={() => handleStart(event.id)}
                    disabled={processing === event.id}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Recording
                  </Button>
                )}

                {isStarted && (
                  <Button 
                    variant="destructive"
                    className="w-full font-bold h-12 rounded-xl"
                    onClick={() => handleEnd(event.id)}
                    disabled={processing === event.id}
                  >
                    <Square className="w-4 h-4 mr-2 fill-current" /> Stop Recording
                  </Button>
                )}

                {isCompleted && !isVerified && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Total Hours:</span>
                      <span className="font-bold text-foreground">{log.hours}h</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/20 text-foreground hover:bg-primary/5 h-12 rounded-xl"
                      onClick={() => handleRegenerateQR(event.id)}
                      disabled={processing === event.id}
                    >
                      <QrCode className="w-4 h-4 mr-2" /> Regenerate QR
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LiveEventsTab;

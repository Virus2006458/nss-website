import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      scanner.clear();
      handleVerify(decodedText);
    }

    function onScanError(err) {
      // console.warn(err);
    }

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  const handleVerify = async (decodedText) => {
    setLoading(true);
    setError(null);
    try {
      // The QR code now just contains the log ID
      const logId = decodedText.trim();

      // Fetch the log to verify it's still 'completed' and check expiry
      const { data: log, error: logError } = await supabase
        .from('attendance_logs')
        .select('*, events(title)')
        .eq('id', logId)
        .single();

      if (logError || !log) throw new Error('Attendance record not found');

      // Check expiry (5-minute limit)
      if (log.qr_expires_at && new Date() > new Date(log.qr_expires_at)) {
        throw new Error('QR Code has expired (5-minute limit exceeded)');
      }
      if (log.status === 'verified') {
        setScanResult({ ...log, alreadyVerified: true });
        setLoading(false);
        return;
      }

      // Update attendance log to 'verified'
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({ status: 'verified' })
        .eq('id', logId);

      if (updateError) throw updateError;

      // Add to volunteer_hours table
      const { error: hoursError } = await supabase
        .from('volunteer_hours')
        .insert([{
          volunteerId: log.student_id,
          date: new Date().toISOString(),
          activityName: log.events?.title || 'Live Event',
          hoursEarned: log.hours
        }]);

      if (hoursError) throw hoursError;

      setScanResult(log);
      toast.success('Attendance verified and hours added!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid QR code');
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    window.location.reload(); // Simplest way to re-init the scanner
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[500px]">
      <div className="w-full max-w-md bg-white border border-primary/10 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">QR Attendance Scanner</h2>
            <p className="text-xs text-muted-foreground">Scan student check-out QR codes</p>
          </div>
        </div>

        {!scanResult && !error && (
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-primary/5">
            <div id="reader" className="w-full"></div>
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Position the QR code within the frame</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Verifying Attendance...</p>
          </div>
        )}

        {scanResult && (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {scanResult.alreadyVerified ? 'Already Verified' : 'Success!'}
            </h3>
            <div className="bg-primary/5 rounded-2xl p-4 mb-8 border border-primary/10 text-left">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-3 tracking-wider">Session Details</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Event:</span>
                  <span className="text-foreground text-sm font-semibold">{scanResult.events?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Hours:</span>
                  <span className="text-primary text-sm font-bold">+{scanResult.hours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Status:</span>
                  <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={resetScanner} className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold">
              Scan Next Student
            </Button>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Scan Failed</h3>
            <p className="text-red-500 mb-8 font-medium">{error}</p>
            <Button onClick={resetScanner} variant="outline" className="w-full border-primary/20 text-foreground hover:bg-primary/5 h-12 rounded-xl">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;

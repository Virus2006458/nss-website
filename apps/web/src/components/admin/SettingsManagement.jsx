import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const SettingsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    use_external_link: false,
    external_link: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'join_button_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
      
      if (data) {
        setConfig({
          use_external_link: data.use_external_link || false,
          external_link: data.external_link || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings. Ensure the table exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newConfig) => {
    try {
      setSaving(true);
      const configToSave = newConfig || config;
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'join_button_config',
          use_external_link: configToSave.use_external_link,
          external_link: configToSave.external_link,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Check table permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked) => {
    const updatedConfig = { ...config, use_external_link: checked };
    setConfig(updatedConfig);
    handleSave(updatedConfig); // Auto-save on toggle
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Website Settings</h2>
      
      <div className="space-y-8">
        {/* Join Now Button Settings */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">"Join Now" Button Redirection</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Use External Form Link</Label>
              <p className="text-sm text-muted-foreground">
                Redirect users to a Google Form or external link instead of the built-in contact page.
              </p>
            </div>
            <Switch
              checked={config.use_external_link}
              onCheckedChange={handleToggle}
            />
          </div>

          {config.use_external_link && (
            <div className="pt-4 space-y-2">
              <Label>External Link URL (e.g., Google Form URL)</Label>
              <Input
                placeholder="https://docs.google.com/forms/..."
                value={config.external_link}
                onChange={(e) => setConfig({ ...config, external_link: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      const { data: records, error } = await supabase.from('gallery_images').select('*').order('created', { ascending: false });
      setImages(records || []);
    } catch (error) {
      toast.error('Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please select an image');
    
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      await supabase.from('gallery_images').insert([{
        image_url: publicUrl,
        title: description // The DB column is named 'title'
      }]);

      toast.success('Image uploaded successfully');
      setIsModalOpen(false);
      setDescription('');
      setImageFile(null);
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await supabase.from('gallery_images').delete().eq('id', id);
        toast.success('Image deleted');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gallery Management</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground font-medium">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden glass-panel aspect-square">
              <img 
                src={img.image_url} 
                alt={img.title || 'Gallery image'} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 backdrop-blur-[2px]">
                <div className="flex justify-end">
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(img.id)} className="h-8 w-8 rounded-full shadow-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {img.title && (
                  <p className="text-foreground bg-white/90 px-2 py-1 rounded text-xs font-bold line-clamp-2 shadow-sm">{img.title}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-primary/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upload New Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Image File *</Label>
              <Input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files[0])} className="bg-primary/5 border-primary/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description (Optional)</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-primary/5 border-primary/10 text-foreground" placeholder="Brief description..." />
            </div>
            <Button type="submit" disabled={uploading} className="w-full bg-primary hover:bg-primary/90 text-white">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryManagement;
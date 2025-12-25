import { useState } from 'react';
import { Shop } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Instagram, Facebook, MapPin, Link2, Loader2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SocialLinksEditorProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const SocialLinksEditor = ({ shop, isOpen, onClose, onUpdated }: SocialLinksEditorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instagram_url: shop.instagram_url || '',
    facebook_url: shop.facebook_url || '',
    google_maps_url: shop.google_maps_url || '',
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          instagram_url: formData.instagram_url || null,
          facebook_url: formData.facebook_url || null,
          google_maps_url: formData.google_maps_url || null,
        })
        .eq('id', shop.id);

      if (error) throw error;

      toast({ title: "Social links updated!" });
      onUpdated();
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Social Media Links
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Add your social media links so customers can find and follow you.
          </p>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              Instagram
            </Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/yourshop"
              value={formData.instagram_url}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
            />
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <Facebook className="h-4 w-4 text-white" />
              </div>
              Facebook
            </Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/yourshop"
              value={formData.facebook_url}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
            />
          </div>

          {/* Google Maps */}
          <div className="space-y-2">
            <Label htmlFor="maps" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              Google Maps
            </Label>
            <Input
              id="maps"
              placeholder="https://maps.google.com/..."
              value={formData.google_maps_url}
              onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Share your shop location so customers can find you easily
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Links
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksEditor;

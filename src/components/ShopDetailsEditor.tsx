import { useState } from 'react';
import { Shop } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import AITextHelper from '@/components/AITextHelper';
import { Settings, Loader2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShopDetailsEditorProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const ShopDetailsEditor = ({ shop, isOpen, onClose, onUpdated }: ShopDetailsEditorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: shop.name,
    whatsapp_number: shop.whatsapp_number,
    city: shop.city,
    area: shop.area,
    story: shop.story || '',
    established_year: shop.established_year?.toString() || '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.whatsapp_number || !formData.city || !formData.area) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name: formData.name,
          whatsapp_number: formData.whatsapp_number,
          city: formData.city,
          area: formData.area,
          story: formData.story || null,
          established_year: formData.established_year ? parseInt(formData.established_year) : null,
        })
        .eq('id', shop.id);

      if (error) throw error;

      toast({ title: "Shop details updated!" });
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
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Shop Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Shop Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-whatsapp">WhatsApp Number *</Label>
            <Input
              id="edit-whatsapp"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-city">City *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area">Area *</Label>
              <Input
                id="edit-area"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-established">Established Year</Label>
            <Input
              id="edit-established"
              type="number"
              placeholder="e.g., 1995"
              value={formData.established_year}
              onChange={(e) => setFormData(prev => ({ ...prev, established_year: e.target.value }))}
              min="1900"
              max={new Date().getFullYear()}
            />
            <p className="text-xs text-muted-foreground">
              Show customers how long you've been in business
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-story">About Your Shop</Label>
              <AITextHelper
                context="story"
                currentText={formData.story}
                shopName={shop.name}
                onTextGenerated={(text) => setFormData(prev => ({ ...prev, story: text }))}
              />
            </div>
            <Textarea
              id="edit-story"
              placeholder="Tell customers what makes your shop special..."
              value={formData.story}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
              rows={3}
            />
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
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShopDetailsEditor;

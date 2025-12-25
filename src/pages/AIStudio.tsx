import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorShop } from '@/hooks/useVendorShop';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, Camera, Sparkles, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AIStudio = () => {
  const navigate = useNavigate();
  const { shop, updateShop } = useVendorShop();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [bulletPoints, setBulletPoints] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'enhance' | 'result'>('upload');

  const usageRemaining = shop ? 10 - (shop.ai_usage_count || 0) : 0;
  const canUseAI = usageRemaining > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setStep('enhance');
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!uploadedImage || !shop || !canUseAI) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-studio', {
        body: {
          imageBase64: uploadedImage,
          bulletPoints: bulletPoints.trim() || undefined,
          shopId: shop.id,
        },
      });

      if (error) throw error;

      if (data.enhancedImage) {
        setEnhancedImage(data.enhancedImage);
      }
      if (data.description) {
        setGeneratedDescription(data.description);
      }

      setStep('result');
      toast({ title: "AI enhancement complete!" });
    } catch (err: any) {
      console.error('AI Studio error:', err);
      toast({
        title: "Enhancement failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setGeneratedDescription('');
    setBulletPoints('');
    setStep('upload');
  };

  const handleSaveToProduct = async () => {
    // This would save to a product - for now just show success
    toast({ title: "Saved!", description: "You can now use this in your products" });
  };

  if (!shop) {
    return (
      <MobileLayout>
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Please create a shop first</p>
          <Button onClick={() => navigate('/vendor')} className="mt-4">
            Create Shop
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/vendor')} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">
              AI Studio
            </h1>
            <p className="text-xs text-muted-foreground">
              {usageRemaining} enhancements remaining today
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {!canUseAI && (
          <div className="card-soft p-4 bg-amber-50 border-amber-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Daily limit reached</p>
                <p className="text-sm text-amber-700 mt-1">
                  You've used all 10 free AI enhancements today. Come back tomorrow!
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="card-soft p-6 bg-primary/5 border-primary/10 text-center">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display font-medium text-foreground mb-2">
                Transform Your Photos
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a product photo and get a clean, professional image with AI-generated descriptions.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!canUseAI}
              className="card-soft p-8 w-full border-2 border-dashed border-primary/30 hover:border-primary/50 transition-calm disabled:opacity-50"
            >
              <Camera className="h-12 w-12 text-primary/50 mx-auto mb-4" />
              <p className="font-medium text-foreground">Tap to upload photo</p>
              <p className="text-sm text-muted-foreground mt-1">or take a new one</p>
            </button>

            <div className="text-center text-sm text-muted-foreground">
              <p>📸 Best results with clear, well-lit photos</p>
              <p>🎯 Focus on single products</p>
            </div>
          </div>
        )}

        {step === 'enhance' && uploadedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="card-soft overflow-hidden">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Bullet Points Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Product Details (Optional)
              </label>
              <Textarea
                placeholder="Add bullet points about your product:&#10;• Brand name&#10;• Weight/Size&#10;• Key features"
                value={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                AI will use these to generate a factual description
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleEnhance} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhance
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            {/* Before/After Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Original</p>
                <div className="card-soft overflow-hidden">
                  <img 
                    src={uploadedImage!} 
                    alt="Original" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Enhanced</p>
                <div className="card-soft overflow-hidden border-2 border-primary/30">
                  <img 
                    src={enhancedImage || uploadedImage!} 
                    alt="Enhanced" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Generated Description */}
            {generatedDescription && (
              <div className="card-soft p-4">
                <h3 className="font-medium text-sm text-foreground mb-2">
                  AI-Generated Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generatedDescription}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another
              </Button>
              <Button onClick={handleSaveToProduct} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default AIStudio;

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shop } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle,
  Download,
  QrCode
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SharePortfolioProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

const SharePortfolio = ({ shop, isOpen, onClose }: SharePortfolioProps) => {
  const [copied, setCopied] = useState(false);
  
  const portfolioUrl = `${window.location.origin}/shop/${shop.id}`;
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Check out my shop "${shop.name}" on TrustLocal! 🏪\n\n${portfolioUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: `Check out ${shop.name} on TrustLocal!`,
          url: portfolioUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('portfolio-qr');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${shop.name.replace(/\s+/g, '-')}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            Share Your Shop
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <QRCodeSVG
                id="portfolio-qr"
                value={portfolioUrl}
                size={180}
                level="H"
                includeMargin={true}
                fgColor="#1a1a1a"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Scan this QR to view your shop
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
          </div>

          {/* Portfolio Link */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Portfolio Link
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground truncate">
                {portfolioUrl}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Share Via
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-12"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="h-5 w-5 mr-2 text-[#25D366]" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={handleNativeShare}
              >
                <Share2 className="h-5 w-5 mr-2" />
                More
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              💡 Share Tips
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Print QR on visiting cards</li>
              <li>• Display at your shop counter</li>
              <li>• Share on WhatsApp status</li>
              <li>• Add link to social media bio</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePortfolio;

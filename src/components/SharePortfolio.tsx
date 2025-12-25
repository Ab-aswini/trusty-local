import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shop } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Store,
  Star,
  Printer
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PrintableRatingCard from './PrintableRatingCard';

interface SharePortfolioProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

const SharePortfolio = ({ shop, isOpen, onClose }: SharePortfolioProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [showPrintCard, setShowPrintCard] = useState(false);
  
  const portfolioUrl = `${window.location.origin}/shop/${shop.id}`;
  const ratingUrl = `${window.location.origin}/qr/${shop.id}`;
  
  const currentUrl = activeTab === 'shop' ? portfolioUrl : ratingUrl;
  const qrId = activeTab === 'shop' ? 'portfolio-qr' : 'rating-qr';
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = activeTab === 'shop'
      ? encodeURIComponent(`Check out my shop "${shop.name}" on TrustLocal! 🏪\n\n${currentUrl}`)
      : encodeURIComponent(`I'd love your feedback! Rate your experience at "${shop.name}" 🌟\n\n${currentUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTab === 'shop' ? shop.name : `Rate ${shop.name}`,
          text: activeTab === 'shop' 
            ? `Check out ${shop.name} on TrustLocal!`
            : `Rate your experience at ${shop.name}`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(qrId);
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
      const suffix = activeTab === 'shop' ? 'Shop' : 'Rating';
      downloadLink.download = `${shop.name.replace(/\s+/g, '-')}-${suffix}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            Share & Get Ratings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shop" className="flex items-center gap-1.5">
              <Store className="h-4 w-4" />
              Shop QR
            </TabsTrigger>
            <TabsTrigger value="rating" className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              Rating QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-4 mt-4">
            {/* Shop QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG
                  id="portfolio-qr"
                  value={portfolioUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                  fgColor="#1a1a1a"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Scan to view your shop profile
              </p>
            </div>
          </TabsContent>

          <TabsContent value="rating" className="space-y-4 mt-4">
            {/* Rating QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl shadow-lg border-2 border-amber-200">
                <QRCodeSVG
                  id="rating-qr"
                  value={ratingUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                  fgColor="#b45309"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Customers scan this to rate their experience
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-2">
          {/* Download & Copy */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy Link
            </Button>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              More
            </Button>
          </div>

          {/* Tips based on active tab */}
          <div className="bg-primary/5 rounded-xl p-3">
            {activeTab === 'shop' ? (
              <>
                <p className="text-sm font-medium text-foreground mb-1.5">
                  💡 Shop QR Tips
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Print on visiting cards</li>
                  <li>• Add to social media bio</li>
                  <li>• Share in WhatsApp status</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground mb-1.5">
                  ⭐ Rating QR Tips
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Display at your billing counter</li>
                  <li>• Print on receipts or bills</li>
                  <li>• Ask happy customers to scan</li>
                  <li>• More ratings = more trust!</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setShowPrintCard(true)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Get Printable Card
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Printable Card Modal */}
      <PrintableRatingCard 
        shop={shop} 
        isOpen={showPrintCard} 
        onClose={() => setShowPrintCard(false)} 
      />
    </Dialog>
  );
};

export default SharePortfolio;

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shop } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Download, Star } from 'lucide-react';

interface PrintableRatingCardProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

const PrintableRatingCard = ({ shop, isOpen, onClose }: PrintableRatingCardProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const ratingUrl = `${window.location.origin}/qr/${shop.id}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shop.name} - Rating Card</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .card {
              width: 4in;
              padding: 0.5in;
              text-align: center;
              border: 2px dashed #e5e7eb;
              border-radius: 16px;
            }
            .header {
              margin-bottom: 0.3in;
            }
            .shop-name {
              font-size: 18px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 4px;
            }
            .tagline {
              font-size: 12px;
              color: #6b7280;
            }
            .qr-container {
              background: linear-gradient(135deg, #fef3c7, #fed7aa);
              padding: 0.25in;
              border-radius: 12px;
              display: inline-block;
              margin: 0.2in 0;
            }
            .stars {
              display: flex;
              justify-content: center;
              gap: 4px;
              margin: 0.15in 0;
            }
            .star {
              width: 20px;
              height: 20px;
              color: #f59e0b;
            }
            .cta {
              font-size: 14px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 11px;
              color: #6b7280;
            }
            .footer {
              margin-top: 0.2in;
              padding-top: 0.15in;
              border-top: 1px solid #e5e7eb;
            }
            .trust-badge {
              font-size: 10px;
              color: #059669;
              font-weight: 500;
            }
            @media print {
              body { background: white; }
              .card { border: 2px dashed #d1d5db; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="shop-name">${shop.name}</div>
              <div class="tagline">${shop.area}, ${shop.city}</div>
            </div>
            
            <div class="qr-container">
              ${document.getElementById('printable-qr')?.outerHTML || ''}
            </div>

            <div class="stars">
              <svg class="star" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <svg class="star" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>

            <div class="cta">Rate Your Experience!</div>
            <div class="subtitle">Scan the QR code above</div>

            <div class="footer">
              <div class="trust-badge">🛡️ Powered by TrustLocal</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadImage = () => {
    const svg = document.getElementById('printable-qr');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 1000);

      // Header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 36px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shop.name, 400, 80);

      ctx.fillStyle = '#6b7280';
      ctx.font = '20px -apple-system, sans-serif';
      ctx.fillText(`${shop.area}, ${shop.city}`, 400, 115);

      // QR background
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(200, 150, 400, 400, 20);
      ctx.fill();

      // QR code
      ctx.drawImage(img, 225, 175, 350, 350);

      // Stars
      ctx.fillStyle = '#f59e0b';
      ctx.font = '40px sans-serif';
      ctx.fillText('★ ★ ★ ★ ★', 400, 620);

      // CTA
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 28px -apple-system, sans-serif';
      ctx.fillText('Rate Your Experience!', 400, 700);

      ctx.fillStyle = '#6b7280';
      ctx.font = '18px -apple-system, sans-serif';
      ctx.fillText('Scan the QR code above', 400, 735);

      // Footer
      ctx.fillStyle = '#059669';
      ctx.font = '16px -apple-system, sans-serif';
      ctx.fillText('🛡️ Powered by TrustLocal', 400, 920);

      // Border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.roundRect(20, 20, 760, 960, 20);
      ctx.stroke();

      // Download
      const link = document.createElement('a');
      link.download = `${shop.name.replace(/\s+/g, '-')}-Rating-Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            Printable Rating Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview Card */}
          <div 
            ref={printRef}
            className="bg-white border-2 border-dashed border-border rounded-2xl p-6 text-center"
          >
            {/* Header */}
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">
                {shop.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {shop.area}, {shop.city}
              </p>
            </div>

            {/* QR Code */}
            <div className="inline-block bg-gradient-to-br from-amber-100 to-orange-100 p-4 rounded-xl mb-4">
              <QRCodeSVG
                id="printable-qr"
                value={ratingUrl}
                size={140}
                level="H"
                includeMargin={true}
                fgColor="#b45309"
              />
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* CTA */}
            <p className="font-semibold text-foreground mb-1">Rate Your Experience!</p>
            <p className="text-xs text-muted-foreground">Scan the QR code above</p>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-emerald-600 font-medium">
                🛡️ Powered by TrustLocal
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handlePrint} className="h-12">
              <Printer className="h-4 w-4 mr-2" />
              Print Card
            </Button>
            <Button variant="outline" onClick={handleDownloadImage} className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              📋 Printing Tips
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Print on thick paper or card stock</li>
              <li>• Use a laminator for durability</li>
              <li>• Place near billing counter or entrance</li>
              <li>• Include in product packaging</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintableRatingCard;

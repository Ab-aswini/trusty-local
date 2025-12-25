import { Shop } from '@/types/database';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VendorStatusBannerProps {
  shop: Shop;
}

const VendorStatusBanner = ({ shop }: VendorStatusBannerProps) => {
  const navigate = useNavigate();

  if (shop.vendor_status === 'approved') {
    return (
      <div className="card-soft p-4 bg-green-500/10 border-green-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Shop Approved!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your shop is live and visible to customers. Add products to start getting inquiries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (shop.vendor_status === 'pending') {
    return (
      <div className="card-soft p-4 bg-amber-500/10 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Pending Approval</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your shop is under review. This usually takes 24-48 hours. You can still add products while waiting.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-foreground">While you wait:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Add your products & services</li>
                <li>Upload a shop photo</li>
                <li>Complete your shop story</li>
                <li>Add social media links</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shop.vendor_status === 'rejected') {
    return (
      <div className="card-soft p-4 bg-destructive/10 border-destructive/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Application Rejected</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Unfortunately, your shop application was not approved. Please review the requirements and try again.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Common reasons for rejection:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Incomplete or invalid business information</li>
                <li>WhatsApp number not reachable</li>
                <li>Duplicate shop listing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shop.vendor_status === 'suspended') {
    return (
      <div className="card-soft p-4 bg-destructive/10 border-destructive/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Shop Suspended</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your shop has been temporarily suspended due to policy violations. Please contact support to resolve this.
            </p>
            {shop.warning_reason && (
              <p className="text-xs text-destructive mt-2">
                Reason: {shop.warning_reason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VendorStatusBanner;

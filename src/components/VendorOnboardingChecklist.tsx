import { CheckCircle2, Circle, Camera, Package, FileText, Link2, ChevronRight } from 'lucide-react';
import { Shop, Product } from '@/types/database';
import { cn } from '@/lib/utils';

interface VendorOnboardingChecklistProps {
  shop: Shop;
  products: Product[];
  onNavigateProducts: () => void;
  onOpenSocialLinks: () => void;
  onOpenDetails: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action: () => void;
}

export default function VendorOnboardingChecklist({
  shop,
  products,
  onNavigateProducts,
  onOpenSocialLinks,
  onOpenDetails,
}: VendorOnboardingChecklistProps) {
  const hasProfilePhoto = !!shop.image_url;
  const hasProducts = products.length > 0;
  const hasStory = !!shop.story && shop.story.trim().length > 0;
  const hasSocialLinks = !!(shop.instagram_url || shop.facebook_url || shop.google_maps_url);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'photo',
      label: 'Add shop photo',
      description: hasProfilePhoto ? 'Looking great!' : 'Help customers recognize you',
      completed: hasProfilePhoto,
      icon: <Camera className="h-4 w-4" />,
      action: () => {}, // Photo upload is inline, scroll to it
    },
    {
      id: 'products',
      label: 'Add products',
      description: hasProducts ? `${products.length} product${products.length > 1 ? 's' : ''} added` : 'Showcase what you sell',
      completed: hasProducts,
      icon: <Package className="h-4 w-4" />,
      action: onNavigateProducts,
    },
    {
      id: 'story',
      label: 'Write your story',
      description: hasStory ? 'Story added' : 'Tell customers about your shop',
      completed: hasStory,
      icon: <FileText className="h-4 w-4" />,
      action: onOpenDetails,
    },
    {
      id: 'social',
      label: 'Add social links',
      description: hasSocialLinks ? 'Links connected' : 'Connect Instagram, Facebook, Maps',
      completed: hasSocialLinks,
      icon: <Link2 className="h-4 w-4" />,
      action: onOpenSocialLinks,
    },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  if (isComplete) {
    return null; // Hide when all complete
  }

  return (
    <div className="card-soft p-4 bg-gradient-to-br from-primary/5 via-background to-background border-primary/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-medium text-foreground">Complete your profile</h3>
          <p className="text-xs text-muted-foreground">{completedCount} of {totalCount} done</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-primary">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.completed || item.id === 'photo'}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-calm text-left",
              item.completed 
                ? "bg-green-500/10" 
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <div className={cn(
              "flex-shrink-0",
              item.completed ? "text-green-500" : "text-muted-foreground"
            )}>
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              item.completed ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
            )}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                item.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            {!item.completed && item.id !== 'photo' && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

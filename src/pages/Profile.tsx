import { User, Settings, Store, LogOut, ChevronRight, Shield, Bell, HelpCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/MobileLayout';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout>
        <div className="px-4 py-8">
          <div className="card-soft p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-medium text-foreground mb-2">
              Welcome to TrustLocal
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to access your profile, saved shops, and more
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In / Sign Up
            </Button>
          </div>

          {/* Benefits */}
          <div className="mt-6 space-y-3">
            <div className="card-soft p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">For Business Owners</h3>
                <p className="text-xs text-muted-foreground">List your shop and reach local customers</p>
              </div>
            </div>
            <div className="card-soft p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Trust-Based Discovery</h3>
                <p className="text-xs text-muted-foreground">Find shops rated by real interactions</p>
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const menuItems = [
    { icon: Store, label: 'My Shop', description: 'Manage your business', to: '/vendor' },
    { icon: Bell, label: 'Notifications', description: 'Activity & updates', to: '/notifications' },
    { icon: Settings, label: 'Settings', description: 'Account preferences', to: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact', to: '/help' },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-display font-semibold text-primary">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg font-semibold text-foreground truncate">
                {user.email?.split('@')[0]}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-soft p-4 text-center">
            <p className="text-2xl font-display font-semibold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
          <div className="card-soft p-4 text-center">
            <p className="text-2xl font-display font-semibold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Ratings</p>
          </div>
          <div className="card-soft p-4 text-center">
            <p className="text-2xl font-display font-semibold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Visits</p>
          </div>
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <Link
            to="/admin"
            className="card-soft p-4 flex items-center gap-3 hover:shadow-elevated transition-calm mb-2 border-2 border-primary/20"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm text-foreground">Admin Dashboard</h3>
              <p className="text-xs text-muted-foreground">Manage vendors & reports</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </Link>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="card-soft p-4 flex items-center gap-3 hover:shadow-elevated transition-calm"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          TrustLocal v1.0.0
        </p>
      </main>
    </MobileLayout>
  );
};

export default Profile;

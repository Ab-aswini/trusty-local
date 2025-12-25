import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { useAdminReports } from '@/hooks/useAdminReports';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import MobileLayout from '@/components/MobileLayout';
import { 
  ArrowLeft, 
  Store, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Flag
} from 'lucide-react';
import { useState } from 'react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    vendors, 
    isLoading: vendorsLoading, 
    filter: vendorFilter, 
    setFilter: setVendorFilter,
    approveVendor,
    rejectVendor 
  } = useAdminVendors();
  const { 
    reports, 
    isLoading: reportsLoading, 
    filter: reportFilter, 
    setFilter: setReportFilter,
    resolveReport,
    dismissReport 
  } = useAdminReports();
  const { stats, isLoading: statsLoading } = useAdminStats();

  const [rejectReason, setRejectReason] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveAction, setResolveAction] = useState<'none' | 'warn' | 'suspend'>('none');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingVendorsCount = vendors.filter(v => v.vendor_status === 'pending').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <MobileLayout showNav={false}>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-semibold text-foreground">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-soft p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-display font-semibold text-foreground">
              {statsLoading ? '—' : stats.pendingVendors}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="card-soft p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-display font-semibold text-foreground">
              {statsLoading ? '—' : stats.approvedVendors}
            </p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="card-soft p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <Flag className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-display font-semibold text-foreground">
              {statsLoading ? '—' : stats.reportsThisWeek}
            </p>
            <p className="text-xs text-muted-foreground">Reports/wk</p>
          </div>
        </div>

        <Tabs defaultValue="vendors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="vendors" className="relative">
              Vendors
              {pendingVendorsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingVendorsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="relative">
              Reports
              {pendingReportsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingReportsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-medium text-foreground">
                Vendor Applications
              </h2>
              <Select value={vendorFilter} onValueChange={(v) => setVendorFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {vendorsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : vendors.length === 0 ? (
              <div className="empty-state">
                <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="empty-state-title">No vendor applications</p>
                <p className="empty-state-message">
                  {vendorFilter === 'pending' 
                    ? 'No pending applications to review' 
                    : `No ${vendorFilter} vendors found`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="card-soft p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                          {vendor.image_url ? (
                            <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{vendor.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{vendor.area}, {vendor.city}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        vendor.vendor_status === 'approved' ? 'default' :
                        vendor.vendor_status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {vendor.vendor_status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.whatsapp_number}</span>
                      </div>
                      {vendor.story && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5" />
                          <span className="line-clamp-2">{vendor.story}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Applied {new Date(vendor.created_at).toLocaleDateString()}</span>
                      </div>
                      {(vendor.gst_number || vendor.udyam_number) && (
                        <div className="flex gap-2 flex-wrap">
                          {vendor.gst_number && (
                            <Badge variant="outline" className="text-xs">GST: {vendor.gst_number}</Badge>
                          )}
                          {vendor.udyam_number && (
                            <Badge variant="outline" className="text-xs">Udyam: {vendor.udyam_number}</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {vendor.vendor_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveVendor(vendor.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="flex-1">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Vendor Application</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting {vendor.name}'s application.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="reject-reason">Reason (optional)</Label>
                              <Textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Incomplete documentation..."
                                className="mt-2"
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  rejectVendor(vendor.id, rejectReason);
                                  setRejectReason('');
                                }}
                              >
                                Reject Application
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-medium text-foreground">
                Shop Reports
              </h2>
              <Select value={reportFilter} onValueChange={(v) => setReportFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="empty-state-title">No reports</p>
                <p className="empty-state-message">
                  {reportFilter === 'pending' 
                    ? 'No pending reports to review' 
                    : `No ${reportFilter} reports found`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="card-soft p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {report.shop?.name || 'Unknown Shop'}
                        </h3>
                        {report.shop && (
                          <p className="text-xs text-muted-foreground">
                            {report.shop.area}, {report.shop.city}
                          </p>
                        )}
                      </div>
                      <Badge variant={
                        report.status === 'resolved' ? 'default' :
                        report.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {report.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm font-medium text-destructive">{report.reason}</p>
                        {report.details && (
                          <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      {report.admin_notes && (
                        <div className="p-2 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Admin notes:</span> {report.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex-1">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolve Report</DialogTitle>
                              <DialogDescription>
                                Take action on this report for {report.shop?.name || 'this shop'}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div>
                                <Label htmlFor="resolve-action">Action</Label>
                                <Select value={resolveAction} onValueChange={(v) => setResolveAction(v as any)}>
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No action</SelectItem>
                                    <SelectItem value="warn">Issue warning</SelectItem>
                                    <SelectItem value="suspend">Suspend shop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="resolve-notes">Admin Notes</Label>
                                <Textarea
                                  id="resolve-notes"
                                  value={resolveNotes}
                                  onChange={(e) => setResolveNotes(e.target.value)}
                                  placeholder="Document your findings..."
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => {
                                  resolveReport(report.id, resolveNotes, resolveAction);
                                  setResolveNotes('');
                                  setResolveAction('none');
                                }}
                              >
                                Resolve Report
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => dismissReport(report.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </MobileLayout>
  );
};

export default Admin;

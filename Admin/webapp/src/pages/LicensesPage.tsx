import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLicenses, getProducts, createLicense, cancelLicense, reactivateLicense, deleteLicense } from '@/lib/api';
import type { License, Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, FileText, Search, Key, RotateCcw, Ban, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateLicenseFormData {
  product_id: string;
  plan_type: 'monthly' | 'lifetime';
}

const initialFormData: CreateLicenseFormData = {
  product_id: '',
  plan_type: 'monthly',
};

export function LicensesPage() {
  const location = useLocation();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState<CreateLicenseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load with loading spinner
  const loadData = async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const [licensesData, productsData] = await Promise.all([
        getLicenses(),
        getProducts(),
      ]);
      setLicenses(Array.isArray(licensesData) ? licensesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setHasError(true);
      setLicenses([]);
      setProducts([]);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Silent refresh without loading spinner (used after mutations)
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [licensesData, productsData] = await Promise.all([
        getLicenses(),
        getProducts(),
      ]);
      setLicenses(Array.isArray(licensesData) ? licensesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open create modal if navigated from dashboard
  useEffect(() => {
    if (location.state?.openCreateModal && !isLoading) {
      setFormData(initialFormData);
      setIsDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoading]);

 const filteredLicenses = licenses.filter(
  (license) =>
    (license?.license_key || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (license?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (license?.product || '').toLowerCase().includes(searchQuery.toLowerCase())
);

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenCancel = (license: License) => {
    setSelectedLicense(license);
    setIsCancelDialogOpen(true);
  };

  const handleOpenReactivate = (license: License) => {
    setSelectedLicense(license);
    setIsReactivateDialogOpen(true);
  };

  const handleOpenDelete = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      toast.error('Please select a product');
      return;
    }

    setIsSubmitting(true);
    try {
    await createLicense({
  product_id: formData.product_id,
  plan_type: formData.plan_type,
});
      toast.success('License created successfully');
      setIsDialogOpen(false);
      // Reset form
      setFormData(initialFormData);
      // Refresh both licenses and products from API
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create license');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedLicense) return;

    try {
      await cancelLicense(selectedLicense.license_key);
      toast.success('License cancelled successfully');
      setIsCancelDialogOpen(false);
      setSelectedLicense(null);
      // Refresh data from API
      await refreshData();
    } catch (error) {
      toast.error('Failed to cancel license');
    }
  };

  const handleReactivate = async () => {
    if (!selectedLicense) return;

    try {
      await reactivateLicense(selectedLicense.license_key);
      toast.success('License reactivated successfully');
      setIsReactivateDialogOpen(false);
      setSelectedLicense(null);
      // Refresh data from API
      await refreshData();
    } catch (error) {
      toast.error('Failed to reactivate license');
    }
  };

  const handleDelete = async () => {
    if (!selectedLicense) return;

    try {
      await deleteLicense(selectedLicense.license_key);
      toast.success('License deleted permanently');
      setIsDeleteDialogOpen(false);
      setSelectedLicense(null);
      // Refresh data from API
      await refreshData();
    } catch (error) {
      toast.error('Failed to delete license');
    }
  };

  const getStatusBadge = (status: string) => {

  const styles: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    expired: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelling: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <Badge className={`${styles[status] || styles.active} capitalize`}>
      {status || 'unknown'}
    </Badge>
  );
};

  const getProductName = (productId: number) => {
    const product = products.find((p) => Number(p?.id) === Number(productId));
    return product?.name || '';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Failed to load data</p>
            <p className="text-red-400/70 text-sm">Could not fetch licenses from the server.</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Licenses</h2>
          <p className="text-slate-400 mt-1">Manage software licenses</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create License
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by license key, email or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              {isRefreshing && <Loader2 className="h-3 w-3 animate-spin" />}
              {filteredLicenses.length} license{filteredLicenses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Fetching data...</p>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No licenses found</h3>
              <p className="text-slate-500 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Create your first license'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
  <TableRow className="border-slate-800 hover:bg-transparent">
    <TableHead className="text-slate-400">License Key</TableHead>
    <TableHead className="text-slate-400">Email</TableHead>
    <TableHead className="text-slate-400">Product</TableHead>
    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
<TableHead className="text-slate-400">Renews</TableHead>
<TableHead className="text-slate-400">Cancels</TableHead>
<TableHead className="text-slate-400">Expires</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow key={license?.license_key || Math.random()} className="border-slate-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-slate-500" />
                          <code className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                            {license?.license_key || 'N/A'}
                          </code>
                        </div>
                      </TableCell>

                      <TableCell>
  <span className="text-slate-300 text-sm">
    {license?.email || 'N/A'}
  </span>
</TableCell>
                      <TableCell>
                        <span className="text-white text-sm">
                          {license?.product || getProductName(license?.product_id)}
                        </span>
                      </TableCell>
                      <TableCell>
  <Badge 
    variant="secondary" 
    className={`capitalize ${
      license?.plan_type === 'lifetime' 
        ? 'bg-purple-500/10 text-purple-400' 
        : 'bg-blue-500/10 text-blue-400'
    }`}
  >
    {license?.plan_type || 'monthly'}
  </Badge>
</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(license?.status || 'active')}
                          {license?.expires_at && isExpired(license.expires_at) && license?.status === 'active' && (
                            <Badge className="bg-yellow-500/10 text-yellow-400 text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
  <div className="flex items-center gap-2">
    <Calendar className="h-4 w-4 text-slate-500" />
    <span className="text-slate-300 text-sm">
      {formatDateTime(license?.created_at || '')}
    </span>
  </div>
</TableCell>

{/* Renews */}
<TableCell>
  <span className="text-slate-300 text-sm">
    {license?.next_renewal ? formatDate(license.next_renewal) : '-'}
  </span>
</TableCell>

{/* Cancels */}
<TableCell>
  <span className="text-orange-400 text-sm">
    {license?.cancel_at ? formatDate(license.cancel_at) : '-'}
  </span>
</TableCell>

{/* Expires */}
<TableCell>
  <span className={`text-sm ${license?.expires_at ? 'text-slate-300' : 'text-slate-500'}`}>
    {formatDate(license?.expires_at || null)}
  </span>
</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {license?.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => license && handleOpenCancel(license)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => license && handleOpenReactivate(license)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-950/50"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => license && handleOpenDelete(license)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create License Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create License</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new manual license for a customer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product" className="text-slate-300">
                  Product *
                </Label>
                <select
                  id="product"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product?.id || Math.random()} value={product?.id || ''}>
                      {product?.name || 'Unnamed Product'} - ${product?.price || '-'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-300">
                  License Type *
                </Label>
                <select
                  id="type"
                 value={formData.plan_type}
onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as 'monthly' | 'lifetime' })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="monthly">Monthly Subscription</option>
                  <option value="lifetime">Lifetime License</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create License
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel License</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to cancel license "{selectedLicense?.license_key}"? 
              This will revoke access for the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation */}
      <AlertDialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate License</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to reactivate license "{selectedLicense?.license_key}"?
              This will restore access for the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Reactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete License</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete license "{selectedLicense?.license_key}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

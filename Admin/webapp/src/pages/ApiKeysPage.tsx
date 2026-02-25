import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getApiKeys, getProducts, createApiKey, deleteApiKey } from '@/lib/api';
import type { ApiKeyResponse, Product } from '@/types/api';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Key, Copy, Check, Eye, EyeOff, Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ApiKeysPage() {
  const location = useLocation();
  const [apiKeys, setApiKeys] = useState<ApiKeyResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load with loading spinner
  const loadData = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const [keysData, productsData] = await Promise.all([
        getApiKeys(),
        getProducts(),
      ]);
      // Filter only enabled keys (enabled === 1)
      const enabledKeys = Array.isArray(keysData) ? keysData.filter((k: ApiKeyResponse) => k.enabled === 1) : [];
      setApiKeys(enabledKeys);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setHasError(true);
      setApiKeys([]);
      setProducts([]);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Silent refresh without loading spinner (used after mutations)
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [keysData, productsData] = await Promise.all([
        getApiKeys(),
        getProducts(),
      ]);
      // Filter only enabled keys (enabled === 1)
      const enabledKeys = Array.isArray(keysData) ? keysData.filter((k: ApiKeyResponse) => k.enabled === 1) : [];
      setApiKeys(enabledKeys);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-open generate modal if navigated from dashboard
  useEffect(() => {
    if (location.state?.openGenerateModal && !isLoading) {
      setSelectedProductId('');
      setNewlyCreatedKey(null);
      setIsCreateDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoading]);

  const handleOpenCreate = () => {
    setSelectedProductId('');
    setNewlyCreatedKey(null);
    setIsCreateDialogOpen(true);
  };

  const handleCreateKey = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    setIsSubmitting(true);
    try {
      const newKey = await createApiKey({ product_id: selectedProductId });
      setNewlyCreatedKey(newKey?.api_key || null);
      // Refresh both API keys and products from API
      await refreshData();
      toast.success('API key created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = async (api_key: string) => {
    if (!api_key) return;
    setDeletingKey(api_key);
    try {
      await deleteApiKey(api_key);
      toast.success('API key deleted');
      // Refresh data from API instead of manual filter
      await refreshData();
    } catch (err) {
      toast.error('Failed to delete API key');
    } finally {
      setDeletingKey(null);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const toggleShowKey = (key: string) => {
    if (!key) return;
    setShowKeyMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 16) return '•'.repeat(key.length);
    return key.slice(0, 8) + '•'.repeat(key.length - 16) + key.slice(-8);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductName = (productId: number) => {
    const product = products.find((p) => p?.id === String(productId));
    return product?.name || '';
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Failed to load data</p>
            <p className="text-red-400/70 text-sm">Could not fetch API keys from the server.</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Keys</h2>
          <p className="text-slate-400 mt-1">Manage indicator authentication keys</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate API Key
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="text-slate-400 text-sm flex items-center gap-2">
            {isRefreshing && <Loader2 className="h-3 w-3 animate-spin" />}
            {apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Fetching data...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No API keys yet</h3>
              <p className="text-slate-500 mt-1">Generate your first API key to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Key</TableHead>
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey?.api_key || Math.random()} className="border-slate-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {showKeyMap[apiKey?.api_key] ? apiKey?.api_key : maskKey(apiKey?.api_key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-white"
                            onClick={() => toggleShowKey(apiKey?.api_key)}
                          >
                            {showKeyMap[apiKey?.api_key] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-white"
                            onClick={() => copyToClipboard(apiKey?.api_key, apiKey?.api_key)}
                          >
                            {copiedKeyId === apiKey?.api_key ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white text-sm">
                          {getProductName(apiKey?.product_id)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(apiKey?.created_at || '')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteKey(apiKey?.api_key)}
                          disabled={deletingKey === apiKey?.api_key}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        >
                          {deletingKey === apiKey?.api_key ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog - Product Selection */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a product to generate an API key for
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-slate-300">
                Product *
              </Label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product?.id || Math.random()} value={product?.id || ''}>
                    {product?.name || 'Unnamed Product'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!selectedProductId) {
                  toast.error('Please select a product');
                  return;
                }
                setIsCreateDialogOpen(false);
                setIsGenerateDialogOpen(true);
                handleCreateKey();
              }}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Key Display Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription className="text-slate-400">
              Copy this key now. You will not be able to see it again.
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4 py-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm font-medium mb-3">
                  Your new API key:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-white bg-slate-950 px-3 py-3 rounded break-all">
                    {newlyCreatedKey}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 flex-shrink-0 h-10 w-10"
                  >
                    {copiedKeyId === 'new' ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsGenerateDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

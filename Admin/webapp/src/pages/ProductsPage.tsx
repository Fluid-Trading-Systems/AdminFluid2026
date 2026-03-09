import { useState, useEffect, useRef } from 'react';
import {
  getProducts,
  deleteProduct,
  uploadProductImage,
  uploadProductFiles,
  getProductFiles,
  deleteProductFile
} from '@/lib/api';

import type { Product, ProductFile } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Plus,
  Trash2,
  Loader2,
  Package,
  Search,
  AlertCircle,
  Upload,
  File,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Image
} from 'lucide-react';

import { toast } from 'sonner';


// ============================================
// PLATFORM OPTIONS
// ============================================

const PLATFORMS = [
  'NinjaTrader 8',
  'cTrader',
  'MetaTrader 5',
  'TradingView',
  'Python'
];


// ============================================
// PLAN TYPES + PRICING
// ============================================

const PLAN_TYPES = ['Lifetime', 'Monthly'] as const;

const LIFETIME_PRICES = [600, 550];
const MONTHLY_PRICES = [0.5, 35, 45, 55];


// ============================================
// NOTE:
// Preset Card System Removed
// No CardDesignVisualization
// No designId
// Image upload only
// ============================================


  
 
  
 
// Accepted image types
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

// Accepted file types for product files
const ACCEPTED_FILE_TYPES = ['.zip', '.rar', '.pdf', '.txt', '.dll', '.ex5', '.cs'];

interface ProductFormData {
  name: string;
  platform: string;
  platform_icon: string;
  plan_type: 'Lifetime' | 'Monthly' | '';
  price: string;
  description: string;
  short_description: string;
  long_description: string;
  image_url: string;
  modules: string[];

  rating: number;  // ✅ ADD HERE

  faqs: {          // ✅ ADD HERE
    question: string;
    answer: string;
  }[];
}

const initialFormData: ProductFormData = {
  name: '',
  platform: '',
  platform_icon: '',
  plan_type: '',
  price: '',
  description: '',
  short_description: '',
  long_description: '',
  image_url: '',
  modules: [],

  rating: 0,      // ✅ ADD
  faqs: []        // ✅ ADD
};
 

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  
  // Gallery images state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Section expansion state
  const [isCardSectionOpen, setIsCardSectionOpen] = useState(true);
  const [isDetailsSectionOpen, setIsDetailsSectionOpen] = useState(false);

  // Get available prices based on plan type
  const availablePrices = formData.plan_type === 'Lifetime' ? LIFETIME_PRICES : 
                         formData.plan_type === 'Monthly' ? MONTHLY_PRICES : [];

  // Initial load with loading spinner
  const loadProducts = async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setHasError(true);
      setProducts([]);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Silent refresh without loading spinner (used after mutations)
  const refreshProducts = async () => {
    setIsRefreshing(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product?.platform || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setImagePreview('');
    setSelectedImageFile(null);
    setSelectedFiles([]);
    setGalleryImages([]);
    setSelectedGalleryFiles([]);
    setIsCardSectionOpen(true);
    setIsDetailsSectionOpen(false);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenView = async (product: Product) => {
    setViewingProduct(product);
    setIsViewDialogOpen(true);
    setIsLoadingFiles(true);
    try {
      const files = await getProductFiles(product.id);
      setProductFiles(files);
    } catch (err) {
      toast.error('Failed to load product files');
      setProductFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setSelectedImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file extensions
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_FILE_TYPES.includes(ext);
    });

    if (validFiles.length !== files.length) {
      toast.error(`Some files were rejected. Accepted types: ${ACCEPTED_FILE_TYPES.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Gallery image handlers
  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total limit
    const currentCount = galleryImages.length;
    const remainingSlots = 6 - currentCount;
    
    if (remainingSlots <= 0) {
      toast.error('Maximum 6 gallery images allowed');
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    // Validate file types
    const validFiles = filesToAdd.filter(file => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    setSelectedGalleryFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGalleryImages(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      let galleryUrls: string[] = [];

      // Upload card image if selected
      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          imageUrl = await uploadProductImage(selectedImageFile);
        } catch (err) {
          toast.error('Failed to upload card image');
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        }
        setIsUploadingImage(false);
      }

      // Upload gallery images if selected - wait for ALL to complete before creating product
      if (selectedGalleryFiles.length > 0) {
        setIsUploadingGallery(true);
        try {
          // Upload each gallery image individually and wait for all to complete
          const uploadPromises = selectedGalleryFiles.map(file => uploadProductImage(file));
          galleryUrls = await Promise.all(uploadPromises);
        } catch (err) {
          toast.error('Failed to upload gallery images. Product not created.');
          setIsUploadingGallery(false);
          setIsSubmitting(false);
          return; // Do NOT create product if any gallery upload fails
        }
        setIsUploadingGallery(false);
      }

      // Create product with uploaded image URLs
      const API_BASE = "https://api.fluidtradingsystems.com";
      const res = await fetch(API_BASE + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer owner_session"
        },
        body: JSON.stringify({
          name: formData.name,
          platform: formData.platform,
          platform_icon: formData.platform_icon,
          price: parseFloat(formData.price),
          short_description: formData.short_description,
          long_description: formData.long_description,
          image_url: imageUrl,
          gallery_images: galleryUrls.length > 0 ? galleryUrls : (imageUrl ? [imageUrl] : []),
          plan_type: formData.plan_type.toLowerCase() || null,
          price_tier: null,
           rating: formData.rating,   // ⭐ ADD THIS
  faqs: formData.faqs,       // ❓ ADD THIS

          enabled: 1
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to create product' }));
        throw new Error(errorData.error || errorData.message || 'Failed to create product');
      }

      const newProduct = await res.json();
      toast.success('Product created successfully');

      // Upload product files if any (these are attached to the product after creation)
      if (selectedFiles.length > 0 && newProduct?.product?.id) {
        try {
          await uploadProductFiles(newProduct.product.id, selectedFiles);
          toast.success(`${selectedFiles.length} file(s) uploaded`);
        } catch (err) {
          toast.error('Some files failed to upload');
        }
      }

      setIsDialogOpen(false);
      // Reset form
      setFormData(initialFormData);
      setImagePreview('');
      setSelectedImageFile(null);
      setSelectedFiles([]);
      setGalleryImages([]);
      setSelectedGalleryFiles([]);
      // Refresh data from API
      await refreshProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      setIsUploadingGallery(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      // Refresh data from API
      await refreshProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!viewingProduct) return;

    try {
      await deleteProductFile(viewingProduct.id, fileId);
      toast.success('File deleted');
      // Refresh files
      const files = await getProductFiles(viewingProduct.id);
      setProductFiles(files);
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Failed to load data</p>
            <p className="text-red-400/70 text-sm">Could not fetch products from the server.</p>
          </div>
          <Button onClick={loadProducts} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-slate-400 mt-1">Manage your trading software products</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              {isRefreshing && <Loader2 className="h-3 w-3 animate-spin" />}
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Fetching data...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No products found</h3>
              <p className="text-slate-500 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new product'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Platform</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product?.id || Math.random()} className="border-slate-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <div className="font-medium text-white">{product?.name || 'Unnamed Product'}</div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {product?.description || ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                          {product?.platform || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {formatPrice(product?.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => product && handleOpenView(product)}
                            className="text-slate-400 hover:text-blue-400 hover:bg-blue-950/50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => product && handleOpenDelete(product)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Create Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new trading software product
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              
              {/* SECTION 1: Product Card (Listing View) */}
              <Collapsible open={isCardSectionOpen} onOpenChange={setIsCardSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">Product Card (Listing View)</h3>
                      <p className="text-xs text-slate-400">Controls how the product appears in the storefront grid</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-slate-400">
                      {isCardSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Pro Trader Suite"
                      className="bg-slate-950 border-slate-700 text-white"
                      required
                    />
                  </div>

                  {/* Platform Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-slate-300">
                      Platform *
                    </Label>
                    <select
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select a platform</option>
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

         {/* Platform Icon (Optional) */}
<div className="space-y-2">
  <Label className="text-slate-300">
    Platform Icon (Optional)
  </Label>

  <select
    value={formData.platform_icon}
    onChange={(e) =>
      setFormData({ ...formData, platform_icon: e.target.value })
    }
    className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
  >
    <option value="">No Icon</option>
    <option value="/tradingview.svg">TradingView</option>
    <option value="/ninjatrader.png">NinjaTrader</option>
    <option value="/crt.png">cTrader</option>
    <option value="/MT5.png">MetaTrader 5</option>
    <option value="/python5.svg">Python</option>
  </select>

  {formData.platform_icon && (
    <div className="mt-2 flex items-center gap-2">
      <img
        src={formData.platform_icon}
        className="h-6 w-6 object-contain"
      />
      <span className="text-xs text-slate-400">Preview</span>
    </div>
  )}
</div>

                  {/* Plan Type Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="plan_type" className="text-slate-300">
                      Plan Type *
                    </Label>
                    <select
                      id="plan_type"
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as 'Lifetime' | 'Monthly', price: '' })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select plan type</option>
                      {PLAN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <Label htmlFor="short_description" className="text-slate-300">
                      Short Description *
                    </Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief description for product card"
                      className="bg-slate-950 border-slate-700 text-white"
                      required
                    />
                  </div>

                  {/* Product Card Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Product Card Image</Label>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP • Max 2MB</p>
                    
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageSelect}
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                    
                    {!imagePreview ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Card Image
                      </Button>
                    ) : (
                      <div className="relative">
                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setImagePreview('');
                            setSelectedImageFile(null);
                            if (imageInputRef.current) imageInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SECTION 2: Product Details (Product Page) */}
              <Collapsible open={isDetailsSectionOpen} onOpenChange={setIsDetailsSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">Product Details (Product Page)</h3>
                      <p className="text-xs text-slate-400">Controls the detailed product information and screenshots</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-slate-400">
                      {isDetailsSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {/* Product Name (auto-filled but editable) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_name" className="text-slate-300">
                      Product Name
                    </Label>
                    <Input
                      id="detail_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Product name"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>

                  {/* Platform (auto-filled) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_platform" className="text-slate-300">
                      Platform
                    </Label>
                    <select
                      id="detail_platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select a platform</option>
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type (auto-filled) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_plan_type" className="text-slate-300">
                      Plan Type
                    </Label>
                    <select
                      id="detail_plan_type"
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as 'Lifetime' | 'Monthly', price: '' })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select plan type</option>
                      {PLAN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Tier Selector */}
                  {formData.plan_type && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-slate-300">
                        Price *
                      </Label>
                      <select
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select a price</option>
                        {availablePrices.map((price) => (
                          <option key={price} value={price}>
                            ${price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Long Description */}
                  <div className="space-y-2">
                    <Label htmlFor="long_description" className="text-slate-300">
                      Long Description
                    </Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description}
                      onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                      placeholder="Detailed product description for the product page"
                      className="bg-slate-950 border-slate-700 text-white min-h-[100px]"
                    />
                  </div>

                  {/* Product Rating */}
<div className="space-y-2">
  <Label className="text-slate-300">Product Rating</Label>

  <div className="flex gap-1">
    {[1,2,3,4,5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setFormData({ ...formData, rating: star })}
        className="text-2xl"
      >
        <span className={star <= formData.rating ? "text-yellow-400" : "text-slate-600"}>
          ★
        </span>
      </button>
    ))}
  </div>

  <p className="text-xs text-slate-500">
    Selected: {formData.rating} / 5
  </p>
</div>

                  {/* FAQ Section */}
<div className="space-y-3">
  <Label className="text-slate-300">Product FAQs (Max 5)</Label>

  {formData.faqs.map((faq, index) => (
    <div key={index} className="bg-slate-800/50 p-3 rounded-lg space-y-2">
      <Input
        placeholder="Question"
        value={faq.question}
        onChange={(e) => {
          const updated = [...formData.faqs];
          updated[index].question = e.target.value;
          setFormData({ ...formData, faqs: updated });
        }}
        className="bg-slate-950 border-slate-700 text-white"
      />

      <Textarea
        placeholder="Answer"
        value={faq.answer}
        onChange={(e) => {
          const updated = [...formData.faqs];
          updated[index].answer = e.target.value;
          setFormData({ ...formData, faqs: updated });
        }}
        className="bg-slate-950 border-slate-700 text-white"
      />

      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => {
          const updated = formData.faqs.filter((_, i) => i !== index);
          setFormData({ ...formData, faqs: updated });
        }}
      >
        Remove FAQ
      </Button>
    </div>
  ))}

  {formData.faqs.length < 5 && (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        setFormData({
          ...formData,
          faqs: [...formData.faqs, { question: '', answer: '' }]
        })
      }
      className="border-slate-600 text-slate-400"
    >
      Add FAQ
    </Button>
  )}
</div>

                  {/* Display Gallery Upload */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Display Gallery</Label>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP • Max 2MB each • Max 6 images</p>
                    
                    <input
                      type="file"
                      ref={galleryInputRef}
                      onChange={handleGalleryImageSelect}
                      accept=".png,.jpg,.jpeg,.webp"
                      multiple
                      className="hidden"
                    />
                    <Button
  type="button"
  variant="outline"
  onClick={() => galleryInputRef.current?.click()}
  disabled={galleryImages.length >= 6}
  className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
>
  <Image className="h-4 w-4 mr-2" />
  Add Gallery Images ({galleryImages.length}/6)
</Button>

{/* Gallery Preview Grid */}
{galleryImages.length > 0 && (
  <div className="grid grid-cols-4 gap-2 mt-3">
    {galleryImages.map((img, index) => (
      <div
        key={index}
        className="group relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-700"
      >
        <img
          src={img}
          alt={`Gallery ${index + 1}`}
          className="w-full h-full object-cover"
        />

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeGalleryImage(index)}
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition"
        >
                 
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Product Files Section */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Label className="text-slate-300">Product Files</Label>
                <p className="text-xs text-slate-500">ZIP, RAR, PDF, TXT, DLL, EX5, CS</p>
                
                <input
                  type="file"
                  ref={filesInputRef}
                  onChange={handleFilesSelect}
                  accept=".zip,.rar,.pdf,.txt,.dll,.ex5,.cs"
                  multiple
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => filesInputRef.current?.click()}
                  className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <File className="h-4 w-4 mr-2" />
                  Add Files
                </Button>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-950 rounded-md px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="text-sm text-slate-300 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                disabled={isSubmitting || isUploadingImage || isUploadingGallery}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {(isSubmitting || isUploadingImage || isUploadingGallery) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingProduct?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Product details and files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Product Image */}
            {viewingProduct?.image_url && (
              <div className="space-y-2">
                <Label className="text-slate-300">Product Image</Label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                  <img
                    src={viewingProduct.image_url}
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs">Platform</Label>
                <p className="text-white">{viewingProduct?.platform}</p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Price</Label>
                <p className="text-white">{formatPrice(viewingProduct?.price || 0)}</p>
              </div>
            </div>

            <div>
              <Label className="text-slate-500 text-xs">Description</Label>
              <p className="text-slate-300 text-sm">{viewingProduct?.description}</p>
            </div>

            {/* Product Files */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <Label className="text-slate-300">Product Files</Label>
              
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : productFiles.length === 0 ? (
                <p className="text-slate-500 text-sm">No files attached</p>
              ) : (
                <div className="space-y-2">
                  {productFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-950 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <File className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-300 truncate">{file.file_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Download
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be
              undone.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Package, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Eye, Info, Filter, Check, AlertTriangle,
  LayoutDashboard, ShoppingCart, CreditCard, Image,
  Settings, TrendingUp, Wallet,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProductStore, Product } from "@/store/product.store";
import { useProductIssueStore, IssueType } from "@/store/productIssue.store";
import { useAuthStore } from "@/store/auth.store";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/client/products", icon: Package },
  { name: "Orders", href: "/client/orders", icon: ShoppingCart },
  { name: "Sales", href: "/client/sales", icon: TrendingUp },
  { name: "Payments", href: "/client/payments", icon: CreditCard },
  { name: "Wallet", href: "/client/wallet", icon: Wallet },
  { name: "Carousel", href: "/client/carousel", icon: Image },
  { name: "Settings", href: "/client/settings", icon: Settings },
];

const CATEGORIES = ["Electronics","Bundles","Software","Hardware","Accessories","Services","Other"];
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// ── Inline image carousel for cards ──────────────────────────────────────────
const CardImages = ({ images, name }: { images: Product["images"]; name: string }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <Package className="w-8 h-8 text-muted-foreground/30" />
    </div>
  );
  return (
    <div className="relative w-full h-full">
      <img src={images[idx]?.url} alt={name} className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            onClick={e => { e.stopPropagation(); setIdx(i => i === 0 ? images.length - 1 : i - 1); }}>‹</button>
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            onClick={e => { e.stopPropagation(); setIdx(i => i === images.length - 1 ? 0 : i + 1); }}>›</button>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-1.5 rounded-full">
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

// ── Full image gallery modal ──────────────────────────────────────────────────
const GalleryModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [product]);
  if (!product) return null;
  const images = product.images || [];
  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{product.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {images[idx] && <img src={images[idx].url} alt={product.name} className="w-full h-full object-contain" />}
            {images.length > 1 && (
              <>
                <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow"
                  onClick={() => setIdx(i => i === 0 ? images.length - 1 : i - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow"
                  onClick={() => setIdx(i => i === images.length - 1 ? 0 : i + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {idx + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === idx ? "border-primary" : "border-transparent"}`}>
                  <img src={img.url} alt={String(i + 1)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Category:</span> {product.category}</div>
            <div><span className="text-muted-foreground">Price:</span> <strong>{fmt(product.price)}</strong></div>
            <div><span className="text-muted-foreground">Stock:</span> {product.stock}</div>
            <div><span className="text-muted-foreground">Commission:</span> {(product.commissionRate * 100).toFixed(0)}%</div>
          </div>
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Enlist dialog ─────────────────────────────────────────────────────────────
const EnlistDialog = ({
  product, onClose, onConfirm, isSubmitting,
}: {
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string, commissionRate: number) => void;
  isSubmitting: boolean;
}) => {
  const [rate, setRate] = useState("");
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (product) setRate((product.commissionRate * 100).toFixed(0));
  }, [product]);

  if (!product) return null;

  const minRate = (product.minCommissionRate ?? product.commissionRate) * 100;
  const rateNum = parseFloat(rate);
  const valid = !isNaN(rateNum) && rateNum >= minRate && rateNum <= 100;
  const earning = valid ? product.price * (rateNum / 100) : 0;

  return (
    <>
      <Dialog open={!!product} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Your Store</DialogTitle>
            <DialogDescription>Set your commission rate and enlist this product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Product summary */}
            <div className="flex gap-3 p-3 bg-muted/40 rounded-xl">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer relative"
                onClick={() => setShowGallery(true)}>
                <CardImages images={product.images} name={product.name} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <p className="text-base font-bold text-primary mt-0.5">{fmt(product.price)}</p>
                <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                {product.images?.length > 1 && (
                  <button className="text-xs text-primary hover:underline mt-0.5"
                    onClick={() => setShowGallery(true)}>
                    View all {product.images.length} images
                  </button>
                )}
              </div>
            </div>

            {/* Commission rate input */}
            <div>
              <Label>
                Your Commission Rate (%)
                <span className="text-xs text-muted-foreground ml-2">
                  Min: {minRate.toFixed(0)}%
                </span>
              </Label>
              <Input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                min={minRate}
                max={100}
                step={0.5}
                className="mt-1"
                placeholder={`${minRate.toFixed(0)} or higher`}
              />
              {rate && !valid && (
                <p className="text-xs text-destructive mt-1">
                  Rate must be {minRate.toFixed(0)}%–100%
                </p>
              )}
            </div>

            {/* Earning preview */}
            {valid && (
              <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-0.5">
                <p className="text-xs text-muted-foreground">Your earning per sale</p>
                <p className="text-xl font-bold text-success">{fmt(earning)}</p>
                <p className="text-xs text-muted-foreground">
                  {rateNum.toFixed(1)}% of {fmt(product.price)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => valid && onConfirm(product._id, rateNum / 100)} disabled={!valid || isSubmitting}>
              {isSubmitting
                ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                : <Check className="w-4 h-4 mr-2" />}
              Enlist Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showGallery && <GalleryModal product={product} onClose={() => setShowGallery(false)} />}
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ClientProducts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mySearch, setMySearch] = useState("");

  // Catalog dialog state
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [catalogPage, setCatalogPage] = useState(1);

  // Dialog targets
  const [enlistTarget, setEnlistTarget] = useState<Product | null>(null);
  const [delistTarget, setDelistTarget] = useState<Product | null>(null);
  const [reportTarget, setReportTarget] = useState<Product | null>(null);
  const [issueType, setIssueType] = useState<IssueType>("wrong_info");
  const [issueDesc, setIssueDesc] = useState("");
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);

  const { user } = useAuthStore();
  const {
    catalog, catalogTotal, catalogTotalPages,
    myProducts, myTotal,
    isLoading, isSubmitting, error,
    fetchCatalog, fetchMyProducts, enlistProduct, delistProduct, clearError,
  } = useProductStore();
  const { reportIssue, isSubmitting: isReporting } = useProductIssueStore();

  // Load client's enlisted products on mount
  useEffect(() => { fetchMyProducts(); }, []);

  // Load catalog when dialog opens or filters change
  useEffect(() => {
    if (showCatalog) {
      fetchCatalog({ page: catalogPage, search: catalogSearch, category: catalogCategory, status: "active", limit: 12 });
    }
  }, [showCatalog, catalogPage, catalogSearch, catalogCategory]);

  // Reset catalog page on filter change
  useEffect(() => { setCatalogPage(1); }, [catalogSearch, catalogCategory]);

  useEffect(() => {
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); clearError(); }
  }, [error]);

  // Filter out already-enlisted products from catalog
  const myIds = new Set(myProducts.map(p => p._id));
  const availableCatalog = catalog.filter(p => !myIds.has(p._id));

  // My products filtered by search
  const myFiltered = myProducts.filter(p =>
    p.name.toLowerCase().includes(mySearch.toLowerCase()) ||
    p.category.toLowerCase().includes(mySearch.toLowerCase())
  );

  const handleEnlist = async (productId: string, commissionRate: number) => {
    try {
      await enlistProduct(productId, commissionRate);
      toast({ title: "Product enlisted!", description: "Now showing in your store." });
      setEnlistTarget(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReport = async () => {
    if (!reportTarget || !issueDesc.trim()) return;
    try {
      await reportIssue(reportTarget._id, issueType, issueDesc);
      toast({ title: "Issue Reported", description: "The admin has been notified and will review this product." });
      setReportTarget(null);
      setIssueDesc("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelist = async () => {
    if (!delistTarget) return;
    try {
      await delistProduct(delistTarget._id);
      toast({ title: "Product removed", description: "Back in the catalog for others." });
      setDelistTarget(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">My Products</h1>
              <p className="text-muted-foreground text-sm mt-1">Products you've added to your storefront</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchMyProducts} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCatalog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Browse Catalog
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Enlisted Products" value={myTotal} icon={Package} iconColor="from-primary to-accent" />
            <StatCard title="Active" value={myProducts.filter(p => p.status === "active").length} icon={Check} iconColor="from-success to-success/70" />
            <StatCard title="Out of Stock" value={myProducts.filter(p => p.status === "out_of_stock").length} icon={Package} iconColor="from-warning to-warning/70" />
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search my products…" value={mySearch}
              onChange={e => setMySearch(e.target.value)} className="pl-9" />
          </div>

          {/* My Products Grid */}
          {isLoading && myProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : myFiltered.length === 0 ? (
            <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-14 h-14 text-muted-foreground/20 mb-4" />
              <h3 className="font-semibold text-lg mb-1">No products yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Browse the catalog and add products to your store
              </p>
              <Button onClick={() => setShowCatalog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Browse Catalog
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myFiltered.map(product => (
                <div key={product._id} className="stat-card group p-0 overflow-hidden flex flex-col">
                  <div className="h-44 overflow-hidden bg-muted relative cursor-pointer"
                    onClick={() => setGalleryProduct(product)}>
                    <CardImages images={product.images} name={product.name} />
                    <Badge className={`absolute top-2 left-2 text-[10px] border-0 text-white ${
                      product.status === "active" ? "bg-success/90" :
                      product.status === "out_of_stock" ? "bg-warning/90" : "bg-muted-foreground/70"
                    }`}>
                      {product.status === "out_of_stock" ? "Out of Stock" : product.status}
                    </Badge>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                    <div className="flex items-center justify-between mt-auto mb-3">
                      <span className="font-bold text-primary text-sm">{fmt(product.price)}</span>
                      <span className="text-xs text-success font-medium">
                        {(product.commissionRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs"
                        onClick={() => setGalleryProduct(product)}>
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm"
                        className="h-8 w-8 text-warning hover:text-warning hover:bg-warning/10 p-0"
                        title="Report an issue"
                        onClick={() => { setReportTarget(product); setIssueType("wrong_info"); setIssueDesc(""); }}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 p-0"
                        onClick={() => setDelistTarget(product)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Catalog Dialog ──────────────────────────────────────────── */}
      <Dialog open={showCatalog} onOpenChange={setShowCatalog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Product Catalog</DialogTitle>
            <DialogDescription>
              Browse available products and add them to your store with your preferred commission rate.
            </DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search catalog…" value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={catalogCategory} onValueChange={setCatalogCategory}>
              <SelectTrigger className="w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : availableCatalog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Package className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No products available</p>
                <p className="text-sm mt-1">
                  {catalogTotal === 0
                    ? "The admin hasn't added any products to the catalog yet."
                    : "You've already enlisted all matching products."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                {availableCatalog.map(product => (
                  <div key={product._id}
                    className="flex gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer relative"
                      onClick={() => setGalleryProduct(product)}>
                      <CardImages images={product.images} name={product.name} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="font-bold text-primary text-sm mt-0.5">{fmt(product.price)}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 whitespace-nowrap">
                          {product.stock} in stock
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Info className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Commission: {(product.commissionRate * 100).toFixed(0)}%
                          {product.minCommissionRate
                            ? ` (min ${(product.minCommissionRate * 100).toFixed(0)}%)`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                      <Button size="sm" className="h-8 text-xs px-3"
                        onClick={() => setEnlistTarget(product)}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-3"
                        onClick={() => setGalleryProduct(product)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {catalogTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t shrink-0">
              <Button variant="outline" size="sm" disabled={catalogPage === 1}
                onClick={() => setCatalogPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {catalogPage} of {catalogTotalPages}
              </span>
              <Button variant="outline" size="sm" disabled={catalogPage === catalogTotalPages}
                onClick={() => setCatalogPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Enlist Dialog ────────────────────────────────────────────── */}
      <EnlistDialog
        product={enlistTarget}
        onClose={() => setEnlistTarget(null)}
        onConfirm={handleEnlist}
        isSubmitting={isSubmitting}
      />

      {/* ── Report Issue Dialog ──────────────────────────────────────── */}
      <Dialog open={!!reportTarget} onOpenChange={() => setReportTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" /> Report Product Issue
            </DialogTitle>
            <DialogDescription>
              Report an issue with <strong>{reportTarget?.name}</strong>. The admin will review and fix it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Issue Type *</Label>
              <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wrong_info">Wrong Information</SelectItem>
                  <SelectItem value="wrong_price">Wrong Price</SelectItem>
                  <SelectItem value="bad_images">Bad / Missing Images</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="pricing_issue">Pricing Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                className="mt-1"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={issueDesc}
                onChange={e => setIssueDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setReportTarget(null)}>Cancel</Button>
            <Button
              className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground"
              disabled={isReporting || !issueDesc.trim()}
              onClick={handleReport}
            >
              {isReporting ? "Submitting…" : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delist Confirm ───────────────────────────────────────────── */}
      <AlertDialog open={!!delistTarget} onOpenChange={() => setDelistTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{delistTarget?.name}</strong> will be removed from your store and returned to the catalog for other clients to enlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelist}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Gallery Modal ────────────────────────────────────────────── */}
      <GalleryModal product={galleryProduct} onClose={() => setGalleryProduct(null)} />
    </div>
  );
};

export default ClientProducts;

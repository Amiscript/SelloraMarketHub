import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, Package, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, X, ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProductStore, Product } from "@/store/product.store";
import { useAuthStore } from "@/store/auth.store";
import { useProductIssueStore } from "../../store/productIssue.store";
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Image, UserCog, AlertTriangle } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
  { name: "Product Issues", href: "/admin/product-issues", icon: AlertTriangle },
];

const CATEGORIES = ["Electronics","Bundles","Software","Hardware","Accessories","Services","Other"];

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  out_of_stock: "bg-warning/10 text-warning",
  draft: "bg-muted text-muted-foreground",
};

const emptyForm = { name: "", description: "", category: "", price: "", stock: "", commissionRate: "", minCommissionRate: "", status: "active" };

const ProductManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  const { allProducts: products, allTotal: total, allTotalPages: totalPages, stats, isLoading, isSubmitting, fetchAllProducts: fetchProducts, fetchProductStats, createProduct, updateProduct, deleteProduct } = useProductStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchProducts({ page, limit: 10, search: search || undefined, category: categoryFilter !== "all" ? categoryFilter : undefined });
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchProductStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setImages([]); setShowDialog(true); };
  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({ name: p.name, description: p.description || "", category: p.category, price: String(p.price), stock: String(p.stock), commissionRate: String(Math.round(p.commissionRate * 100)), minCommissionRate: p.minCommissionRate ? String(Math.round(p.minCommissionRate * 100)) : "", status: p.status || 'active' });
    setImages([]); setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock || !form.commissionRate) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const data: Partial<Product> = {
      name: form.name,
      description: form.description || undefined,
      category: form.category as Product["category"],
      price: Number(form.price),
      stock: Number(form.stock),
      commissionRate: Number(form.commissionRate) / 100,
      minCommissionRate: form.minCommissionRate ? Number(form.minCommissionRate) / 100 : Number(form.commissionRate) / 100,
      status: (form as any).status || 'active',
    };
    try {
      if (editTarget) {
        await updateProduct(editTarget._id, data, images.length ? images : undefined);
        toast({ title: "Product Updated", description: "Product has been updated successfully." });
      } else {
        await createProduct(data, images.length ? images : undefined);
        toast({ title: "Product Created", description: "New product has been created." });
      }
      setShowDialog(false);
      setForm(emptyForm);
      setImages([]);
    } catch {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget._id);
      toast({ title: "Product Deleted", description: "Product has been removed.", variant: "destructive" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Product Management</h1>
              <p className="text-muted-foreground">Manage all marketplace products</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh</Button>
              <Button variant="hero" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </div>
          </div>

        
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard title="Total Products" value={String(stats?.totalProducts ?? 0)} icon={Package} iconColor="from-primary to-primary/70" />
  <StatCard title="Active" value={String(stats?.activeProducts ?? 0)} icon={Package} iconColor="from-success to-success/70" />
  <StatCard title="Out of Stock" value={String(stats?.outOfStockProducts ?? 0)} icon={Package} iconColor="from-warning to-warning/70" />
  <StatCard title="Draft" value={String(stats?.draftProducts ?? 0)} icon={Package} iconColor="from-muted to-muted/70" />
</div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">No products found</div>
            ) : (
              products.map((product) => {
                const clientName = product.client && typeof product.client === "object" ? (product.client as any).storeName || (product.client as any).name : "Catalog";
                return (
                  <div key={product._id} className="stat-card group hover:shadow-md transition-shadow">
                    <div className="relative mb-3 rounded-lg overflow-hidden bg-muted h-40">
                      {product.images?.[previewIdx]?.url ? (
                        <img src={product.images[previewIdx].url} className="w-full h-full object-cover" alt={product.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-12 h-12" /></div>
                      )}
                      {product.images?.length > 1 && (
                        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1">
                          {product.images.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === previewIdx ? "bg-white" : "bg-white/40"}`} />)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{clientName}</p>
                      </div>
                      <Badge className={`capitalize text-xs ${statusColors[product.status] || ""}`}>{product.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-primary">₦{product.price?.toLocaleString()}</span>
                      <span className="text-muted-foreground">{product.category}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      <span>Commission: {(product.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(product)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {products.length} of {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea placeholder="Product description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Price (₦) *</Label>
                <Input type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Stock *</Label>
                <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Commission Rate * (0–1)</Label>
                <Input type="number" step="0.01" min="0" max="1" placeholder="0.10" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Images</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
              {images.length > 0 && <p className="text-xs text-muted-foreground">{images.length} image(s) selected</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? "Saving…" : editTarget ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Deleting…" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;

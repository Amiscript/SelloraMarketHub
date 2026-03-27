import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Image, Plus, Pencil, Trash2, RefreshCw, GripVertical,
  LayoutDashboard, ShoppingCart, TrendingUp, CreditCard, Wallet, Settings, Package, Shield
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useCarouselStore, ClientCarouselSlide } from "@/store/carousel.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";

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

interface SlideForm {
  title: string;
  subtitle: string;
  link: string;
  buttonText: string;
}

const defaultForm: SlideForm = { title: "", subtitle: "", link: "", buttonText: "Shop Now" };

const ClientCarousel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ClientCarouselSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    clientSlides, isLoading, isSubmitting, error,
    fetchClientCarousels, createClientCarousel, updateClientCarousel,
    deleteClientCarousel, toggleClientCarousel, reorderClientCarousels, clearError,
  } = useCarouselStore();
  const { user } = useAuthStore();

  useEffect(() => { 
    fetchClientCarousels(); 
  }, []);

  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      clearError();
    }
  }, [error]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview(null);
    setShowDialog(true);
  };

  const openEdit = (slide: ClientCarouselSlide) => {
    setEditTarget(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || "",
      link: slide.link || "",
      buttonText: slide.buttonText || "Shop Now",
    });
    setImageFile(null);
    setImagePreview(slide.image?.url || null);
    setShowDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Validation", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (!editTarget && !imageFile) {
      toast({ title: "Validation", description: "Please select an image.", variant: "destructive" });
      return;
    }
    try {
      if (editTarget) {
        await updateClientCarousel(
          editTarget._id,
          { title: form.title, subtitle: form.subtitle, link: form.link, buttonText: form.buttonText },
          imageFile || undefined
        );
        toast({ title: "Slide updated" });
      } else {
        await createClientCarousel(
          { title: form.title, subtitle: form.subtitle, link: form.link, buttonText: form.buttonText },
          imageFile!
        );
        toast({ title: "Slide created" });
      }
      setShowDialog(false);
    } catch {
      // error shown via useEffect
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClientCarousel(deleteTarget);
      toast({ title: "Slide deleted" });
    } catch {
      // error shown via useEffect
    }
    setDeleteTarget(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...clientSlides];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    reorderClientCarousels(newOrder.map(s => s._id));
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const activeCount = clientSlides.filter(s => s.active).length;

  // Check verification status - if not verified, show verification required UI
  if (user?.verificationStatus !== 'verified') {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
        <div className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
          <main className="flex-1 p-4 lg:p-6 space-y-6">
            <div className="stat-card flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <Shield className="w-14 h-14 text-warning/60 mb-4" />
              <h3 className="font-semibold text-xl mb-2">Verification Required</h3>
              <p className="text-muted-foreground text-sm">
                Your account must be verified by an admin before you can manage carousel slides.
                Please check your verification status in Settings.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Main content for verified users
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">My Store Carousel</h1>
              <p className="text-muted-foreground text-sm mt-1">Banner slides shown on your storefront</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchClientCarousels()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button size="sm" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Add Slide
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold">{clientSlides.length}</p>
              <p className="text-sm text-muted-foreground">Total Slides</p>
            </div>
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold text-success">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="stat-card text-center p-4">
              <p className="text-2xl font-bold text-muted-foreground">{clientSlides.length - activeCount}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>

          {/* Slides */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : clientSlides.length === 0 ? (
            <div className="stat-card flex flex-col items-center justify-center py-16 text-center">
              <Image className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-1">No slides yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Add banner slides to make your store more attractive</p>
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add First Slide</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clientSlides.map((slide, index) => (
                <div
                  key={slide._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`stat-card flex gap-4 items-center cursor-grab active:cursor-grabbing transition-opacity ${dragIndex === index ? "opacity-50" : ""}`}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground/40 shrink-0" />

                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {slide.image?.url ? (
                      <img src={slide.image.url} alt={slide.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{slide.title}</h3>
                      <Badge variant={slide.active ? "default" : "secondary"} className="text-xs shrink-0">
                        {slide.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {slide.subtitle && <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-0.5">
                      {slide.link && <p className="text-xs text-primary truncate">{slide.link}</p>}
                      {slide.buttonText && <p className="text-xs text-muted-foreground">Button: "{slide.buttonText}"</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={slide.active}
                      onCheckedChange={() => toggleClientCarousel(slide._id)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(slide._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">Drag slides to reorder. Changes are saved automatically.</p>
        </main>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Slide" : "Add New Slide"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Update your carousel slide." : "Create a new banner slide for your store."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Slide title" className="mt-1" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short description" className="mt-1" />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." className="mt-1" />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} placeholder="Shop Now" className="mt-1" />
            </div>
            <div>
              <Label>Image {!editTarget && "*"}</Label>
              <div
                className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <div className="py-4">
                    <Image className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {editTarget ? "Update Slide" : "Create Slide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the slide from your store.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientCarousel;
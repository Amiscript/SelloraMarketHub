import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Image, MoveUp, MoveDown, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useCarouselStore, CarouselSlide } from "@/store/carousel.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Package, UserCog } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
];

const CarouselManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<CarouselSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarouselSlide | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const { adminSlides, isLoading, isSubmitting, fetchAdminCarousels, createAdminCarousel, updateAdminCarousel, deleteAdminCarousel, toggleAdminCarousel, reorderAdminCarousels } = useCarouselStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchAdminCarousels(); }, []);

  const openCreate = () => {
    setEditTarget(null); setTitle(""); setSubtitle(""); setImageFile(null); setImagePreview(""); setShowDialog(true);
  };
  const openEdit = (slide: CarouselSlide) => {
    setEditTarget(slide); setTitle(slide.title); setSubtitle(slide.subtitle); setImageFile(null); setImagePreview(slide.image.url); setShowDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    if (!title || !subtitle) { toast({ title: "Required", description: "Title and subtitle are required.", variant: "destructive" }); return; }
    if (!editTarget && !imageFile) { toast({ title: "Required", description: "Please select an image.", variant: "destructive" }); return; }
    try {
      if (editTarget) {
        await updateAdminCarousel(editTarget._id, { title, subtitle }, imageFile || undefined);
        toast({ title: "Slide Updated" });
      } else {
        await createAdminCarousel({ title, subtitle }, imageFile!);
        toast({ title: "Slide Created", description: "New carousel slide has been added." });
      }
      setShowDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save slide", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminCarousel(deleteTarget._id);
      toast({ title: "Slide Deleted", variant: "destructive" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete slide", variant: "destructive" });
    }
  };

  const handleToggle = async (slide: CarouselSlide) => {
    try {
      await toggleAdminCarousel(slide._id);
      toast({ title: `Slide ${slide.active ? "deactivated" : "activated"}` });
    } catch {
      toast({ title: "Error", description: "Failed to toggle slide", variant: "destructive" });
    }
  };

  const moveSlide = async (index: number, dir: "up" | "down") => {
    const slides = [...adminSlides];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= slides.length) return;
    [slides[index], slides[swap]] = [slides[swap], slides[index]];
    await reorderAdminCarousels(slides.map(s => s._id));
    fetchAdminCarousels();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Carousel Management</h1>
              <p className="text-muted-foreground">Create and manage landing page banner slides</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchAdminCarousels} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="hero" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center">
              <Image className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{adminSlides.length}</p>
              <p className="text-sm text-muted-foreground">Total Slides</p>
            </div>
            <div className="stat-card text-center">
              <ToggleRight className="w-7 h-7 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{adminSlides.filter(s => s.active).length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="stat-card text-center">
              <ToggleLeft className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{adminSlides.filter(s => !s.active).length}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>

          {/* Slides List */}
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : adminSlides.length === 0 ? (
            <div className="stat-card text-center py-12 text-muted-foreground">No carousel slides yet. Add your first slide!</div>
          ) : (
            <div className="space-y-3">
              {adminSlides.map((slide, idx) => (
                <div key={slide._id} className="stat-card flex items-center gap-4 group">
                  <img src={slide.image.url} alt={slide.title} className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{slide.title}</p>
                      <Badge className={slide.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{slide.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                    <p className="text-xs text-muted-foreground">Order: {slide.order + 1}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" disabled={idx === 0} onClick={() => moveSlide(idx, "up")}><MoveUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" disabled={idx === adminSlides.length - 1} onClick={() => moveSlide(idx, "down")}><MoveDown className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(slide)}>
                      {slide.active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(slide)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(slide)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Slide" : "Add Slide"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {imagePreview && <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" alt="Preview" />}
            <div className="space-y-1">
              <Label>Image {!editTarget && "*"}</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input placeholder="Slide title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Subtitle / Description *</Label>
              <Input placeholder="Brief description shown on the slide" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? "Saving…" : editTarget ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Slide</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Deleting…" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarouselManagement;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Image, MoveUp, MoveDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const carouselData = [
  { id: 1, title: "Summer Sale", subtitle: "Up to 50% off", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400", order: 1, active: true },
  { id: 2, title: "New Arrivals", subtitle: "Check out our latest products", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", order: 2, active: true },
  { id: 3, title: "Free Shipping", subtitle: "On orders over $50", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400", order: 3, active: false },
];

const CarouselManagement = () => {
  const [slides, setSlides] = useState(carouselData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<typeof carouselData[0] | null>(null);
  const [formData, setFormData] = useState({ title: "", subtitle: "" });

  const handleAddSlide = () => {
    toast({ title: "Slide Added", description: "New carousel slide has been added." });
    setShowAddDialog(false);
    setFormData({ title: "", subtitle: "" });
  };

  const handleEditSlide = () => {
    toast({ title: "Slide Updated", description: "Carousel slide has been updated." });
    setShowEditDialog(false);
    setSelectedSlide(null);
  };

  const handleDeleteSlide = (id: number) => {
    setSlides(slides.filter((s) => s.id !== id));
    toast({ title: "Slide Deleted", description: "Carousel slide has been removed.", variant: "destructive" });
  };

  const toggleActive = (id: number) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    toast({ title: "Status Updated", description: "Slide visibility has been toggled." });
  };

  const moveSlide = (id: number, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === slides.length - 1)) return;

    const newSlides = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    setSlides(newSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Carousel Management</h1>
          <p className="text-muted-foreground">Create and manage banner slides for the storefront</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <Image className="w-8 h-8 text-primary mb-3" />
          <p className="text-2xl font-bold">{slides.length}</p>
          <p className="text-sm text-muted-foreground">Total Slides</p>
        </div>
        <div className="stat-card">
          <Image className="w-8 h-8 text-success mb-3" />
          <p className="text-2xl font-bold">{slides.filter((s) => s.active).length}</p>
          <p className="text-sm text-muted-foreground">Active Slides</p>
        </div>
        <div className="stat-card">
          <Image className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-2xl font-bold">{slides.filter((s) => !s.active).length}</p>
          <p className="text-sm text-muted-foreground">Inactive Slides</p>
        </div>
      </div>

      {/* Carousel Preview */}
      <div className="stat-card">
        <h2 className="text-lg font-display font-semibold mb-4">Carousel Preview</h2>
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
          {slides.filter((s) => s.active)[0] && (
            <>
              <img
                src={slides.filter((s) => s.active)[0].image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center">
                <div className="p-8">
                  <h3 className="text-3xl font-display font-bold text-primary-foreground mb-2">
                    {slides.filter((s) => s.active)[0].title}
                  </h3>
                  <p className="text-lg text-primary-foreground/80">
                    {slides.filter((s) => s.active)[0].subtitle}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold">All Slides</h2>
        {slides.map((slide, index) => (
          <div key={slide.id} className="stat-card flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{slide.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{slide.subtitle}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                slide.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}>
                {slide.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveSlide(slide.id, "up")}
                disabled={index === 0}
              >
                <MoveUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveSlide(slide.id, "down")}
                disabled={index === slides.length - 1}
              >
                <MoveDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleActive(slide.id)}>
                {slide.active ? "Disable" : "Enable"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedSlide(slide);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteSlide(slide.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="Slide title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Input
                placeholder="Slide subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleAddSlide}>
                Add Slide
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input defaultValue={selectedSlide?.title} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Input defaultValue={selectedSlide?.subtitle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleEditSlide}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarouselManagement;

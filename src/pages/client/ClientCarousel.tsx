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

const initialSlides = [
  { id: 1, title: "Welcome to Our Store", subtitle: "Find the best deals here", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400", order: 1, active: true },
  { id: 2, title: "New Products", subtitle: "Check out what's new", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", order: 2, active: true },
];

const ClientCarousel = () => {
  const [slides, setSlides] = useState(initialSlides);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({ title: "", subtitle: "" });

  const handleAddSlide = () => {
    toast({ title: "Slide Added", description: "New banner slide has been added." });
    setShowAddDialog(false);
    setFormData({ title: "", subtitle: "" });
  };

  const handleDeleteSlide = (id: number) => {
    setSlides(slides.filter((s) => s.id !== id));
    toast({ title: "Slide Deleted", variant: "destructive" });
  };

  const toggleActive = (id: number) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Carousel Management</h1>
          <p className="text-muted-foreground">Manage banners for your storefront</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide) => (
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
              <Button variant="outline" size="sm" onClick={() => toggleActive(slide.id)}>
                {slide.active ? "Disable" : "Enable"}
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
    </div>
  );
};

export default ClientCarousel;

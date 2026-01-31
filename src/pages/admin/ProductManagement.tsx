import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Package, Edit, Trash2, MoreHorizontal, X, ChevronLeft, ChevronRight, Percent } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define Product Type
interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: "active" | "out_of_stock";
  images: string[];
  description?: string;
  commissionRate: number; // Added commission rate
  minCommission?: number; // Minimum commission for client pricing
}

const initialProducts: Product[] = [
  { 
    id: 1, 
    name: "Premium Widget", 
    category: "Electronics", 
    price: "$129.99", 
    stock: 45, 
    status: "active", 
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    ],
    commissionRate: 15,
    minCommission: 10
  },
  { 
    id: 2, 
    name: "Basic Bundle", 
    category: "Bundles", 
    price: "$79.99", 
    stock: 32, 
    status: "active", 
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    ],
    commissionRate: 10,
    minCommission: 5
  },
  { 
    id: 3, 
    name: "Pro Package", 
    category: "Software", 
    price: "$199.99", 
    stock: 0, 
    status: "out_of_stock", 
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"
    ],
    commissionRate: 20,
    minCommission: 15
  },
  { 
    id: 4, 
    name: "Starter Kit", 
    category: "Bundles", 
    price: "$49.99", 
    stock: 156, 
    status: "active", 
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"
    ],
    commissionRate: 8,
    minCommission: 4
  },
  { 
    id: 5, 
    name: "Enterprise Suite", 
    category: "Software", 
    price: "$299.99", 
    stock: 23, 
    status: "active", 
    images: [
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    ],
    commissionRate: 25,
    minCommission: 20
  },
];

// Component for viewing all product images
const ProductGalleryModal = ({ 
  product, 
  isOpen, 
  onClose 
}: { 
  product: Product | null; 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !isOpen) return null;

  const handlePrev = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{product.name} - All Images</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Main Image Viewer */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    currentImageIndex === index 
                      ? "border-primary" 
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total Images: {product.images.length}</span>
            <span>Commission: {product.commissionRate}%</span>
            {product.minCommission && (
              <span>Min Commission: {product.minCommission}%</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    commissionRate: "",
    minCommission: "",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }

    if (!formData.commissionRate.trim()) {
      toast({ title: "Error", description: "Commission rate is required", variant: "destructive" });
      return;
    }

    const commissionRate = parseFloat(formData.commissionRate);
    const minCommission = formData.minCommission ? parseFloat(formData.minCommission) : undefined;

    // Validate commission rates
    if (commissionRate < 0 || commissionRate > 100) {
      toast({ title: "Error", description: "Commission rate must be between 0-100%", variant: "destructive" });
      return;
    }

    if (minCommission !== undefined && (minCommission < 0 || minCommission > commissionRate)) {
      toast({ title: "Error", description: "Minimum commission must be between 0% and commission rate", variant: "destructive" });
      return;
    }

    // Convert uploaded files to URLs (in real app, you'd upload to server)
    const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
    
    const newProduct: Product = {
      id: products.length + 1,
      name: formData.name,
      category: formData.category,
      price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
      stock: parseInt(formData.stock) || 0,
      status: parseInt(formData.stock) > 0 ? "active" : "out_of_stock",
      images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
      description: formData.description,
      commissionRate: commissionRate,
      minCommission: minCommission,
    };

    setProducts([...products, newProduct]);
    toast({ 
      title: "Product Added", 
      description: `${formData.name} has been added with ${commissionRate}% commission.` 
    });
    
    // Reset form
    setShowAddDialog(false);
    setFormData({ 
      name: "", 
      category: "", 
      price: "", 
      stock: "", 
      description: "", 
      commissionRate: "",
      minCommission: "" 
    });
    setImageFiles([]);
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;
    
    // In a real app, you would update the product in state/backend
    toast({ title: "Product Updated", description: `${selectedProduct.name} has been updated.` });
    setShowEditDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({ 
      title: "Product Deleted", 
      description: `${productName} has been removed.`, 
      variant: "destructive" 
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Limit to 10 images
    if (imageFiles.length + newFiles.length > 10) {
      toast({ 
        title: "Too many images", 
        description: "You can upload maximum 10 images per product", 
        variant: "destructive" 
      });
      return;
    }

    setImageFiles(prev => [...prev, ...newFiles.slice(0, 10 - prev.length)]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openProductGallery = (product: Product) => {
    setSelectedProduct(product);
    setShowGallery(true);
  };

  // Product categories for dropdown
  const productCategories = [
    "Electronics",
    "Bundles",
    "Software",
    "Hardware",
    "Accessories",
    "Services",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Product Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage your product catalog</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Stats - Updated to show commission stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Products" 
          value={products.length} 
          icon={Package} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Active Products" 
          value={products.filter(p => p.status === "active").length} 
          icon={Package} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Avg Commission" 
          value={`${(products.reduce((acc, p) => acc + p.commissionRate, 0) / products.length).toFixed(1)}%`} 
          icon={Percent} 
          iconColor="from-accent to-purple-500"
        />
        <StatCard 
          title="Out of Stock" 
          value={products.filter(p => p.status === "out_of_stock").length} 
          icon={Package} 
          iconColor="from-destructive to-destructive/70"
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
        />
      </div>

      {/* Products Grid - Updated to show commission */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="stat-card group">
            <div 
              className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted cursor-pointer relative"
              onClick={() => openProductGallery(product)}
            >
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  +{product.images.length - 1} more
                </div>
              )}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 
                  className="font-medium mb-1 cursor-pointer hover:text-primary"
                  onClick={() => openProductGallery(product)}
                >
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-lg font-bold">{product.price}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {product.commissionRate}% Commission
                  </span>
                  {product.minCommission && (
                    <span className="text-xs text-muted-foreground">
                      Min: {product.minCommission}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openProductGallery(product)}>
                    <Package className="w-4 h-4 mr-2" /> View All Images
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedProduct(product);
                    setShowEditDialog(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
              product.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {product.status === "active" ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        ))}
      </div>

      {/* Add Product Dialog - Updated with commission fields */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <Input
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Commission Rate (%) *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="15"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage clients earn per sale
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Commission (%)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={formData.minCommission}
                    onChange={(e) => setFormData({ ...formData, minCommission: e.target.value })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum commission clients can set
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Product Images ({imageFiles.length}/10 max)
              </label>
              <div className="space-y-3">
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground">
                  You can upload up to 10 images. First image will be the main thumbnail.
                </p>
                
                {/* Preview uploaded images */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center">
                          {index === 0 ? "Main" : index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setImageFiles([]);
              }}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog - Updated with commission fields */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <Input defaultValue={selectedProduct.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select defaultValue={selectedProduct.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <Input defaultValue={selectedProduct.price} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <Input 
                    type="number" 
                    defaultValue={selectedProduct.stock} 
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select defaultValue={selectedProduct.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      defaultValue={selectedProduct.commissionRate}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Commission (%)</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      defaultValue={selectedProduct.minCommission}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea 
                  defaultValue={selectedProduct.description} 
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="text-sm text-muted-foreground">
                  {selectedProduct.images.length} images uploaded
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => openProductGallery(selectedProduct)}
                >
                  View All Images
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleEditProduct}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Gallery Modal */}
      <ProductGalleryModal
        product={selectedProduct}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </div>
  );
};

export default ProductManagement;
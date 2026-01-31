import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, Check, Filter, Eye, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

// Product Types
interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  images: string[];
  description: string;
  commissionRate: number;
  minCommission: number;
}

interface ClientProduct {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  clientPrice: number;
  images: string[];
  sales: number;
  commissionRate: number;
  isVerified: boolean;
}

// Admin products available to add
const availableProducts: Product[] = [
  { 
    id: 1, 
    name: "Premium Widget", 
    category: "Electronics", 
    price: "$129.99", 
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    ], 
    description: "High-quality widget with premium features", 
    commissionRate: 15, 
    minCommission: 10 
  },
  { 
    id: 2, 
    name: "Basic Bundle", 
    category: "Bundles", 
    price: "$79.99", 
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    ], 
    description: "Essential bundle for beginners", 
    commissionRate: 10, 
    minCommission: 5 
  },
  { 
    id: 3, 
    name: "Pro Package", 
    category: "Software", 
    price: "$199.99", 
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"
    ], 
    description: "Professional software package", 
    commissionRate: 20, 
    minCommission: 15 
  },
  { 
    id: 4, 
    name: "Starter Kit", 
    category: "Bundles", 
    price: "$49.99", 
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    ], 
    description: "Perfect starter kit for new users", 
    commissionRate: 8, 
    minCommission: 4 
  },
  { 
    id: 5, 
    name: "Enterprise Suite", 
    category: "Software", 
    price: "$299.99", 
    images: [
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    ], 
    description: "Complete enterprise solution", 
    commissionRate: 25, 
    minCommission: 20 
  },
];

// Client's selected products
const initialClientProducts: ClientProduct[] = [
  { 
    id: 1, 
    name: "Premium Widget", 
    category: "Electronics", 
    basePrice: 129.99, 
    clientPrice: 149.99, 
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    ], 
    sales: 45, 
    commissionRate: 15, 
    isVerified: true 
  },
  { 
    id: 4, 
    name: "Starter Kit", 
    category: "Bundles", 
    basePrice: 49.99, 
    clientPrice: 59.99, 
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    ], 
    sales: 23, 
    commissionRate: 8, 
    isVerified: true 
  },
];

// Product Gallery Modal Component
const ProductGalleryModal = ({ 
  product, 
  isOpen, 
  onClose 
}: { 
  product: Product | ClientProduct | null; 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !isOpen) return null;

  const images = product.images || [];
  const productName = product.name;

  const handlePrev = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{productName} - All Images</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Main Image Viewer */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={images[currentImageIndex]}
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {images.length > 1 && (
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
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((img, index) => (
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
            <span>Total Images: {images.length}</span>
            <span>Category: {'category' in product ? product.category : 'N/A'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClientProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [clientProducts, setClientProducts] = useState<ClientProduct[]>(initialClientProducts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [galleryProduct, setGalleryProduct] = useState<Product | ClientProduct | null>(null);
  const [commissionRate, setCommissionRate] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const filteredProducts = clientProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableProducts = availableProducts.filter(
    (product) =>
      (categoryFilter === "all" || product.category === categoryFilter) &&
      !clientProducts.find((p) => p.id === product.id)
  );

  const categories = [...new Set(availableProducts.map(p => p.category))];

  const handleAddProduct = (product: Product) => {
    if (clientProducts.find((p) => p.id === product.id)) {
      toast({ title: "Already Added", description: "This product is already in your store.", variant: "destructive" });
      return;
    }
    
    // Check if client is verified
    if (!userIsVerified()) {
      toast({ 
        title: "Verification Required", 
        description: "Please complete verification to add products.", 
        variant: "destructive" 
      });
      return;
    }
    
    const newProduct: ClientProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      basePrice: parseFloat(product.price.replace('$', '')),
      clientPrice: parseFloat(product.price.replace('$', '')),
      images: product.images,
      sales: 0,
      commissionRate: product.commissionRate,
      isVerified: true
    };
    
    setClientProducts([...clientProducts, newProduct]);
    toast({ title: "Product Added", description: `${product.name} has been added to your store.` });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCommissionRate(product.commissionRate.toString());
    setCustomPrice(product.price);
  };

  const openProductGallery = (product: Product | ClientProduct) => {
    setGalleryProduct(product);
    setShowGallery(true);
  };

  const handleAcceptProduct = () => {
    if (!selectedProduct) return;

    if (parseFloat(commissionRate) < selectedProduct.minCommission) {
      toast({
        title: "Commission Too Low",
        description: `Minimum commission rate is ${selectedProduct.minCommission}%`,
        variant: "destructive"
      });
      return;
    }

    if (!userIsVerified()) {
      toast({
        title: "Verification Required",
        description: "Please complete verification to add products.",
        variant: "destructive"
      });
      return;
    }

    const newProduct: ClientProduct = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      basePrice: parseFloat(selectedProduct.price.replace('$', '')),
      clientPrice: parseFloat(customPrice.replace('$', '')),
      images: selectedProduct.images,
      sales: 0,
      commissionRate: parseFloat(commissionRate),
      isVerified: true
    };

    setClientProducts([...clientProducts, newProduct]);
    setSelectedProduct(null);
    toast({
      title: "Product Added",
      description: `${selectedProduct.name} added with ${commissionRate}% commission`
    });
  };

  const handleRemoveProduct = (productId: number) => {
    setClientProducts(clientProducts.filter((p) => p.id !== productId));
    toast({ title: "Product Removed", description: "Product has been removed from your store." });
  };

  const userIsVerified = () => {
    // Check user verification status (you'll need to implement this based on your auth system)
    return true; // Placeholder
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">My Products</h1>
          <p className="text-muted-foreground">Manage products in your storefront</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Products
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Products" 
          value={clientProducts.length} 
          icon={Package} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Total Sales" 
          value={clientProducts.reduce((acc, p) => acc + p.sales, 0)} 
          icon={Package} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Available to Add" 
          value={availableProducts.length - clientProducts.length} 
          icon={Package} 
          iconColor="from-accent to-accent/70"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="stat-card group">
            <div 
              className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted relative cursor-pointer"
              onClick={() => openProductGallery(product)}
            >
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.isVerified && (
                <div className="absolute top-2 right-2 bg-success/20 backdrop-blur-sm rounded-full p-1">
                  <Check className="w-4 h-4 text-success" />
                </div>
              )}
              {product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  +{product.images.length - 1} more
                </div>
              )}
            </div>
            <div>
              <h3 
                className="font-medium mb-1 cursor-pointer hover:text-primary"
                onClick={() => openProductGallery(product)}
              >
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-bold">${product.clientPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground line-through">${product.basePrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">{product.commissionRate}% Commission</p>
                  <p className="text-xs text-muted-foreground">Sales: {product.sales}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleRemoveProduct(product.id)}
              >
                Remove from Store
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Products Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Products to Your Store</DialogTitle>
          </DialogHeader>
          
          {/* Search and Filter in Modal */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-h-[60vh] overflow-y-auto">
            {filteredAvailableProducts.map((product) => (
              <div 
                key={product.id} 
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => handleProductClick(product)}
              >
                <div 
                  className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProductGallery(product);
                  }}
                >
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="font-bold">{product.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Commission: {product.commissionRate}% (min: {product.minCommission}%)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductGallery(product);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Product to Store</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div 
                  className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative cursor-pointer"
                  onClick={() => openProductGallery(selectedProduct)}
                >
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  {selectedProduct.images.length > 1 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      +{selectedProduct.images.length - 1}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
                  <p className="text-muted-foreground text-sm mt-2">{selectedProduct.description}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 mt-1"
                    onClick={() => openProductGallery(selectedProduct)}
                  >
                    View all {selectedProduct.images.length} images
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Set Commission Rate (%)
                    <span className="text-xs text-muted-foreground ml-2">
                      Minimum: {selectedProduct.minCommission}%
                    </span>
                  </label>
                  <Input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    min={selectedProduct.minCommission}
                    max={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Set Your Price (Optional)
                    <span className="text-xs text-muted-foreground ml-2">
                      Base Price: {selectedProduct.price}
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={selectedProduct.price}
                  />
                </div>

                {/* Verification Notice */}
                {!userIsVerified() && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning font-medium">
                      ⚠️ Verification Required
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You need to complete verification before adding products.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={handleAcceptProduct}
                    disabled={!userIsVerified()}
                  >
                    Add to Store
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Gallery Modal */}
      <ProductGalleryModal
        product={galleryProduct}
        isOpen={showGallery}
        onClose={() => {
          setShowGallery(false);
          setGalleryProduct(null);
        }}
      />
    </div>
  );
};

export default ClientProducts;
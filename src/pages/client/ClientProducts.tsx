import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

// Admin products available to add
const availableProducts = [
  { id: 1, name: "Premium Widget", category: "Electronics", price: "$129.99", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100" },
  { id: 2, name: "Basic Bundle", category: "Bundles", price: "$79.99", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100" },
  { id: 3, name: "Pro Package", category: "Software", price: "$199.99", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100" },
  { id: 4, name: "Starter Kit", category: "Bundles", price: "$49.99", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100" },
  { id: 5, name: "Enterprise Suite", category: "Software", price: "$299.99", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100" },
];

// Client's selected products
const initialClientProducts = [
  { id: 1, name: "Premium Widget", category: "Electronics", price: "$129.99", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100", sales: 45 },
  { id: 4, name: "Starter Kit", category: "Bundles", price: "$49.99", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100", sales: 23 },
];

const ClientProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientProducts, setClientProducts] = useState(initialClientProducts);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredProducts = clientProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: typeof availableProducts[0]) => {
    if (clientProducts.find((p) => p.id === product.id)) {
      toast({ title: "Already Added", description: "This product is already in your store.", variant: "destructive" });
      return;
    }
    setClientProducts([...clientProducts, { ...product, sales: 0 }]);
    toast({ title: "Product Added", description: `${product.name} has been added to your store.` });
  };

  const handleRemoveProduct = (productId: number) => {
    setClientProducts(clientProducts.filter((p) => p.id !== productId));
    toast({ title: "Product Removed", description: "Product has been removed from your store." });
  };

  const isProductAdded = (productId: number) => clientProducts.some((p) => p.id === productId);

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

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="stat-card group">
            <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <h3 className="font-medium mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <p className="text-lg font-bold">{product.price}</p>
              <p className="text-xs text-muted-foreground mb-3">Sales: {product.sales}</p>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Products to Your Store</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-h-[60vh] overflow-y-auto">
            {availableProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="font-bold">{product.price}</p>
                </div>
                <Button
                  variant={isProductAdded(product.id) ? "secondary" : "hero"}
                  size="sm"
                  onClick={() => handleAddProduct(product)}
                  disabled={isProductAdded(product.id)}
                >
                  {isProductAdded(product.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-1" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProducts;

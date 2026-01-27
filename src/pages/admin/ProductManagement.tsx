import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Package, Edit, Trash2, MoreHorizontal } from "lucide-react";
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

const productsData = [
  { id: 1, name: "Premium Widget", category: "Electronics", price: "$129.99", stock: 45, status: "active", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100" },
  { id: 2, name: "Basic Bundle", category: "Bundles", price: "$79.99", stock: 32, status: "active", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100" },
  { id: 3, name: "Pro Package", category: "Software", price: "$199.99", stock: 0, status: "out_of_stock", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100" },
  { id: 4, name: "Starter Kit", category: "Bundles", price: "$49.99", stock: 156, status: "active", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100" },
  { id: 5, name: "Enterprise Suite", category: "Software", price: "$299.99", stock: 23, status: "active", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100" },
];

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof productsData[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });

  const filteredProducts = productsData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    toast({ title: "Product Added", description: `${formData.name} has been added successfully.` });
    setShowAddDialog(false);
    setFormData({ name: "", category: "", price: "", stock: "", description: "" });
  };

  const handleEditProduct = () => {
    toast({ title: "Product Updated", description: `${selectedProduct?.name} has been updated.` });
    setShowEditDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productName: string) => {
    toast({ title: "Product Deleted", description: `${productName} has been removed.`, variant: "destructive" });
  };

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Products" 
          value={productsData.length} 
          icon={Package} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Active Products" 
          value={productsData.filter(p => p.status === "active").length} 
          icon={Package} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Out of Stock" 
          value={productsData.filter(p => p.status === "out_of_stock").length} 
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
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-lg font-bold">{product.price}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSelectedProduct(product);
                    setShowEditDialog(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteProduct(product.name)}
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

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <Input
                  placeholder="$0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Product Image</label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input defaultValue={selectedProduct?.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input defaultValue={selectedProduct?.category} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <Input defaultValue={selectedProduct?.price} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <Input type="number" defaultValue={selectedProduct?.stock} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleEditProduct}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;

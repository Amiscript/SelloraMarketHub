import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Mail, Phone, MapPin, Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// Store data (would come from database in real app)
const storeData = {
  name: "Demo Store",
  owner: "John Doe",
  email: "john@demostore.com",
  phone: "+1234567890",
  address: "123 Business Street, City",
  banners: [
    { id: 1, title: "Welcome to Demo Store", subtitle: "Best deals await you", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200" },
    { id: 2, title: "New Arrivals", subtitle: "Check out what's new", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200" },
  ],
  products: [
    { id: 1, name: "Premium Widget", price: 129.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", description: "High-quality premium widget for all your needs." },
    { id: 2, name: "Starter Kit", price: 49.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", description: "Perfect starter kit for beginners." },
    { id: 3, name: "Pro Package", price: 199.99, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", description: "Professional package with all features." },
    { id: 4, name: "Basic Bundle", price: 79.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", description: "Essential bundle for everyday use." },
  ],
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const UserStorefront = () => {
  const { storeSlug } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  const addToCart = (product: typeof storeData.products[0]) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast({ title: "Added to Cart", description: `${product.name} added to your cart.` });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    toast({ title: "Proceeding to Payment", description: "Redirecting to Paystack..." });
    // In real app, integrate with Paystack here
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % storeData.banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + storeData.banners.length) % storeData.banners.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">{storeData.name}</h1>
              <p className="text-sm text-muted-foreground">by {storeData.owner}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowOrders(true)}>
                <Package className="w-4 h-4 mr-2" /> My Orders
              </Button>
              <Button variant="hero" onClick={() => setShowCart(true)} className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Carousel */}
      <section className="relative h-[400px] overflow-hidden">
        {storeData.banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-display font-bold text-primary-foreground mb-2">{banner.title}</h2>
                <p className="text-xl text-primary-foreground/80">{banner.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {storeData.banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBanner ? "bg-primary" : "bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-display font-bold mb-8">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeData.products.map((product) => (
            <div key={product.id} className="stat-card group">
              <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">${product.price}</span>
                <Button onClick={() => addToCart(product)}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Info */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-8">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{storeData.email}</p>
              </div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{storeData.phone}</p>
              </div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{storeData.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleCheckout}>
                    Checkout with Paystack
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders Dialog */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage My Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Enter your email or phone number used during purchase to view your orders.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Email or phone number"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              <Button onClick={() => toast({ title: "Searching...", description: "Looking up your orders." })}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center text-muted-foreground py-8">
              Enter your details above to find your orders
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserStorefront;

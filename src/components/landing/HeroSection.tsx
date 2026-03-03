import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, TrendingUp, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatWidget from "../chat/ChatWidget";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample product data - you can replace this with your actual data
  const products = [
    {
      id: 1,
      name: "Premium Smart Watch",
      category: "Electronics",
      price: "$299.99",
      discount: "$399.99",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      vendor: "TechGadgets Inc"
    },
    {
      id: 2,
      name: "Organic Coffee Beans",
      category: "Food & Beverage",
      price: "$24.99",
      discount: "$34.99",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w-400&h=400&fit=crop",
      vendor: "Nature's Best"
    },
    {
      id: 3,
      name: "Wireless Headphones",
      category: "Electronics",
      price: "$159.99",
      discount: "$199.99",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      vendor: "AudioPro"
    },
    {
      id: 4,
      name: "Yoga Mat Premium",
      category: "Fitness",
      price: "$49.99",
      discount: "$69.99",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
      vendor: "FitLife"
    },
    {
      id: 5,
      name: "Leather Backpack",
      category: "Fashion",
      price: "$89.99",
      discount: "$119.99",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      vendor: "Urban Style"
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 animate-slide-up">
            Empower Your Business with
            <span className="block gradient-text">Sellora MarketHub</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Manage products, track sales, and grow your business with our powerful multi-vendor marketplace solution. Everything you need in one place.
          </p>


          
          {/* Product Carousel Section */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-primary-foreground/60">
                Discover trending products from our top vendors
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl glass-card p-2">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {products.map((product) => (
                    <div key={product.id} className="w-full flex-shrink-0">
                      <div className="flex flex-col md:flex-row items-center p-6">
                        {/* Product Image */}
                        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-64 object-cover rounded-lg transform transition-transform duration-500 hover:scale-105"
                            />
                            {product.discount && (
                              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                                SALE
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="md:w-1/2 text-center md:text-left">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                            {product.category}
                          </span>
                          <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                            {product.name}
                          </h3>
                          <p className="text-primary-foreground/60 mb-4">
                            Sold by: <span className="font-semibold text-primary">{product.vendor}</span>
                          </p>
                          
                          {/* Rating */}
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating) 
                                      ? "fill-primary text-primary" 
                                      : "text-primary-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-primary-foreground font-medium">
                              {product.rating}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="text-3xl font-bold text-primary-foreground">
                              {product.price}
                            </span>
                            {product.discount && (
                              <span className="text-lg text-primary-foreground/50 line-through">
                                {product.discount}
                              </span>
                            )}
                          </div>

                          {/* View Product Button */}
                          <Button 
                            className="gap-2 group"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Product
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-primary-foreground" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? "bg-primary w-8" 
                        : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
            chat widget
          <ChatWidget />
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Users, label: "Active Users", value: "50K+" },
              { icon: TrendingUp, label: "Monthly Sales", value: "$2M+" },
              { icon: Shield, label: "Secure Payments", value: "100%" },
              { icon: Star, label: "Client Rating", value: "4.9/5" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
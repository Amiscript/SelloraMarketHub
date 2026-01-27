import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const benefits = [
  "Multi-vendor marketplace support",
  "Real-time analytics dashboard",
  "Secure payment processing",
  "Customizable storefronts",
  "24/7 customer support",
  "Mobile-responsive design",
];

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
              Empowering Businesses
              <span className="gradient-text"> Worldwide</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              MarketHub is a cutting-edge e-commerce platform designed to help businesses of all sizes create, manage, and grow their online presence. Our comprehensive suite of tools makes it easy to sell products, track sales, and manage customers.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" onClick={() => navigate("/client/register")}>
              Join MarketHub Today
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="stat-card">
                  <div className="text-3xl font-bold gradient-text">10K+</div>
                  <div className="text-muted-foreground">Active Clients</div>
                </div>
                <div className="stat-card bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <div className="text-3xl font-bold">$50M+</div>
                  <div className="text-primary-foreground/80">Total Sales</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="stat-card">
                  <div className="text-3xl font-bold gradient-text">99.9%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
                <div className="stat-card">
                  <div className="text-3xl font-bold gradient-text">150+</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

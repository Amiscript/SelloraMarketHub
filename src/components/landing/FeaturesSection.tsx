import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Image, 
  Settings, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description: "Complete control over your marketplace with real-time analytics, user management, and system settings.",
    color: "from-primary to-primary/70",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Verify, suspend, and manage client accounts with detailed profiles and activity tracking.",
    color: "from-accent to-accent/70",
  },
  {
    icon: ShoppingCart,
    title: "Product Management",
    description: "Add, edit, and organize products with categories, variants, and inventory tracking.",
    color: "from-success to-success/70",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Secure payment processing with Paystack integration and commission management.",
    color: "from-warning to-warning/70",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track sales, revenue, and performance with detailed reports and visualizations.",
    color: "from-primary to-accent",
  },
  {
    icon: Image,
    title: "Carousel Management",
    description: "Create stunning banner carousels to showcase products and promotions.",
    color: "from-accent to-primary",
  },
  {
    icon: Settings,
    title: "Sub-Admin System",
    description: "Create sub-admins with customizable permissions and role-based access control.",
    color: "from-success to-warning",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security with encrypted transactions and data protection.",
    color: "from-primary to-success",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-3 mb-6">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform provides all the tools you need to manage your online marketplace efficiently and grow your business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group stat-card hover:border-primary/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

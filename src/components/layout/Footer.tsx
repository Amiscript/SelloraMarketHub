import { Link } from "react-router-dom";
import { ShoppingBag, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold"> Sellora MarketHub</span>
            </Link>
            <p className="text-background/70 mb-6">
              The complete marketplace solution for modern businesses. Manage, sell, and grow with ease.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["About Us", "Features", "Pricing", "Contact"].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="text-background/70 hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">For Clients</h3>
            <ul className="space-y-3">
              {[
                { name: "Register", href: "/client/register" },
                { name: "Login", href: "/client/login" },
                { name: "Dashboard", href: "/client/dashboard" },
                { name: "Support", href: "#contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Admins */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">For Admins</h3>
            <ul className="space-y-3">
              {[
                { name: "Admin Login", href: "/admin/login" },
                { name: "Dashboard", href: "/admin/dashboard" },
                { name: "Documentation", href: "#" },
                { name: "API Reference", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} MarketHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

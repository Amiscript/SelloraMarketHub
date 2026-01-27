import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Building, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ClientSettings = () => {
  const [formData, setFormData] = useState({
    businessName: "Demo Store",
    fullName: "John Doe",
    email: "john@demostore.com",
    phone: "+1234567890",
    address: "123 Business Street, City, Country",
    bankName: "Chase Bank",
    accountNumber: "****4567",
    routingNumber: "****1234",
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and business information</p>
      </div>

      {/* Profile Section */}
      <div className="stat-card">
        <h2 className="text-lg font-display font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="pl-10"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="pl-10"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="stat-card">
        <h2 className="text-lg font-display font-semibold mb-4">Bank Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <Input
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Routing Number</label>
              <Input
                value={formData.routingNumber}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Store URL */}
      <div className="stat-card">
        <h2 className="text-lg font-display font-semibold mb-4">Store URL</h2>
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground mb-2">Your unique store URL:</p>
          <p className="font-mono text-primary">/store/demo-store</p>
        </div>
      </div>

      <Button variant="hero" size="lg" onClick={handleSave}>
        <Save className="w-4 h-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
};

export default ClientSettings;

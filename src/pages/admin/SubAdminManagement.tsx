import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, UserCog, Trash2, Mail, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

const subAdminsData = [
  { id: 1, name: "Sarah Johnson", email: "sarah@markethub.com", role: "Sub Admin", created: "2024-01-01", lastActive: "2024-01-15" },
  { id: 2, name: "Mike Peters", email: "mike@markethub.com", role: "Sub Admin", created: "2024-01-05", lastActive: "2024-01-14" },
  { id: 3, name: "Emily Davis", email: "emily@markethub.com", role: "Sub Admin", created: "2024-01-08", lastActive: "2024-01-15" },
];

const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState(subAdminsData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [generatedCredentials, setGeneratedCredentials] = useState({ email: "", password: "" });

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddSubAdmin = () => {
    const password = generatePassword();
    setGeneratedCredentials({ email: newAdmin.email, password });
    setShowAddDialog(false);
    setShowCredentialsDialog(true);
    
    // Add to list
    setSubAdmins([
      ...subAdmins,
      {
        id: subAdmins.length + 1,
        name: newAdmin.name,
        email: newAdmin.email,
        role: "Sub Admin",
        created: new Date().toISOString().split("T")[0],
        lastActive: "-",
      },
    ]);
    setNewAdmin({ name: "", email: "" });
  };

  const handleDeleteSubAdmin = (id: number, name: string) => {
    setSubAdmins(subAdmins.filter((admin) => admin.id !== id));
    toast({ title: "Sub-Admin Removed", description: `${name} has been removed from the system.`, variant: "destructive" });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const sendCredentialsEmail = () => {
    toast({ 
      title: "Email Sent!", 
      description: `Login credentials have been sent to ${generatedCredentials.email}.` 
    });
    setShowCredentialsDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Sub-Admin Management</h1>
          <p className="text-muted-foreground">Create and manage sub-administrator accounts</p>
        </div>
        <Button variant="hero" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Sub-Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title="Total Sub-Admins" 
          value={subAdmins.length} 
          icon={UserCog} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Active Today" 
          value={subAdmins.filter((a) => a.lastActive === "2024-01-15").length} 
          icon={UserCog} 
          iconColor="from-success to-success/70"
        />
      </div>

      {/* Sub-Admins List */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((admin) => (
                <tr key={admin.id} className="table-row-hover border-b border-border/50 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {admin.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{admin.email}</td>
                  <td className="py-3 px-4 text-muted-foreground">{admin.created}</td>
                  <td className="py-3 px-4 text-muted-foreground">{admin.lastActive}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubAdmin(admin.id, admin.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub-Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sub-Admin</DialogTitle>
            <DialogDescription>
              Create a new sub-administrator account. Credentials will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="admin@markethub.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleAddSubAdmin} disabled={!newAdmin.name || !newAdmin.email}>
                Create Sub-Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sub-Admin Created Successfully!</DialogTitle>
            <DialogDescription>
              Save these credentials or send them to the sub-admin via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{generatedCredentials.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(generatedCredentials.email, "Email")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="font-mono font-medium">{generatedCredentials.password}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(generatedCredentials.password, "Password")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>
                Close
              </Button>
              <Button variant="hero" onClick={sendCredentialsEmail}>
                <Mail className="w-4 h-4 mr-2" /> Send via Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAdminManagement;

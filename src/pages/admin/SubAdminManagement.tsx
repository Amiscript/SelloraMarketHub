import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  UserCog, 
  Trash2, 
  Mail, 
  Copy, 
  Eye, 
  Calendar, 
  Shield, 
  Activity, 
  User, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define sub-admin type
type SubAdmin = {
  id: number;
  name: string;
  email: string;
  role: string;
  created: string;
  lastActive: string;
  permissions: string[];
  status: "Active" | "Inactive" | "Suspended";
  phone?: string;
  department?: string;
  notes?: string;
};

// Available permissions
const availablePermissions = [
  "User Management",
  "Content Moderation",
  "Analytics View",
  "Reports",
  "System Settings",
  "Billing Management",
  "API Access",
  "Database Access",
  "Email Management"
];

// Available departments
const departments = [
  "Operations",
  "Support",
  "Marketing",
  "Development",
  "Finance",
  "Sales",
  "Administration"
];

const subAdminsData: SubAdmin[] = [
  { 
    id: 1, 
    name: "Sarah Johnson", 
    email: "sarah@markethub.com", 
    role: "Sub Admin", 
    created: "2024-01-01", 
    lastActive: "2024-01-15", 
    permissions: ["User Management", "Content Moderation"], 
    status: "Active",
    phone: "+1 (555) 123-4567",
    department: "Operations",
    notes: "Trusted team lead with full access to user management tools."
  },
  { 
    id: 2, 
    name: "Mike Peters", 
    email: "mike@markethub.com", 
    role: "Sub Admin", 
    created: "2024-01-05", 
    lastActive: "2024-01-14", 
    permissions: ["Analytics View", "Reports"], 
    status: "Active",
    phone: "+1 (555) 987-6543",
    department: "Marketing",
    notes: "Focuses on analytics and reporting. Limited access to user data."
  },
  { 
    id: 3, 
    name: "Emily Davis", 
    email: "emily@markethub.com", 
    role: "Sub Admin", 
    created: "2024-01-08", 
    lastActive: "2024-01-15", 
    permissions: ["User Management", "Content Moderation", "Analytics View"], 
    status: "Inactive",
    phone: "+1 (555) 456-7890",
    department: "Support",
    notes: "Currently on leave. Limited permissions active."
  },
];

const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>(subAdminsData);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [generatedCredentials, setGeneratedCredentials] = useState({ email: "", password: "" });
  const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubAdmin> | null>(null);

  // Initialize edit form when admin is selected
  useEffect(() => {
    if (selectedAdmin) {
      setEditForm({
        ...selectedAdmin,
        notes: selectedAdmin.notes || ""
      });
    }
  }, [selectedAdmin]);

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
    const newSubAdmin: SubAdmin = {
      id: subAdmins.length + 1,
      name: newAdmin.name,
      email: newAdmin.email,
      role: "Sub Admin",
      created: new Date().toISOString().split("T")[0],
      lastActive: "-",
      permissions: ["Basic Access"],
      status: "Active",
      phone: "",
      department: "Administration",
      notes: "New sub-admin. Please update profile details."
    };
    
    setSubAdmins([...subAdmins, newSubAdmin]);
    setNewAdmin({ name: "", email: "" });
  };

  const handleViewProfile = (admin: SubAdmin) => {
    setSelectedAdmin(admin);
    setShowProfileDialog(true);
  };

  const handleEditProfile = (admin: SubAdmin) => {
    setSelectedAdmin(admin);
    setShowEditDialog(true);
  };

  const handleSaveProfile = () => {
    if (!selectedAdmin || !editForm) return;

    const updatedAdmins = subAdmins.map(admin => 
      admin.id === selectedAdmin.id 
        ? { ...admin, ...editForm } as SubAdmin
        : admin
    );

    setSubAdmins(updatedAdmins);
    
    // Update selected admin for profile view
    setSelectedAdmin(prev => prev ? { ...prev, ...editForm } as SubAdmin : null);
    
    toast({ 
      title: "Profile Updated!", 
      description: `${editForm.name}'s profile has been successfully updated.`,
      variant: "default"
    });
    
    setShowEditDialog(false);
  };

  const handlePermissionToggle = (permission: string) => {
    if (!editForm) return;
    
    const currentPermissions = editForm.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    setEditForm({ ...editForm, permissions: newPermissions });
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

  const formatDate = (dateString: string) => {
    if (dateString === "-") return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return "bg-green-500/10 text-green-700 border-green-200";
      case "Inactive": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Suspended": return "bg-red-500/10 text-red-700 border-red-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Active": return <CheckCircle className="w-4 h-4" />;
      case "Inactive": return <AlertCircle className="w-4 h-4" />;
      case "Suspended": return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProfile(admin)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubAdmin(admin.id, admin.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete Sub-Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      {/* Profile View Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sub-Admin Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the sub-administrator
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6 pt-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary-foreground">
                      {selectedAdmin.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{selectedAdmin.name}</h3>
                      <Badge className={`${getStatusColor(selectedAdmin.status)} flex items-center gap-1`}>
                        {getStatusIcon(selectedAdmin.status)}
                        {selectedAdmin.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{selectedAdmin.role}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowProfileDialog(false);
                    handleEditProfile(selectedAdmin);
                  }}
                >
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                      <p className="font-medium">{selectedAdmin.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium">{selectedAdmin.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Admin ID</p>
                      <p className="font-mono font-medium">ADM-{selectedAdmin.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Activity
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Created</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedAdmin.created)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Last Active</p>
                      <p className="font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {formatDate(selectedAdmin.lastActive)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="font-medium">{selectedAdmin.department || "Not assigned"}</p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Permissions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAdmin.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold">Notes</h4>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      {selectedAdmin.notes || "No notes available."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  Close
                </Button>
                <Button variant="hero" onClick={() => {
                  setShowProfileDialog(false);
                  handleEditProfile(selectedAdmin);
                }}>
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub-Admin Profile</DialogTitle>
            <DialogDescription>
              Update sub-administrator information and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmin && editForm && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={editForm.department || ""}
                      onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Status</h3>
                <div className="flex items-center gap-4">
                  <Select
                    value={editForm.status || "Active"}
                    onValueChange={(value: "Active" | "Inactive" | "Suspended") => 
                      setEditForm({ ...editForm, status: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active" className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Active
                      </SelectItem>
                      <SelectItem value="Inactive" className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Inactive
                      </SelectItem>
                      <SelectItem value="Suspended" className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        Suspended
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    {editForm.status === "Active" && "User has full access to the system"}
                    {editForm.status === "Inactive" && "User access is temporarily disabled"}
                    {editForm.status === "Suspended" && "User access is suspended due to policy violation"}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Permissions</h3>
                  <div className="text-sm text-muted-foreground">
                    {editForm.permissions?.length || 0} of {availablePermissions.length} permissions selected
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePermissions.map((permission) => {
                    const isSelected = editForm.permissions?.includes(permission) || false;
                    return (
                      <div
                        key={permission}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/50 border-border hover:bg-muted"
                        }`}
                        onClick={() => handlePermissionToggle(permission)}
                      >
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => handlePermissionToggle(permission)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label className="cursor-pointer font-normal">{permission}</Label>
                      </div>
                    );
                  })}
                </div>
                {editForm.permissions?.length === 0 && (
                  <div className="text-center p-4 border border-dashed rounded-lg">
                    <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No permissions selected. User won't have access to any features.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Notes & Comments</h3>
                <Textarea
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Add notes about this sub-admin (e.g., responsibilities, restrictions, special instructions)..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  These notes are only visible to administrators.
                </p>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 border border-destructive/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Reset this user's password or permanently delete their account.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={() => {
                        toast({
                          title: "Password Reset",
                          description: `A password reset link has been sent to ${selectedAdmin.email}`,
                        });
                      }}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteSubAdmin(selectedAdmin.id, selectedAdmin.name);
                        setShowEditDialog(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dialog Footer */}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleSaveProfile}
                  disabled={!editForm.name || !editForm.email}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAdminManagement;
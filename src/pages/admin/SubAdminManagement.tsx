import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, RefreshCw, Shield, UserCog, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSubAdminStore, SubAdmin, SubAdminPermission } from "@/store/subAdmin.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Package, Image } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
];

const ALL_PERMISSIONS: { key: SubAdminPermission; label: string; description: string }[] = [
  { key: "manage_clients", label: "Manage Clients", description: "View, update and suspend clients" },
  { key: "manage_products", label: "Manage Products", description: "Create, edit, delete products" },
  { key: "manage_orders", label: "Manage Orders", description: "View and update order status" },
  { key: "manage_payments", label: "Manage Payments", description: "Approve and reject payments" },
  { key: "manage_carousel", label: "Manage Carousel", description: "Add and edit banner slides" },
  { key: "view_reports", label: "View Reports", description: "Access sales and analytics reports" },
  { key: "view_support", label: "View Support", description: "View support chats" },
  { key: "assign_chat", label: "Assign Chats", description: "Assign support chats to agents" },
  { key: "manage_support", label: "Manage Support", description: "Full support chat management" },
];

const SubAdminManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<SubAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubAdmin | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<SubAdminPermission[]>([]);

  const { subAdmins, isLoading, isSubmitting, fetchSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin } = useSubAdminStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchSubAdmins(); }, []);

  const openCreate = () => {
    setEditTarget(null); setName(""); setEmail(""); setSelectedPermissions([]); setShowDialog(true);
  };
  const openEdit = (sa: SubAdmin) => {
    setEditTarget(sa); setName(sa.name); setEmail(sa.email); setSelectedPermissions([...sa.permissions]); setShowDialog(true);
  };

  const togglePermission = (p: SubAdminPermission) => {
    setSelectedPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSubmit = async () => {
    if (!name || (!editTarget && !email)) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
    try {
      if (editTarget) {
        await updateSubAdmin(editTarget._id, { permissions: selectedPermissions });
        toast({ title: "Sub-Admin Updated", description: "Permissions have been updated." });
      } else {
        await createSubAdmin({ name, email, permissions: selectedPermissions });
        toast({ title: "Sub-Admin Created", description: "Account created and credentials sent via email." });
      }
      setShowDialog(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubAdmin(deleteTarget._id);
      toast({ title: "Sub-Admin Deleted", variant: "destructive" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggleActive = async (sa: SubAdmin) => {
    try {
      await updateSubAdmin(sa._id, { isActive: !sa.isActive });
      toast({ title: `Sub-Admin ${sa.isActive ? "deactivated" : "activated"}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Sub-Admin Management</h1>
              <p className="text-muted-foreground">Manage admin team members and their permissions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSubAdmins} disabled={isLoading}><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh</Button>
              <Button variant="hero" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Sub-Admin</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center"><Shield className="w-7 h-7 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{subAdmins.length}</p><p className="text-sm text-muted-foreground">Total</p></div>
            <div className="stat-card text-center"><UserCog className="w-7 h-7 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{subAdmins.filter(s => s.isActive).length}</p><p className="text-sm text-muted-foreground">Active</p></div>
            <div className="stat-card text-center"><Clock className="w-7 h-7 text-muted-foreground mx-auto mb-2" /><p className="text-2xl font-bold">{subAdmins.filter(s => !s.isActive).length}</p><p className="text-sm text-muted-foreground">Inactive</p></div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
          ) : subAdmins.length === 0 ? (
            <div className="stat-card text-center py-12 text-muted-foreground">No sub-admins yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subAdmins.map((sa) => (
                <div key={sa._id} className="stat-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{sa.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{sa.name}</p>
                        <p className="text-xs text-muted-foreground">{sa.email}</p>
                      </div>
                    </div>
                    <Badge className={sa.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{sa.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sa.permissions.map(p => <Badge key={p} variant="secondary" className="text-xs capitalize">{p.replace(/_/g, " ")}</Badge>)}
                    {sa.permissions.length === 0 && <p className="text-xs text-muted-foreground">No permissions assigned</p>}
                  </div>
                  {sa.lastLogin && <p className="text-xs text-muted-foreground mb-3">Last login: {new Date(sa.lastLogin).toLocaleDateString()}</p>}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(sa)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(sa)}>
                      {sa.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(sa)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Sub-Admin" : "Add Sub-Admin"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editTarget && (
              <>
                <div className="space-y-1"><Label>Name *</Label><Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Email *</Label><Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <p className="text-xs text-muted-foreground">A random password will be generated and sent to the email address.</p>
              </>
            )}
            {editTarget && <p className="text-sm font-medium">Editing permissions for: <span className="text-primary">{editTarget.name}</span></p>}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                {ALL_PERMISSIONS.map(({ key, label, description }) => (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => togglePermission(key)}>
                    <Checkbox checked={selectedPermissions.includes(key)} onCheckedChange={() => togglePermission(key)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button className="flex-1" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? "Saving…" : editTarget ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Sub-Admin</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={isSubmitting} onClick={handleDelete}>{isSubmitting ? "Deleting…" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAdminManagement;

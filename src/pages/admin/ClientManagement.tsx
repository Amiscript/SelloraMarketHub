import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, UserCheck, UserX, Users, MoreHorizontal, Eye, Store,
  Mail, Phone, Home, MapPin, Building, CreditCard, Shield,
  Calendar, DollarSign, FileText, CheckCircle, AlertCircle,
  XCircle, Globe, BanknoteIcon, Briefcase, IdCard, RefreshCw,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useClientManagementStore, Client } from "@/store/clientManagement.store";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard, ShoppingCart, CreditCard as CreditCardIcon,
  Package, Image, UserCog, TrendingUp,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCardIcon },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    verified: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    suspended: "bg-muted text-muted-foreground",
  };
  return map[status] || map.pending;
};

const ClientManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ client: Client; action: string } | null>(null);
  const [page, setPage] = useState(1);

  const { clients, total, totalPages, currentPage, stats, isLoading, isSubmitting, fetchClients, fetchClientStats, updateClientStatus, deleteClient } = useClientManagementStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchClients({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { fetchClientStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (client: Client, newStatus: string) => {
    try {
      await updateClientStatus(client._id, newStatus);
      toast({ title: "Status Updated", description: `${client.name} is now ${newStatus}.` });
      setConfirmAction(null);
        fetchClientStats();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      await deleteClient(client._id);
      toast({ title: "Client Deleted", description: `${client.name} has been removed.`, variant: "destructive" });
      setConfirmAction(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Client Management</h1>
              <p className="text-muted-foreground">Manage all registered store clients</p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard title="Total Clients" value={stats?.totalClients?.toString() ?? "—"} icon={Users} iconColor="from-primary to-primary/70" />
  <StatCard title="Verified" value={stats?.verifiedClients?.toString() ?? "—"} icon={UserCheck} iconColor="from-success to-success/70" />
  <StatCard title="Pending" value={stats?.pendingClients?.toString() ?? "—"} icon={AlertCircle} iconColor="from-warning to-warning/70" />
  <StatCard title="Suspended" value={stats?.suspendedClients?.toString() ?? "—"} icon={UserX} iconColor="from-destructive to-destructive/70" />
</div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, store…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all","verified","pending","rejected","suspended"].map((s) => (
                <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">{s}</Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Store</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><Skeleton className="h-10 w-40" /></td>
                        <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-36" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></td>
                      </tr>
                    ))
                  ) : clients.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No clients found</td></tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client._id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={client.profileImage?.url} />
                              <AvatarFallback>{client.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm font-medium">{client.storeName}</p>
                          <p className="text-xs text-muted-foreground">/{client.storeSlug}</p>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <p className="text-sm">{client.phone || "—"}</p>
                          <p className="text-xs text-muted-foreground">{client.city}, {client.country}</p>
                        </td>
                        <td className="p-4">
<Badge className={`capitalize border ${statusBadge(client.verificationStatus)}`}>
  {client.verificationStatus}
</Badge>
                      </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/store/${client.storeSlug}`, "_blank")}>
                                <Store className="w-4 h-4 mr-2" /> Visit Store
                              </DropdownMenuItem>
                              {client.verificationStatus !== "verified" && (
  <DropdownMenuItem className="text-success" onClick={() => setConfirmAction({ client, action: "verify" })}>
    <UserCheck className="w-4 h-4 mr-2" /> Verify
  </DropdownMenuItem>
)}
{client.verificationStatus !== "suspended" ? (
  <DropdownMenuItem className="text-warning" onClick={() => setConfirmAction({ client, action: "suspend" })}>
    <UserX className="w-4 h-4 mr-2" /> Suspend
  </DropdownMenuItem>
) : (
  <DropdownMenuItem className="text-success" onClick={() => setConfirmAction({ client, action: "verify" })}>
    <UserCheck className="w-4 h-4 mr-2" /> Unsuspend
  </DropdownMenuItem>
)}
<DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ client, action: "delete" })}>
  <XCircle className="w-4 h-4 mr-2" /> Delete
</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {clients.length} of {total} clients</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="store">Store</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedClient.profileImage?.url} />
                    <AvatarFallback className="text-xl">{selectedClient.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    <Badge className={`capitalize border mt-1 ${statusBadge(selectedClient.verificationStatus)}`}>{selectedClient.verificationStatus}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{selectedClient.phone || "—"}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>DOB: {selectedClient.dateOfBirth ? new Date(selectedClient.dateOfBirth).toLocaleDateString() : "—"}</span></div>
                  <div className="flex items-center gap-2 col-span-2"><Home className="w-4 h-4 text-muted-foreground" /><span>{selectedClient.residentialAddress || "—"}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{[selectedClient.city, selectedClient.state, selectedClient.country].filter(Boolean).join(", ") || "—"}</span></div>
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /><span>{selectedClient.currentLocation || "—"}</span></div>
                </div>

                {selectedClient.grantor && (
                  <>
                    <Separator />
                    <h4 className="font-medium text-sm">Grantor Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                      <div><span className="text-muted-foreground">Name: </span>{selectedClient.grantor.name}</div>
                      <div><span className="text-muted-foreground">Relationship: </span>{selectedClient.grantor.relationship}</div>
                      <div><span className="text-muted-foreground">Phone: </span>{selectedClient.grantor.phone}</div>
                      <div><span className="text-muted-foreground">Email: </span>{selectedClient.grantor.email}</div>
                      {selectedClient.grantor.occupation && <div className="col-span-2"><span className="text-muted-foreground">Occupation: </span>{selectedClient.grantor.occupation}</div>}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="store" className="space-y-4">
                {selectedClient.banner?.url && (
                  <img src={selectedClient.banner.url} className="w-full h-32 object-cover rounded-lg" alt="Store banner" />
                )}
                <div className="flex items-center gap-3">
                  {selectedClient.logo?.url && <img src={selectedClient.logo.url} className="w-12 h-12 rounded-lg object-cover" alt="Logo" />}
                  <div>
                    <p className="font-semibold">{selectedClient.storeName}</p>
                    <p className="text-sm text-muted-foreground">/{selectedClient.storeSlug}</p>
                  </div>
                </div>
                {selectedClient.storeDescription && <p className="text-sm text-muted-foreground">{selectedClient.storeDescription}</p>}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Store Status</p><Badge className={`capitalize mt-1 border ${statusBadge(selectedClient.storeStatus)}`}>{selectedClient.storeStatus}</Badge></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Commission Rate</p><p className="font-semibold">{selectedClient.commissionRate}%</p></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Total Earnings</p><p className="font-semibold">₦{selectedClient.totalEarnings?.toLocaleString()}</p></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Pending Balance</p><p className="font-semibold">₦{selectedClient.pendingBalance?.toLocaleString()}</p></div>
                </div>
              </TabsContent>

              <TabsContent value="banking" className="space-y-4">
                {selectedClient.bankDetails ? (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
                    <div className="flex items-center gap-2 font-medium"><BanknoteIcon className="w-4 h-4 text-primary" /> Bank Details</div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground">Bank: </span>{selectedClient.bankDetails.bankName}</div>
                      <div><span className="text-muted-foreground">Account Type: </span>{selectedClient.bankDetails.accountType}</div>
                      <div><span className="text-muted-foreground">Account Name: </span>{selectedClient.bankDetails.accountName}</div>
                      <div><span className="text-muted-foreground">Account No: </span>****{selectedClient.bankDetails.accountNumber?.slice(-4)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">No banking details provided</p>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">ID Card Front</p>
                    {selectedClient.idCardFront?.url ? (
                      <img src={selectedClient.idCardFront.url} className="w-full h-40 object-cover rounded-lg border" alt="ID Front" />
                    ) : (
                      <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">Not uploaded</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">ID Card Back</p>
                    {selectedClient.idCardBack?.url ? (
                      <img src={selectedClient.idCardBack.url} className="w-full h-40 object-cover rounded-lg border" alt="ID Back" />
                    ) : (
                      <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">Not uploaded</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          {confirmAction && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {confirmAction.action === "delete"
                  ? `Are you sure you want to permanently delete ${confirmAction.client.name}? This cannot be undone.`
                  : `Are you sure you want to ${confirmAction.action} ${confirmAction.client.name}?`}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button
                  variant={confirmAction.action === "delete" ? "destructive" : "default"}
                  disabled={isSubmitting}
                  onClick={() => {
                    if (confirmAction.action === "delete") handleDelete(confirmAction.client);
                    else if (confirmAction.action === "verify") handleStatusChange(confirmAction.client, "verified");
                    else if (confirmAction.action === "suspend") handleStatusChange(confirmAction.client, "suspended");
                  }}
                >
                  {isSubmitting ? "Processing…" : confirmAction.action === "delete" ? "Delete" : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;

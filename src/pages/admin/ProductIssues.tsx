import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw, Package,
  LayoutDashboard, ShoppingCart, Users, CreditCard, Image, UserCog,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProductIssueStore, ProductIssue, IssueStatus } from "../../store/productIssue.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Product Issues", href: "/admin/product-issues", icon: AlertTriangle },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
];

const issueTypeLabels: Record<string, string> = {
  wrong_info: "Wrong Information",
  wrong_price: "Wrong Price",
  bad_images: "Bad / Missing Images",
  out_of_stock: "Out of Stock",
  pricing_issue: "Pricing Issue",
  other: "Other",
};

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  in_review: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  dismissed: "bg-muted text-muted-foreground",
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <AlertTriangle className="w-4 h-4" />,
  in_review: <Clock className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
  dismissed: <XCircle className="w-4 h-4" />,
};

const ProductIssues = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<ProductIssue | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState<IssueStatus>("in_review");

  const { issues, stats, total, isLoading, isSubmitting, fetchAllIssues, updateIssueStatus } = useProductIssueStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchAllIssues({ status: statusFilter }); }, [statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedIssue) return;
    try {
      await updateIssueStatus(selectedIssue._id, newStatus, adminNote);
      toast({ title: "Issue Updated", description: `Status changed to ${newStatus}` });
      setSelectedIssue(null);
      setAdminNote("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openIssue = (issue: ProductIssue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setAdminNote(issue.adminNote || "");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Product Issues</h1>
              <p className="text-muted-foreground">Issues reported by clients on catalog products</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchAllIssues({ status: statusFilter })} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card text-center p-4 border-l-4 border-destructive">
              <p className="text-2xl font-bold text-destructive">{stats?.open ?? 0}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
            <div className="stat-card text-center p-4 border-l-4 border-warning">
              <p className="text-2xl font-bold text-warning">{stats?.in_review ?? 0}</p>
              <p className="text-sm text-muted-foreground">In Review</p>
            </div>
            <div className="stat-card text-center p-4 border-l-4 border-success">
              <p className="text-2xl font-bold text-success">{stats?.resolved ?? 0}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label>Filter:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{total} issue(s)</span>
          </div>

          {/* Issues List */}
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : issues.length === 0 ? (
            <div className="stat-card text-center py-16">
              <CheckCircle className="w-12 h-12 text-success/40 mx-auto mb-3" />
              <p className="font-semibold">No issues found</p>
              <p className="text-muted-foreground text-sm">All products are in good standing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map(issue => {
                const product = typeof issue.product === "object" ? issue.product : null;
                const reporter = typeof issue.reportedBy === "object" ? issue.reportedBy : null;
                return (
                  <div key={issue._id} className="stat-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => openIssue(issue)}>
                    <div className="flex items-start gap-4">
                      {/* Product image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        {product?.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold truncate">{product?.name || "Unknown Product"}</p>
                          <Badge className={`text-xs flex items-center gap-1 ${statusColors[issue.status]}`}>
                            {statusIcons[issue.status]}<span className="capitalize">{issue.status.replace("_", " ")}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">{issueTypeLabels[issue.issueType]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>By: {reporter?.storeName || reporter?.name || "Unknown"}</span>
                          <span>•</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="shrink-0">Review</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Issue</DialogTitle>
            <DialogDescription>
              {typeof selectedIssue?.product === "object" ? selectedIssue.product.name : "Product issue"}
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4 py-2">
              {/* Issue info */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{issueTypeLabels[selectedIssue.issueType]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reported by</span>
                  <span className="font-medium">
                    {typeof selectedIssue.reportedBy === "object"
                      ? selectedIssue.reportedBy.storeName || selectedIssue.reportedBy.name
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="bg-background rounded p-2 text-sm">{selectedIssue.description}</p>
                </div>
              </div>

              {/* Update status */}
              <div>
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as IssueStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Note (shown to client)</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Explain what was done or why this was dismissed..."
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedIssue(null)}>Cancel</Button>
                <Button className="flex-1" disabled={isSubmitting} onClick={handleUpdateStatus}>
                  {isSubmitting ? "Saving…" : "Update Issue"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductIssues;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, DollarSign, Clock, CheckCircle, Users, MoreHorizontal, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

const paymentsData = [
  { id: 1, client: "Store A", product: "Premium Widget", commission: "$12.99", amount: "$129.99", date: "2024-01-15", bank: "Chase ****4567", status: "pending" },
  { id: 2, client: "Store B", product: "Basic Bundle", commission: "$7.99", amount: "$79.99", date: "2024-01-14", bank: "Wells Fargo ****1234", status: "approved" },
  { id: 3, client: "Store C", product: "Pro Package", commission: "$19.99", amount: "$199.99", date: "2024-01-13", bank: "BOA ****7890", status: "pending" },
  { id: 4, client: "Store D", product: "Starter Kit", commission: "$4.99", amount: "$49.99", date: "2024-01-12", bank: "Citi ****5678", status: "rejected" },
  { id: 5, client: "Store E", product: "Enterprise Suite", commission: "$29.99", amount: "$299.99", date: "2024-01-11", bank: "Chase ****9012", status: "approved" },
];

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof paymentsData[0] | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredPayments = paymentsData.filter(
    (payment) =>
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = () => {
    toast({
      title: "Payment Approved",
      description: `Payment for ${selectedPayment?.client} has been approved and email sent.`,
    });
    setShowApproveDialog(false);
    setSelectedPayment(null);
  };

  const handleReject = () => {
    toast({
      title: "Payment Rejected",
      description: `Payment for ${selectedPayment?.client} has been rejected. Reason sent via email.`,
      variant: "destructive",
    });
    setShowRejectDialog(false);
    setSelectedPayment(null);
    setRejectReason("");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-success/10 text-success",
      pending: "bg-warning/10 text-warning",
      rejected: "bg-destructive/10 text-destructive",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Payment Management</h1>
        <p className="text-muted-foreground">Manage client commissions and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Payments" 
          value="$759.95" 
          icon={DollarSign} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Pending" 
          value="$329.98" 
          icon={Clock} 
          iconColor="from-warning to-warning/70"
        />
        <StatCard 
          title="Total Paid" 
          value="$379.98" 
          icon={CheckCircle} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Verified Clients" 
          value="42" 
          icon={Users} 
          iconColor="from-accent to-accent/70"
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
        />
      </div>

      {/* Payments Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bank Details</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="table-row-hover border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium">{payment.client}</td>
                  <td className="py-3 px-4">{payment.product}</td>
                  <td className="py-3 px-4 text-muted-foreground">{payment.commission}</td>
                  <td className="py-3 px-4 font-medium">{payment.amount}</td>
                  <td className="py-3 px-4 text-muted-foreground">{payment.date}</td>
                  <td className="py-3 px-4 text-muted-foreground">{payment.bank}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowApproveDialog(true);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectDialog(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Upload supporting documents and confirm the payment approval for {selectedPayment?.client}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Document</label>
              <Input type="file" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea placeholder="Add any notes about this approval..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleApprove}>
                Approve & Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the payment for {selectedPayment?.client}. This will be sent via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
              <Textarea
                placeholder="Explain why this payment is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject & Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;

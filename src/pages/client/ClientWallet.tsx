// ClientWallet.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight, DollarSign, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useWalletStore } from "@/store/wallet.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, CreditCard, Package, Image, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/client/products", icon: Package },
  { name: "Orders", href: "/client/orders", icon: ShoppingCart },
  { name: "Sales", href: "/client/sales", icon: TrendingUp },
  { name: "Payments", href: "/client/payments", icon: CreditCard },
  { name: "Wallet", href: "/client/wallet", icon: Wallet },
  { name: "Carousel", href: "/client/carousel", icon: Image },
  { name: "Settings", href: "/client/settings", icon: Settings },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const ClientWallet = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [page, setPage] = useState(1);

  const { balance, transactions, total, totalPages, currentPage, isLoading, isWithdrawing, fetchBalance, fetchTransactions, requestWithdrawal } = useWalletStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchTransactions(page); }, [page]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }
    if (amount > (balance?.availableBalance ?? 0)) { toast({ title: "Insufficient balance", description: "You don't have enough available balance.", variant: "destructive" }); return; }
    try {
      await requestWithdrawal(amount);
      toast({ title: "Withdrawal Requested", description: "Your withdrawal request has been submitted and is pending approval." });
      setWithdrawDialog(false); setWithdrawAmount("");
      fetchTransactions(1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Withdrawal failed", variant: "destructive" });
    }
  };

  const txStatusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning", approved: "bg-blue-500/10 text-blue-500",
    paid: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-display font-bold mb-1">Wallet</h1><p className="text-muted-foreground">Manage your earnings and withdrawals</p></div>
            <Button variant="outline" size="sm" onClick={() => fetchTransactions(page)} disabled={isLoading}><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-primary-foreground/10"><Wallet className="w-5 h-5" /></div><p className="text-sm opacity-80">Available Balance</p></div>
              <p className="text-3xl font-bold">{fmt(balance?.availableBalance ?? 0)}</p>
              <Button className="mt-4 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 w-full" variant="outline" onClick={() => setWithdrawDialog(true)} disabled={!balance?.availableBalance}>
                Withdraw Funds
              </Button>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-success/10"><TrendingUp className="w-5 h-5 text-success" /></div><p className="text-sm text-muted-foreground">Total Earnings</p></div>
              <p className="text-2xl font-bold">{fmt(balance?.totalEarnings ?? 0)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-warning/10"><DollarSign className="w-5 h-5 text-warning" /></div><p className="text-sm text-muted-foreground">Pending Balance</p></div>
              <p className="text-2xl font-bold">{fmt(balance?.pendingBalance ?? 0)}</p>
            </div>
          </div>

          <div className="stat-card overflow-hidden p-0">
            <div className="p-4 border-b"><h2 className="font-semibold">Transaction History</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b bg-muted/40"><th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th><th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th></tr></thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <tr key={i} className="border-b">{[...Array(5)].map((_, j) => <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>)}</tr>)
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No transactions yet</td></tr>
                  ) : transactions.map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className={`p-2 rounded-full w-fit ${tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"}`}>
                          {tx.type === "credit" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{tx.description}</td>
                      <td className="p-4"><p className={`font-semibold text-sm ${tx.type === "credit" ? "text-success" : "text-destructive"}`}>{tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}</p></td>
                      <td className="p-4"><Badge className={`capitalize ${txStatusColors[tx.status] || ""}`}>{tx.status}</Badge></td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{transactions.length} of {total}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={withdrawDialog} onOpenChange={setWithdrawDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle><DialogDescription>Available: {fmt(balance?.availableBalance ?? 0)}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Amount (₦)</Label><Input type="number" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /></div>
            {user && (user as any).bankDetails && (
              <div className="bg-muted/30 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Withdrawal to:</p>
                <p>{(user as any).bankDetails.bankName}</p>
                <p className="text-muted-foreground">****{(user as any).bankDetails.accountNumber?.slice(-4)} • {(user as any).bankDetails.accountName}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWithdrawDialog(false)}>Cancel</Button>
              <Button className="flex-1" disabled={isWithdrawing || !withdrawAmount} onClick={handleWithdraw}>{isWithdrawing ? "Submitting…" : "Request Withdrawal"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientWallet;

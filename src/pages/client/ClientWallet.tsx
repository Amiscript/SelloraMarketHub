import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const walletTransactions = [
  { id: 1, type: "credit", description: "Commission Payment", amount: 125.50, date: "2024-01-15", status: "completed", reference: "REF-001" },
  { id: 2, type: "debit", description: "Withdrawal", amount: 50.00, date: "2024-01-14", status: "completed", reference: "REF-002" },
  { id: 3, type: "credit", description: "Sale Commission", amount: 34.99, date: "2024-01-13", status: "completed", reference: "REF-003" },
  { id: 4, type: "credit", description: "Bonus", amount: 25.00, date: "2024-01-12", status: "pending", reference: "REF-004" },
  { id: 5, type: "credit", description: "Product Sale", amount: 89.99, date: "2024-01-11", status: "completed", reference: "REF-005" },
  { id: 6, type: "debit", description: "Service Fee", amount: 5.00, date: "2024-01-10", status: "completed", reference: "REF-006" },
];

const ClientWallet = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTransactions = walletTransactions.filter((transaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBalance = walletTransactions
    .filter(t => t.status === "completed")
    .reduce((acc, transaction) => {
      return transaction.type === "credit" ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

  const availableBalance = walletTransactions
    .filter(t => t.status === "completed")
    .reduce((acc, transaction) => {
      return transaction.type === "credit" ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

  const pendingBalance = walletTransactions
    .filter(t => t.status === "pending")
    .filter(t => t.type === "credit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">My Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="hero">
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available</p>
              <p className="text-3xl font-bold">${availableBalance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="table-row-hover border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium">{transaction.description}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{transaction.reference}</td>
                  <td className="py-3 px-4 text-muted-foreground">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      transaction.type === "credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${transaction.type === "credit" ? "text-success" : "text-destructive"}`}>
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      transaction.status === "completed" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientWallet;
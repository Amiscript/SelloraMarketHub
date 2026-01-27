import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const paymentsData = [
  { id: 1, product: "Premium Widget", amount: "$129.99", commission: "$12.99", date: "2024-01-15", status: "approved" },
  { id: 2, product: "Starter Kit", amount: "$49.99", commission: "$4.99", date: "2024-01-14", status: "pending" },
  { id: 3, product: "Premium Widget", amount: "$129.99", commission: "$12.99", date: "2024-01-13", status: "approved" },
  { id: 4, product: "Starter Kit", amount: "$49.99", commission: "$4.99", date: "2024-01-12", status: "rejected" },
];

const ClientPayments = () => {
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
        <p className="text-muted-foreground">View all your commission payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Earnings" 
          value="$359.96" 
          icon={DollarSign} 
          iconColor="from-primary to-accent"
        />
        <StatCard 
          title="Pending" 
          value="$4.99" 
          icon={Clock} 
          iconColor="from-warning to-warning/70"
        />
        <StatCard 
          title="Approved" 
          value="$25.98" 
          icon={CheckCircle} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Rejected" 
          value="$4.99" 
          icon={XCircle} 
          iconColor="from-destructive to-destructive/70"
        />
      </div>

      {/* Payments Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData.map((payment) => (
                <tr key={payment.id} className="table-row-hover border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium">{payment.product}</td>
                  <td className="py-3 px-4">{payment.amount}</td>
                  <td className="py-3 px-4 font-medium text-success">{payment.commission}</td>
                  <td className="py-3 px-4 text-muted-foreground">{payment.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(payment.status)}`}>
                      {payment.status}
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

export default ClientPayments;

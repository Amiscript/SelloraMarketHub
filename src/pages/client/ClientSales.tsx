import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";

const salesData = [
  { id: 1, product: "Premium Widget", customer: "John Doe", phone: "+1234567890", email: "john@email.com", date: "2024-01-15", amount: "$129.99", status: "Delivered" },
  { id: 2, product: "Starter Kit", customer: "Jane Smith", phone: "+0987654321", email: "jane@email.com", date: "2024-01-14", amount: "$49.99", status: "Shipped" },
  { id: 3, product: "Premium Widget", customer: "Bob Wilson", phone: "+1122334455", email: "bob@email.com", date: "2024-01-13", amount: "$129.99", status: "Processing" },
];

const ClientSales = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = salesData.filter(
    (sale) =>
      sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Sales Management</h1>
          <p className="text-muted-foreground">Track all sales from your storefront</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
        />
      </div>

      {/* Sales Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="table-row-hover border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium">{sale.product}</td>
                  <td className="py-3 px-4">{sale.customer}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sale.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sale.email}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sale.date}</td>
                  <td className="py-3 px-4 font-medium">{sale.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === "Delivered" ? "bg-success/10 text-success" :
                      sale.status === "Shipped" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {sale.status}
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

export default ClientSales;

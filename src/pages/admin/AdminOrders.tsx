import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  Building,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StatCard from "@/components/dashboard/StatCard";

// Sample orders data with complete tracking information
const ordersData = [
  {
    id: "ORD-001",
    client: {
      name: "Store A",
      id: "CL-001",
      storeUrl: "/store/store-a",
    },
    customer: {
      name: "John Doe",
      phone: "+1 (234) 567-8900",
      email: "john@example.com",
      location: "123 Main St, New York, NY 10001",
      shippingAddress: "456 Delivery Ave, Brooklyn, NY 11201",
    },
    products: [
      { name: "Premium Widget", quantity: 1, price: 129.99 },
      { name: "Accessory Kit", quantity: 2, price: 29.99 },
    ],
    payment: {
      amount: 189.97,
      method: "Credit Card",
      transactionId: "TXN-789012",
      date: "2024-01-15 14:30:00",
      status: "completed",
      commission: 18.99,
    },
    status: "delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    estimatedDelivery: "2024-01-20",
    trackingNumber: "TRK-789456123",
    shippingMethod: "Express Delivery",
    notes: "Customer requested morning delivery",
    adminNotes: "High priority client",
  },
  {
    id: "ORD-002",
    client: {
      name: "Store B",
      id: "CL-002",
      storeUrl: "/store/store-b",
    },
    customer: {
      name: "Jane Smith",
      phone: "+1 (987) 654-3210",
      email: "jane@example.com",
      location: "789 Oak St, Los Angeles, CA 90001",
      shippingAddress: "101 Pine St, Santa Monica, CA 90401",
    },
    products: [
      { name: "Starter Kit", quantity: 1, price: 49.99 },
    ],
    payment: {
      amount: 49.99,
      method: "PayPal",
      transactionId: "TXN-123456",
      date: "2024-01-14 10:15:00",
      status: "completed",
      commission: 4.99,
    },
    status: "shipped",
    orderDate: "2024-01-14",
    estimatedDelivery: "2024-01-18",
    trackingNumber: "TRK-456789123",
    shippingMethod: "Standard Delivery",
    notes: "",
    adminNotes: "New client, monitor delivery",
  },
  {
    id: "ORD-003",
    client: {
      name: "Store C",
      id: "CL-003",
      storeUrl: "/store/store-c",
    },
    customer: {
      name: "Bob Wilson",
      phone: "+1 (555) 123-4567",
      email: "bob@example.com",
      location: "321 Elm St, Chicago, IL 60601",
      shippingAddress: "654 Maple Dr, Evanston, IL 60201",
    },
    products: [
      { name: "Pro Package", quantity: 1, price: 199.99 },
      { name: "Extended Warranty", quantity: 1, price: 39.99 },
    ],
    payment: {
      amount: 239.98,
      method: "Bank Transfer",
      transactionId: "TXN-987654",
      date: "2024-01-13 16:45:00",
      status: "pending",
      commission: 23.99,
    },
    status: "processing",
    orderDate: "2024-01-13",
    estimatedDelivery: "2024-01-20",
    trackingNumber: "",
    shippingMethod: "Standard Delivery",
    notes: "Waiting for payment confirmation",
    adminNotes: "Payment verification needed",
  },
  {
    id: "ORD-004",
    client: {
      name: "Store D",
      id: "CL-004",
      storeUrl: "/store/store-d",
    },
    customer: {
      name: "Alice Johnson",
      phone: "+1 (222) 333-4444",
      email: "alice@example.com",
      location: "555 Cedar St, Miami, FL 33101",
      shippingAddress: "777 Beach Blvd, Miami Beach, FL 33139",
    },
    products: [
      { name: "Premium Widget", quantity: 2, price: 129.99 },
    ],
    payment: {
      amount: 259.98,
      method: "Credit Card",
      transactionId: "TXN-654321",
      date: "2024-01-12 09:20:00",
      status: "completed",
      commission: 25.99,
    },
    status: "delivered",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-16",
    estimatedDelivery: "2024-01-16",
    trackingNumber: "TRK-321654987",
    shippingMethod: "Express Delivery",
    notes: "Delivered successfully",
    adminNotes: "Repeat customer",
  },
  {
    id: "ORD-005",
    client: {
      name: "Store E",
      id: "CL-005",
      storeUrl: "/store/store-e",
    },
    customer: {
      name: "Charlie Brown",
      phone: "+1 (777) 888-9999",
      email: "charlie@example.com",
      location: "888 Birch St, Seattle, WA 98101",
      shippingAddress: "999 Rainier Ave, Bellevue, WA 98004",
    },
    products: [
      { name: "Basic Bundle", quantity: 1, price: 79.99 },
      { name: "Add-on Pack", quantity: 3, price: 19.99 },
    ],
    payment: {
      amount: 139.96,
      method: "PayPal",
      transactionId: "TXN-111222",
      date: "2024-01-11 13:10:00",
      status: "refunded",
      commission: 0,
    },
    status: "cancelled",
    orderDate: "2024-01-11",
    cancellationDate: "2024-01-12",
    reason: "Customer changed mind",
    notes: "Full refund processed",
    adminNotes: "Refund completed",
  },
  {
    id: "ORD-006",
    client: {
      name: "Store F",
      id: "CL-006",
      storeUrl: "/store/store-f",
    },
    customer: {
      name: "David Lee",
      phone: "+1 (444) 555-6666",
      email: "david@example.com",
      location: "222 Pine St, Austin, TX 73301",
      shippingAddress: "333 Congress Ave, Austin, TX 78701",
    },
    products: [
      { name: "Enterprise Suite", quantity: 1, price: 299.99 },
    ],
    payment: {
      amount: 299.99,
      method: "Credit Card",
      transactionId: "TXN-333444",
      date: "2024-01-10 11:30:00",
      status: "completed",
      commission: 29.99,
    },
    status: "pending",
    orderDate: "2024-01-10",
    estimatedDelivery: "2024-01-17",
    trackingNumber: "",
    shippingMethod: "Standard Delivery",
    notes: "Awaiting stock",
    adminNotes: "High-value order",
  },
];

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<(typeof ordersData)[0] | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filter orders
  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: ordersData.length,
    totalRevenue: ordersData
      .filter(o => o.payment.status === "completed")
      .reduce((sum, order) => sum + order.payment.amount, 0)
      .toFixed(2),
    totalCommission: ordersData
      .filter(o => o.payment.status === "completed")
      .reduce((sum, order) => sum + order.payment.commission, 0)
      .toFixed(2),
    pendingPayments: ordersData
      .filter(o => o.payment.status === "pending")
      .reduce((sum, order) => sum + order.payment.amount, 0)
      .toFixed(2),
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: "bg-yellow-100 text-yellow-800", icon: Clock },
      processing: { bg: "bg-blue-100 text-blue-800", icon: RefreshCw },
      shipped: { bg: "bg-purple-100 text-purple-800", icon: Truck },
      delivered: { bg: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { bg: "bg-red-100 text-red-800", icon: XCircle },
    };
    
    const style = styles[status as keyof typeof styles] || styles.pending;
    const Icon = style.icon;
    
    return (
      <Badge className={`${style.bg} hover:${style.bg}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewOrder = (order: typeof ordersData[0]) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleExportOrders = () => {
    // In a real app, this would generate and download a CSV file
    alert("Export feature would generate a CSV file with all order data");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Order Tracking</h1>
          <p className="text-muted-foreground">Monitor all orders across all client stores</p>
        </div>
        <Button variant="outline" onClick={handleExportOrders}>
          <Download className="w-4 h-4 mr-2" /> Export All Orders
        </Button>
      </div>

      {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Orders"
        value={stats.total.toString()}
        icon={Package}
        iconColor="from-primary to-primary/70"
      />
      <StatCard
        title="Total Revenue"
        value={`₦${stats.totalRevenue}`}
        icon={CreditCard}
        iconColor="from-success to-success/70"
      />
      <StatCard
        title="Total Commission"
        value={`₦${stats.totalCommission}`}
        icon={CreditCard}
        iconColor="from-blue-500 to-blue-400"
      />
      <StatCard
        title="Pending Payments"
        value={`₦${stats.pendingPayments}`}
        icon={Clock}
        iconColor="from-yellow-500 to-yellow-400"
      />
    </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, client name, customer name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client Store</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact Info</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Products</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount & Commission</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium font-mono text-sm">{order.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{order.client.name}</div>
                        <div className="text-xs text-muted-foreground">{order.client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {order.customer.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{order.customer.phone}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {order.products.map(p => p.name).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.products.length} item{order.products.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">${order.payment.amount.toFixed(2)}</div>
                    <div className="text-xs text-success">
                      Commission: ${order.payment.commission.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getPaymentBadge(order.payment.status)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{order.orderDate}</div>
                    {order.estimatedDelivery && (
                      <div className="text-xs text-muted-foreground">
                        Est: {order.estimatedDelivery}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order Details: {selectedOrder.id}</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentBadge(selectedOrder.payment.status)}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Order placed on {selectedOrder.orderDate} • Client: {selectedOrder.client.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Client and Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building className="w-4 h-4" /> Client Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Store Name</label>
                        <p className="font-medium">{selectedOrder.client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Client ID</label>
                        <p className="font-mono text-sm">{selectedOrder.client.id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Store URL</label>
                        <a 
                          href={selectedOrder.client.storeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {selectedOrder.client.storeUrl}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" /> Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Full Name</label>
                        <p className="font-medium">{selectedOrder.customer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Contact</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{selectedOrder.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{selectedOrder.customer.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Location</label>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">{selectedOrder.customer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Shipping & Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Shipping Address</label>
                        <p className="font-medium">{selectedOrder.customer.shippingAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Shipping Method</label>
                        <p>{selectedOrder.shippingMethod}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Order Date</label>
                        <p>{selectedOrder.orderDate}</p>
                      </div>
                      {selectedOrder.estimatedDelivery && (
                        <div>
                          <label className="text-sm text-muted-foreground">Estimated Delivery</label>
                          <p>{selectedOrder.estimatedDelivery}</p>
                        </div>
                      )}
                      {selectedOrder.deliveryDate && (
                        <div>
                          <label className="text-sm text-muted-foreground">Actual Delivery Date</label>
                          <p className="text-success font-medium">{selectedOrder.deliveryDate}</p>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div>
                          <label className="text-sm text-muted-foreground">Tracking Number</label>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {selectedOrder.trackingNumber}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Transaction ID</label>
                      <p className="font-mono text-sm">{selectedOrder.payment.transactionId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Method</label>
                      <p>{selectedOrder.payment.method}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Date & Time</label>
                      <p>{selectedOrder.payment.date}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Total Amount</label>
                      <p className="text-xl font-bold">${selectedOrder.payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Platform Commission</label>
                      <p className="text-lg font-bold text-success">${selectedOrder.payment.commission.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Client Earnings</label>
                      <p className="text-lg font-bold text-primary">
                        ${(selectedOrder.payment.amount - selectedOrder.payment.commission).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Quantity</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Unit Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((product, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-4">{product.name}</td>
                            <td className="py-3 px-4">{product.quantity}</td>
                            <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                            <td className="py-3 px-4 font-medium">
                              ${(product.quantity * product.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50">
                          <td colSpan={3} className="py-3 px-4 text-right font-medium">
                            Subtotal:
                          </td>
                          <td className="py-3 px-4 font-bold">
                            ${selectedOrder.payment.amount.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-muted/30">
                          <td colSpan={3} className="py-3 px-4 text-right font-medium">
                            Platform Commission ({((selectedOrder.payment.commission / selectedOrder.payment.amount) * 100).toFixed(1)}%):
                          </td>
                          <td className="py-3 px-4 font-bold text-success">
                            -${selectedOrder.payment.commission.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-muted/20">
                          <td colSpan={3} className="py-3 px-4 text-right font-bold">
                            Client Earnings:
                          </td>
                          <td className="py-3 px-4 font-bold text-lg text-primary">
                            ${(selectedOrder.payment.amount - selectedOrder.payment.commission).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Order Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <div>
                        <p className="font-medium">Order Placed</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.orderDate}</p>
                      </div>
                    </div>
                    {selectedOrder.payment.date && (
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${selectedOrder.payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <p className="font-medium">Payment {selectedOrder.payment.status === 'completed' ? 'Completed' : 'Pending'}</p>
                          <p className="text-sm text-muted-foreground">{selectedOrder.payment.date}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.status === "processing" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <div>
                          <p className="font-medium">Processing Order</p>
                          <p className="text-sm text-muted-foreground">Client is preparing the order</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.status === "shipped" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div>
                          <p className="font-medium">Shipped</p>
                          <p className="text-sm text-muted-foreground">
                            Estimated delivery: {selectedOrder.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.status === "delivered" && selectedOrder.deliveryDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <p className="font-medium">Delivered</p>
                          <p className="text-sm text-muted-foreground">
                            Delivered on {selectedOrder.deliveryDate}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.status === "cancelled" && selectedOrder.cancellationDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div>
                          <p className="font-medium">Cancelled</p>
                          <p className="text-sm text-muted-foreground">
                            Cancelled on {selectedOrder.cancellationDate}
                            {selectedOrder.reason && ` - ${selectedOrder.reason}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  {(selectedOrder.notes || selectedOrder.adminNotes) && (
                    <h3 className="font-semibold">Notes</h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.notes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Customer Notes</label>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">{selectedOrder.notes}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.adminNotes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Admin Notes</label>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">{selectedOrder.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
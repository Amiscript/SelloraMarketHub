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
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

// Sample orders data
const initialOrders = [
  {
    id: "ORD-001",
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
    },
    status: "processing",
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-22",
    trackingNumber: "TRK-789456123",
    shippingMethod: "Express Delivery",
    notes: "Customer requested morning delivery",
  },
  {
    id: "ORD-002",
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
    },
    status: "shipped",
    orderDate: "2024-01-14",
    estimatedDelivery: "2024-01-18",
    trackingNumber: "TRK-456789123",
    shippingMethod: "Standard Delivery",
    notes: "",
  },
  {
    id: "ORD-003",
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
    },
    status: "pending",
    orderDate: "2024-01-13",
    estimatedDelivery: "2024-01-20",
    trackingNumber: "",
    shippingMethod: "Standard Delivery",
    notes: "Waiting for payment confirmation",
  },
  {
    id: "ORD-004",
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
    },
    status: "delivered",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-16",
    estimatedDelivery: "2024-01-16",
    trackingNumber: "TRK-321654987",
    shippingMethod: "Express Delivery",
    notes: "Delivered successfully",
  },
  {
    id: "ORD-005",
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
    },
    status: "cancelled",
    orderDate: "2024-01-11",
    cancellationDate: "2024-01-12",
    reason: "Customer changed mind",
    notes: "Full refund processed",
  },
];

const ClientOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<(typeof initialOrders)[0] | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.payment.status === "completed").length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders
      .filter(o => o.payment.status === "completed")
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
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewOrder = (order: typeof initialOrders[0]) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status };
        
        // Add relevant dates based on status
        if (status === "delivered") {
          updatedOrder.deliveryDate = new Date().toISOString().split('T')[0];
        } else if (status === "cancelled") {
          updatedOrder.cancellationDate = new Date().toISOString().split('T')[0];
        }
        
        toast({
          title: "Status Updated",
          description: `Order ${orderId} marked as ${status}`,
        });
        
        return updatedOrder;
      }
      return order;
    }));
    
    setStatusUpdateDialog(false);
    setNewStatus("");
  };

  const handleExportOrders = () => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your orders data is being prepared for download.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
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
          value={`$${stats.totalRevenue}`}
          icon={CreditCard}
          iconColor="from-success to-success/70"
        />
        <StatCard
          title="Processing"
          value={stats.processing.toString()}
          icon={RefreshCw}
          iconColor="from-blue-500 to-blue-400"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered.toString()}
          icon={CheckCircle}
          iconColor="from-green-500 to-green-400"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer name, email, or phone..."
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
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Products</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium font-mono">{order.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {order.products.map(p => p.name).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.products.length} item{order.products.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    ${order.payment.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    {getPaymentBadge(order.payment.status)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {order.orderDate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdateDialog(true);
                          }}
                        >
                          Update
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order Details: {selectedOrder.id}</span>
                  {getStatusBadge(selectedOrder.status)}
                </DialogTitle>
                <DialogDescription>
                  Order placed on {selectedOrder.orderDate} • Estimated delivery: {selectedOrder.estimatedDelivery}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <span>{selectedOrder.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          <span>{selectedOrder.customer.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Location</label>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span>{selectedOrder.customer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Shipping Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Shipping Address</label>
                        <p className="font-medium">{selectedOrder.customer.shippingAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Shipping Method</label>
                        <p>{selectedOrder.shippingMethod}</p>
                      </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Transaction ID</label>
                      <p className="font-mono">{selectedOrder.payment.transactionId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Method</label>
                      <p>{selectedOrder.payment.method}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Status</label>
                      {getPaymentBadge(selectedOrder.payment.status)}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Payment Date & Time</label>
                      <p>{selectedOrder.payment.date}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Amount Paid</label>
                      <p className="text-xl font-bold">${selectedOrder.payment.amount.toFixed(2)}</p>
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
                            Total Amount:
                          </td>
                          <td className="py-3 px-4 font-bold text-lg">
                            ${selectedOrder.payment.amount.toFixed(2)}
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
                    {selectedOrder.status === "processing" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <div>
                          <p className="font-medium">Processing Order</p>
                          <p className="text-sm text-muted-foreground">Currently being prepared</p>
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
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Order Notes</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOrderDetails(false);
                        setSelectedOrder(selectedOrder);
                        setStatusUpdateDialog(true);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {["processing", "shipped", "delivered", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    variant={newStatus === status ? "default" : "outline"}
                    onClick={() => setNewStatus(status)}
                    className="justify-start"
                  >
                    {status === "processing" && <RefreshCw className="w-4 h-4 mr-2" />}
                    {status === "shipped" && <Truck className="w-4 h-4 mr-2" />}
                    {status === "delivered" && <CheckCircle className="w-4 h-4 mr-2" />}
                    {status === "cancelled" && <XCircle className="w-4 h-4 mr-2" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {newStatus && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  This will mark order <strong>{selectedOrder?.id}</strong> as <strong>{newStatus}</strong>.
                  {newStatus === "delivered" && " This action cannot be undone."}
                  {newStatus === "cancelled" && " Please ensure the customer has been notified."}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusUpdateDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={() => selectedOrder && handleStatusUpdate(selectedOrder.id, newStatus)}
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOrders;
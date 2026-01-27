import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserX, Users, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";

const clientsData = [
  { id: 1, name: "Store A", owner: "John Doe", email: "john@storea.com", phone: "+1234567890", products: 45, sales: 234, revenue: "$12,345", status: "verified", joined: "2024-01-01" },
  { id: 2, name: "Store B", owner: "Jane Smith", email: "jane@storeb.com", phone: "+0987654321", products: 32, sales: 156, revenue: "$8,765", status: "pending", joined: "2024-01-05" },
  { id: 3, name: "Store C", owner: "Bob Wilson", email: "bob@storec.com", phone: "+1122334455", products: 67, sales: 389, revenue: "$23,456", status: "verified", joined: "2023-12-15" },
  { id: 4, name: "Store D", owner: "Alice Brown", email: "alice@stored.com", phone: "+5544332211", products: 28, sales: 98, revenue: "$5,432", status: "suspended", joined: "2024-01-08" },
  { id: 5, name: "Store E", owner: "Charlie Davis", email: "charlie@storee.com", phone: "+6677889900", products: 54, sales: 267, revenue: "$15,678", status: "pending", joined: "2024-01-10" },
];

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredClients = clientsData.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && client.status === activeTab;
  });

  const handleAction = (action: string, clientName: string) => {
    toast({
      title: `${action} Client`,
      description: `${clientName} has been ${action.toLowerCase()}d successfully.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: "bg-success/10 text-success",
      pending: "bg-warning/10 text-warning",
      suspended: "bg-destructive/10 text-destructive",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Client Management</h1>
        <p className="text-muted-foreground">Manage and monitor all registered clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Clients" value={clientsData.length} icon={Users} />
        <StatCard 
          title="Verified Clients" 
          value={clientsData.filter(c => c.status === "verified").length} 
          icon={UserCheck} 
          iconColor="from-success to-success/70"
        />
        <StatCard 
          title="Pending Verification" 
          value={clientsData.filter(c => c.status === "pending").length} 
          icon={Users} 
          iconColor="from-warning to-warning/70"
        />
        <StatCard 
          title="Suspended" 
          value={clientsData.filter(c => c.status === "suspended").length} 
          icon={UserX} 
          iconColor="from-destructive to-destructive/70"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-xs">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="stat-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Store Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Products</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sales</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="table-row-hover border-b border-border/50 last:border-0">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4">{client.owner}</td>
                      <td className="py-3 px-4 text-muted-foreground">{client.email}</td>
                      <td className="py-3 px-4">{client.products}</td>
                      <td className="py-3 px-4">{client.sales}</td>
                      <td className="py-3 px-4 font-medium">{client.revenue}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {client.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleAction("Verify", client.name)}>
                                <UserCheck className="w-4 h-4 mr-2" /> Verify Client
                              </DropdownMenuItem>
                            )}
                            {client.status !== "suspended" && (
                              <DropdownMenuItem 
                                onClick={() => handleAction("Suspend", client.name)}
                                className="text-destructive"
                              >
                                <UserX className="w-4 h-4 mr-2" /> Suspend Client
                              </DropdownMenuItem>
                            )}
                            {client.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleAction("Reactivate", client.name)}>
                                <UserCheck className="w-4 h-4 mr-2" /> Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManagement;

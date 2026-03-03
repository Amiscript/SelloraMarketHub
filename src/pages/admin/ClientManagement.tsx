
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, UserCheck, UserX, Users, MoreHorizontal, Eye, Store, 
  Mail, Phone, Home, MapPin, Building, CreditCard, Shield, 
  Calendar, BarChart, DollarSign, FileText, CheckCircle, 
  AlertCircle, XCircle, Globe, BanknoteIcon, Briefcase, 
  UserCheck as UserCheckIcon, MapPinIcon, Camera, Image, 
  IdCard, FileImage, Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Extended client data with additional fields including images
const clientsData = [
  { 
    id: 1, 
    name: "Store A", 
    owner: "John Doe", 
    email: "john@storea.com", 
    phone: "+1234567890", 
    products: 45, 
    sales: 234, 
    revenue: "$12,345", 
    status: "verified" as const, 
    joined: "2024-01-01",
    dateOfBirth: "1985-05-15",
    residentialAddress: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    country: "USA",
    currentLocation: "40.7128° N, 74.0060° W",
    bankName: "Chase Bank",
    accountType: "checking",
    accountName: "John Doe",
    accountNumber: "********7890",
    grantorName: "Sarah Doe",
    grantorRelationship: "spouse",
    grantorPhone: "+1234567891",
    grantorEmail: "sarah@example.com",
    grantorAddress: "123 Main Street, Apt 4B",
    grantorOccupation: "Software Engineer",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    idCardFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",
    idCardBack: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400&h=250&fit=crop"
  },
  { 
    id: 2, 
    name: "Store B", 
    owner: "Jane Smith", 
    email: "jane@storeb.com", 
    phone: "+0987654321", 
    products: 32, 
    sales: 156, 
    revenue: "$8,765", 
    status: "pending" as const, 
    joined: "2024-01-05",
    dateOfBirth: "1990-08-22",
    residentialAddress: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    currentLocation: "34.0522° N, 118.2437° W",
    bankName: "Bank of America",
    accountType: "savings",
    accountName: "Jane Smith",
    accountNumber: "********4321",
    grantorName: "Robert Smith",
    grantorRelationship: "parent",
    grantorPhone: "+0987654322",
    grantorEmail: "robert@example.com",
    grantorAddress: "456 Oak Avenue",
    grantorOccupation: "Doctor",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    idCardFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w-400&h=250&fit=crop",
    idCardBack: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w-400&h=250&fit=crop"
  },
  { 
    id: 3, 
    name: "Store C", 
    owner: "Bob Wilson", 
    email: "bob@storec.com", 
    phone: "+1122334455", 
    products: 67, 
    sales: 389, 
    revenue: "$23,456", 
    status: "verified" as const, 
    joined: "2023-12-15",
    dateOfBirth: "1978-11-30",
    residentialAddress: "789 Pine Street",
    city: "Chicago",
    state: "IL",
    country: "USA",
    currentLocation: "41.8781° N, 87.6298° W",
    bankName: "Wells Fargo",
    accountType: "checking",
    accountName: "Bob Wilson",
    accountNumber: "********4455",
    grantorName: "Alice Wilson",
    grantorRelationship: "spouse",
    grantorPhone: "+1122334466",
    grantorEmail: "alice@example.com",
    grantorAddress: "789 Pine Street",
    grantorOccupation: "Teacher",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    idCardFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w-400&h=250&fit=crop",
    idCardBack: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w-400&h=250&fit=crop"
  },
  { 
    id: 4, 
    name: "Store D", 
    owner: "Alice Brown", 
    email: "alice@stored.com", 
    phone: "+5544332211", 
    products: 28, 
    sales: 98, 
    revenue: "$5,432", 
    status: "suspended" as const, 
    joined: "2024-01-08",
    dateOfBirth: "1982-03-10",
    residentialAddress: "321 Elm Street",
    city: "Houston",
    state: "TX",
    country: "USA",
    currentLocation: "29.7604° N, 95.3698° W",
    bankName: "Citibank",
    accountType: "checking",
    accountName: "Alice Brown",
    accountNumber: "********2211",
    grantorName: "David Brown",
    grantorRelationship: "sibling",
    grantorPhone: "+5544332212",
    grantorEmail: "david@example.com",
    grantorAddress: "321 Elm Street",
    grantorOccupation: "Architect",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    idCardFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w-400&h=250&fit=crop",
    idCardBack: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w-400&h=250&fit=crop"
  },
  { 
    id: 5, 
    name: "Store E", 
    owner: "Charlie Davis", 
    email: "charlie@storee.com", 
    phone: "+6677889900", 
    products: 54, 
    sales: 267, 
    revenue: "$15,678", 
    status: "pending" as const, 
    joined: "2024-01-10",
    dateOfBirth: "1995-07-18",
    residentialAddress: "555 Maple Drive",
    city: "Miami",
    state: "FL",
    country: "USA",
    currentLocation: "25.7617° N, 80.1918° W",
    bankName: "TD Bank",
    accountType: "savings",
    accountName: "Charlie Davis",
    accountNumber: "********9900",
    grantorName: "Emma Davis",
    grantorRelationship: "friend",
    grantorPhone: "+6677889901",
    grantorEmail: "emma@example.com",
    grantorAddress: "555 Maple Drive",
    grantorOccupation: "Marketing Manager",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    idCardFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w-400&h=250&fit=crop",
    idCardBack: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w-400&h=250&fit=crop"
  },
];

type Client = typeof clientsData[0];

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const filteredClients = clientsData.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      verified: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      suspended: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 mr-1" />;
      case "suspended":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    // In a real app, you would fetch the image and create a download link
    // For demo, we'll just open in new tab
    window.open(imageUrl, '_blank');
    toast({
      title: "Image Opened",
      description: `Opening ${fileName} in new tab`,
    });
  };

  const ImageViewerModal = () => {
    if (!expandedImage) return null;

    return (
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <img 
              src={expandedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(expandedImage, '_blank')}
            >
              Open in New Tab
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = expandedImage;
                link.download = `client-image-${Date.now()}.jpg`;
                link.click();
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const ViewClientModal = () => {
    if (!selectedClient) return null;

    return (
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Store className="w-6 h-6" />
                  {selectedClient.name} - Client Details
                </DialogTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={`flex items-center gap-1 px-3 py-1 ${getStatusBadge(selectedClient.status)}`}>
                    {getStatusIcon(selectedClient.status)}
                    {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Joined: {formatDate(selectedClient.joined)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={selectedClient.profileImage} alt={selectedClient.owner} />
                  <AvatarFallback>
                    {selectedClient.owner.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Documents */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Profile Picture
                </h3>
                <div className="flex flex-col items-center justify-center border-2 border-border rounded-xl p-6 bg-muted/30">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
                    <img 
                      src={selectedClient.profileImage} 
                      alt={selectedClient.owner}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setExpandedImage(selectedClient.profileImage)}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{selectedClient.owner}</p>
                    <p className="text-sm text-muted-foreground">Store Owner</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={() => handleDownloadImage(selectedClient.profileImage, `${selectedClient.owner}-profile.jpg`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Photo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* ID Documents Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-primary" />
                  ID Documents
                </h3>
                <div className="space-y-4">
                  {/* ID Front */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      ID Front Side
                    </label>
                    <div className="border-2 border-border rounded-lg p-4 h-48 flex flex-col items-center justify-center bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors"
                         onClick={() => setExpandedImage(selectedClient.idCardFront)}>
                      {selectedClient.idCardFront ? (
                        <div className="text-center w-full h-full">
                          <div className="w-full h-32 rounded overflow-hidden mb-2">
                            <img 
                              src={selectedClient.idCardFront} 
                              alt="ID Front" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Click to enlarge</p>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
                            <FileImage className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm">No ID Front Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ID Back */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      ID Back Side
                    </label>
                    <div className="border-2 border-border rounded-lg p-4 h-48 flex flex-col items-center justify-center bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors"
                         onClick={() => setExpandedImage(selectedClient.idCardBack)}>
                      {selectedClient.idCardBack ? (
                        <div className="text-center w-full h-full">
                          <div className="w-full h-32 rounded overflow-hidden mb-2">
                            <img 
                              src={selectedClient.idCardBack} 
                              alt="ID Back" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Click to enlarge</p>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
                            <FileImage className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm">No ID Back Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownloadImage(selectedClient.idCardFront, `${selectedClient.owner}-id-front.jpg`)}
                      disabled={!selectedClient.idCardFront}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Front
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownloadImage(selectedClient.idCardBack, `${selectedClient.owner}-id-back.jpg`)}
                      disabled={!selectedClient.idCardBack}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Back
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verification Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Verified</span>
                    {selectedClient.profileImage ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ID Documents</span>
                    {selectedClient.idCardFront && selectedClient.idCardBack ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bank Information</span>
                    {selectedClient.bankName ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Store & Personal Info */}
            <div className="space-y-6 lg:col-span-1">
              {/* Store Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Store Information
                </h3>
                <div className="space-y-4 p-4 bg-muted/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Store Name</p>
                      <p className="text-base font-medium">{selectedClient.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Owner</p>
                      <p className="text-base font-medium">{selectedClient.owner}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <BarChart className="w-4 h-4" />
                        Products
                      </p>
                      <p className="text-lg font-semibold">{selectedClient.products}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Sales
                      </p>
                      <p className="text-lg font-semibold">{selectedClient.sales}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold text-primary">{selectedClient.revenue}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserCheckIcon className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedClient.dateOfBirth ? formatDate(selectedClient.dateOfBirth) : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedClient.phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedClient.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Residential Address</p>
                    <p className="flex items-start gap-1">
                      <Home className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{selectedClient.residentialAddress || "N/A"}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">City</p>
                      <p>{selectedClient.city || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">State</p>
                      <p>{selectedClient.state || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <p className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {selectedClient.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bank & Grantor Info */}
            <div className="space-y-6 lg:col-span-1">
              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Bank Account Information
                </h3>
                <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                      <p className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {selectedClient.bankName || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                      <p className="capitalize">{selectedClient.accountType || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
                    <p>{selectedClient.accountName || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="flex items-center gap-1">
                      <BanknoteIcon className="w-4 h-4" />
                      {selectedClient.accountNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Grantor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserCheckIcon className="w-5 h-5 text-primary" />
                  Grantor Information
                </h3>
                <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{selectedClient.grantorName || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                      <p className="capitalize">{selectedClient.grantorRelationship || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedClient.grantorPhone || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedClient.grantorEmail || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                    <p className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {selectedClient.grantorOccupation || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedClient.email);
                      toast({
                        title: "Email copied",
                        description: "Email address copied to clipboard",
                      });
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Copy Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      window.location.href = `mailto:${selectedClient.email}`;
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      window.location.href = `tel:${selectedClient.phone}`;
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Client
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      handleAction("Export", selectedClient.name);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={client.profileImage} alt={client.name} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {client.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">{client.owner}</td>
                      <td className="py-3 px-4 text-muted-foreground">{client.email}</td>
                      <td className="py-3 px-4">{client.products}</td>
                      <td className="py-3 px-4">{client.sales}</td>
                      <td className="py-3 px-4 font-medium">{client.revenue}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 w-fit ${getStatusBadge(client.status)}`}>
                          {getStatusIcon(client.status)}
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
                            <DropdownMenuItem onClick={() => handleViewClient(client)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {client.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleAction("Verify", client.name)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Verify Client
                              </DropdownMenuItem>
                            )}
                            {client.status !== "suspended" && (
                              <DropdownMenuItem 
                                onClick={() => handleAction("Suspend", client.name)}
                                className="text-destructive"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend Client
                              </DropdownMenuItem>
                            )}
                            {client.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleAction("Reactivate", client.name)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
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

      {/* View Client Modal */}
      <ViewClientModal />
      
      {/* Image Viewer Modal */}
      <ImageViewerModal />
    </div>
  );
};

export default ClientManagement;
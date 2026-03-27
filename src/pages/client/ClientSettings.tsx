import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User, Store, Globe, Lock, Save, LayoutDashboard, Camera,
  Package, ShoppingCart, TrendingUp, CreditCard, Wallet, Image,
  Settings, RefreshCw, Building, Shield,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuthStore } from "@/store/auth.store";
import { useStorefrontStore } from "@/store/storefront.store";

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

const ClientSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, updateProfile, isLoading: isUpdatingProfile } = useAuthStore();
  const { settings, isSubmitting, fetchClientSettings, updateClientSettings } = useStorefrontStore();

  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);

  // Profile tab
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Banking tab
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("savings");

  // Grantor tab
  const [grantorName, setGrantorName] = useState("");
  const [grantorRelationship, setGrantorRelationship] = useState("");
  const [grantorPhone, setGrantorPhone] = useState("");
  const [grantorEmail, setGrantorEmail] = useState("");
  const [grantorAddress, setGrantorAddress] = useState("");
  const [grantorOccupation, setGrantorOccupation] = useState("");

  // Store tab
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");

  // Social & SEO tab
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Security tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Populate from user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone((user as any).phone || "");
      setDateOfBirth((user as any).dateOfBirth?.split("T")[0] || "");
      setResidentialAddress((user as any).residentialAddress || "");
      setCity((user as any).city || "");
      setState((user as any).state || "");
      setCountry((user as any).country || "");
      setProfileImagePreview((user as any).profileImage?.url || null);
      // Banking
      const bank = (user as any).bankDetails;
      if (bank) {
        setBankName(bank.bankName || "");
        setAccountName(bank.accountName || "");
        setAccountNumber(bank.accountNumber || "");
        setAccountType(bank.accountType || "savings");
      }
      // Grantor
      const g = (user as any).grantor;
      if (g) {
        setGrantorName(g.name || "");
        setGrantorRelationship(g.relationship || "");
        setGrantorPhone(g.phone || "");
        setGrantorEmail(g.email || "");
        setGrantorAddress(g.address || "");
        setGrantorOccupation(g.occupation || "");
      }
    }
  }, [user]);

  // Populate from storefront settings
  useEffect(() => {
    fetchClientSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setStoreDescription((settings as any).description || "");
      setWhatsapp(settings.owner?.whatsapp || "");
      setPrimaryColor(settings.theme?.primaryColor || "#6366f1");
      setSecondaryColor(settings.theme?.secondaryColor || "#8b5cf6");
      setFacebook(settings.socialLinks?.facebook || "");
      setInstagram(settings.socialLinks?.instagram || "");
      setTwitter(settings.socialLinks?.twitter || "");
      setSeoTitle(settings.seo?.title || "");
      setSeoDescription(settings.seo?.description || "");
    }
  }, [settings]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  // Profile save — sends as object + files (auth store builds FormData internally)
  const handleSaveProfile = async () => {
    try {
      const data: any = { name };
      if (phone) data.phone = phone;
      if (dateOfBirth) data.dateOfBirth = dateOfBirth;
      if (residentialAddress) data.residentialAddress = residentialAddress;
      if (city) data.city = city;
      if (state) data.state = state;
      if (country) data.country = country;

      const files: Record<string, File> = {};
      if (profileImageFile) files.profileImage = profileImageFile;

      await updateProfile(data, files);
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update profile", variant: "destructive" });
    }
  };

  // Banking save
  const handleSaveBanking = async () => {
    try {
      await updateProfile({
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          accountType,
        } as any,
      });
      toast({ title: "Banking Details Updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update banking details", variant: "destructive" });
    }
  };

  // Grantor save
  const handleSaveGrantor = async () => {
    try {
      await updateProfile({
        grantor: {
          name: grantorName,
          relationship: grantorRelationship,
          phone: grantorPhone,
          email: grantorEmail,
          address: grantorAddress,
          occupation: grantorOccupation,
        } as any,
      });
      toast({ title: "Grantor Details Updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update grantor", variant: "destructive" });
    }
  };

  // Store settings save
  const handleSaveStoreSettings = async () => {
    try {
      await updateClientSettings({
        description: storeDescription || undefined,
        theme: { primaryColor, secondaryColor, backgroundColor: "#ffffff", fontFamily: "Inter" },
owner: {
  name: user?.name || "",
  email: user?.email || "",
  phone: (user as any)?.phone || "N/A",
  whatsapp: whatsapp || undefined,
},
        socialLinks: {
          facebook: facebook || undefined,
          instagram: instagram || undefined,
          twitter: twitter || undefined,
        },
        seo: {
          title: seoTitle || undefined,
          description: seoDescription || undefined,
        },
      });
      toast({ title: "Store Settings Updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update store settings", variant: "destructive" });
    }
  };

  // Password change
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "All fields required", variant: "destructive" }); return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    try {
      await updateProfile({ password: currentPassword, newPassword } as any);
      toast({ title: "Password Changed" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const u = user as any;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-3xl">

          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
            <p className="text-muted-foreground">Manage your profile and store settings</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="flex-wrap mb-6 h-auto gap-1">
              <TabsTrigger value="profile" className="flex items-center gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center gap-2"><Building className="w-4 h-4" /> Banking</TabsTrigger>
              <TabsTrigger value="grantor" className="flex items-center gap-2"><Shield className="w-4 h-4" /> Grantor</TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2"><Store className="w-4 h-4" /> Store</TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2"><Globe className="w-4 h-4" /> Social & SEO</TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2"><Lock className="w-4 h-4" /> Security</TabsTrigger>
            </TabsList>

            {/* ── Profile Tab ───────────────────────────────────── */}
            <TabsContent value="profile" className="space-y-6">
              <div className="stat-card space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profileImagePreview || u?.profileImage?.url} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => profileImageRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1 capitalize text-xs">{u?.verificationStatus || "pending"}</Badge>
                  </div>
                </div>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Full Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." /></div>
                  <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Country</Label><Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" /></div>
                  <div className="space-y-1"><Label>City</Label><Input value={city} onChange={e => setCity(e.target.value)} /></div>
                  <div className="space-y-1"><Label>State</Label><Input value={state} onChange={e => setState(e.target.value)} /></div>
                  <div className="space-y-1 md:col-span-2"><Label>Residential Address</Label><Input value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)} placeholder="Street address" /></div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isUpdatingProfile ? "Saving…" : "Save Profile"}
                </Button>
              </div>

              {/* Store info read-only */}
              <div className="stat-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Store className="w-4 h-4" /> Store Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Store Name</p><p className="font-medium">{u?.storeName || "—"}</p></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Store URL</p><p className="font-medium truncate">/{u?.storeSlug || "—"}</p></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Commission Rate</p><p className="font-medium">{u?.commissionRate ?? "—"}%</p></div>
                  <div className="bg-muted/30 p-3 rounded-lg"><p className="text-muted-foreground text-xs">Status</p><p className="font-medium capitalize">{u?.verificationStatus || "—"}</p></div>
                </div>
              </div>
            </TabsContent>

            {/* ── Banking Tab ───────────────────────────────────── */}
            <TabsContent value="banking" className="space-y-6">
              <div className="stat-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Building className="w-4 h-4" /> Bank Account Details</h3>
                <p className="text-sm text-muted-foreground">Your withdrawal payments will be sent to this account.</p>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Bank Name *</Label><Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Access Bank" /></div>
                  <div className="space-y-1"><Label>Account Name *</Label><Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="As shown on your account" /></div>
                  <div className="space-y-1"><Label>Account Number *</Label><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="10-digit account number" maxLength={10} /></div>
                  <div className="space-y-1">
                    <Label>Account Type</Label>
                    <select value={accountType} onChange={e => setAccountType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="savings">Savings</option>
                      <option value="checking">Current / Checking</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleSaveBanking} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isUpdatingProfile ? "Saving…" : "Save Banking Details"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Grantor Tab ───────────────────────────────────── */}
            <TabsContent value="grantor" className="space-y-6">
              <div className="stat-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Grantor / Guarantor Details</h3>
                <p className="text-sm text-muted-foreground">A person who can vouch for your identity and business integrity.</p>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Full Name *</Label><Input value={grantorName} onChange={e => setGrantorName(e.target.value)} placeholder="Guarantor's full name" /></div>
                  <div className="space-y-1"><Label>Relationship *</Label><Input value={grantorRelationship} onChange={e => setGrantorRelationship(e.target.value)} placeholder="e.g. Parent, Employer" /></div>
                  <div className="space-y-1"><Label>Phone *</Label><Input value={grantorPhone} onChange={e => setGrantorPhone(e.target.value)} placeholder="+234..." /></div>
                  <div className="space-y-1"><Label>Email</Label><Input type="email" value={grantorEmail} onChange={e => setGrantorEmail(e.target.value)} placeholder="guarantor@email.com" /></div>
                  <div className="space-y-1"><Label>Occupation</Label><Input value={grantorOccupation} onChange={e => setGrantorOccupation(e.target.value)} placeholder="e.g. Civil Servant" /></div>
                  <div className="space-y-1 md:col-span-2"><Label>Address</Label><Input value={grantorAddress} onChange={e => setGrantorAddress(e.target.value)} placeholder="Guarantor's residential address" /></div>
                </div>
                <Button onClick={handleSaveGrantor} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isUpdatingProfile ? "Saving…" : "Save Grantor Details"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Store Tab ─────────────────────────────────────── */}
            <TabsContent value="store" className="space-y-6">
              <div className="stat-card space-y-4">
                <h3 className="font-semibold">Store Customization</h3>
                <Separator />
                <div className="space-y-1">
                  <Label>Store Description</Label>
                  <Textarea placeholder="Describe your store…" value={storeDescription} onChange={e => setStoreDescription(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>WhatsApp Number</Label>
                  <Input placeholder="+2348..." value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Customers will be able to chat with you via WhatsApp on your storefront</p>
                </div>
                <Button onClick={handleSaveStoreSettings} disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSubmitting ? "Saving…" : "Save Store Settings"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Social & SEO Tab ──────────────────────────────── */}
            <TabsContent value="social" className="space-y-6">
              <div className="stat-card space-y-4">
                <h3 className="font-semibold">Social Links</h3>
                <Separator />
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1"><Label>Facebook URL</Label><Input placeholder="https://facebook.com/yourpage" value={facebook} onChange={e => setFacebook(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Instagram URL</Label><Input placeholder="https://instagram.com/yourhandle" value={instagram} onChange={e => setInstagram(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Twitter / X URL</Label><Input placeholder="https://twitter.com/yourhandle" value={twitter} onChange={e => setTwitter(e.target.value)} /></div>
                </div>
              </div>
              <div className="stat-card space-y-4">
                <h3 className="font-semibold">SEO Settings</h3>
                <Separator />
                <div className="space-y-1"><Label>SEO Title</Label><Input placeholder="Your store | Best products online" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} /></div>
                <div className="space-y-1"><Label>SEO Description</Label><Textarea placeholder="A short description for search engines…" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} /></div>
                <Button onClick={handleSaveStoreSettings} disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSubmitting ? "Saving…" : "Save Social & SEO"}
                </Button>
              </div>
            </TabsContent>

            {/* ── Security Tab ──────────────────────────────────── */}
            <TabsContent value="security" className="space-y-6">
              <div className="stat-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h3>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-1"><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
                  <div className="space-y-1"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Confirm New Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                </div>
                <Button onClick={handleChangePassword} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isUpdatingProfile ? "Changing…" : "Change Password"}
                </Button>
              </div>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientSettings;

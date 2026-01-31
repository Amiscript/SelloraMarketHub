import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Upload,
  Image as ImageIcon,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  Camera,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Globe,
  Building,
  BadgeCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ClientRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [idCardFront, setIdCardFront] = useState<string | null>(null);
  const [idCardBack, setIdCardBack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Information & Documents
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    residentialAddress: "",
    city: "",
    state: "",
    country: "Nigeria",
    currentLocation: "",
    
    // Step 2: Account Information
    password: "",
    confirmPassword: "",
    
    // Step 3: Bank Information
    bankName: "",
    accountName: "",
    accountNumber: "",
    accountType: "checking",

    
    // Step 4: Grantor Information
    grantorName: "",
    grantorRelationship: "",
    grantorPhone: "",
    grantorEmail: "",
    grantorAddress: "",
    grantorOccupation: "",
  });

  // US States for dropdown
  const usStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
    "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
    "FCT"
  ];

  const handleImageUpload = (type: 'profile' | 'idFront' | 'idBack', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'profile') {
        setProfileImage(result);
        toast({ title: "Profile picture uploaded successfully" });
      } else if (type === 'idFront') {
        setIdCardFront(result);
        toast({ title: "ID Front uploaded successfully" });
      } else if (type === 'idBack') {
        setIdCardBack(result);
        toast({ title: "ID Back uploaded successfully" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required personal information",
          variant: "destructive"
        });
        return;
      }
      if (!profileImage || !idCardFront || !idCardBack) {
        toast({
          title: "Documents Required",
          description: "Please upload profile picture and ID card (front & back)",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 2) {
      if (formData.password.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords match",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 3) {
      if (!formData.bankName || !formData.accountNumber ) {
        toast({
          title: "Missing Bank Information",
          description: "Please fill in all required bank details",
          variant: "destructive"
        });
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registration Submitted!",
        description: "Your account is pending verification. We'll review your documents and notify you via email.",
      });
      navigate("/client/login");
    }, 2000);
  };

  const getProgressPercentage = () => {
    return (step / 4) * 100;
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <Progress value={getProgressPercentage()} className="h-2 mb-4" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className={step >= 1 ? "text-primary font-medium" : ""}>Personal Info</span>
        <span className={step >= 2 ? "text-primary font-medium" : ""}>Account</span>
        <span className={step >= 3 ? "text-primary font-medium" : ""}>Bank Details</span>
        <span className={step >= 4 ? "text-primary font-medium" : ""}>Grantor</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-primary-foreground">MarketHub</span>
        </Link>

        <div>
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-8">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Join Our Seller Community
          </h1>
          <p className="text-xl text-primary-foreground/70 max-w-md mb-8">
            Complete verification to start selling and earning commissions.
          </p>
          
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure document verification" },
              { icon: CreditCard, text: "Bank account for payouts" },
              { icon: BadgeCheck, text: "Verified seller status" },
              { icon: Globe, text: "Reach customers worldwide" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-primary-foreground/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-2xl py-4 lg:py-8">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">MarketHub</span>
            </Link>
          </div>

          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-display font-bold mb-2">Client Registration</h2>
            <p className="text-muted-foreground">
              Step {step} of 4 • Complete all sections for verification
            </p>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information & Documents */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10 h-12"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                        <Input
                          type="date"
                          className="h-12"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 h-12"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="+1 (234) 567-8900"
                            className="pl-10 h-12"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Residential Address *</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Textarea
                          placeholder="Your current residential address"
                          className="pl-10 min-h-[80px]"
                          value={formData.residentialAddress}
                          onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <Select 
                          value={formData.state} 
                          onValueChange={(value) => setFormData({ ...formData, state: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {usStates.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Location *
                        <span className="text-xs text-muted-foreground ml-2">
                          For verification purposes
                        </span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="e.g., 40.7128° N, 74.0060° W or 'Near Central Park'"
                          className="pl-10 h-12"
                          value={formData.currentLocation}
                          onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Uploads Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Identity Verification</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Profile Picture *
                        <span className="text-xs text-muted-foreground ml-2">Clear face photo for identification</span>
                      </label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="profile-upload"
                          onChange={(e) => handleImageUpload('profile', e)}
                        />
                        <label htmlFor="profile-upload" className="cursor-pointer w-full">
                          {profileImage ? (
                            <div className="text-center">
                              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-3 border-4 border-primary/20">
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-sm text-muted-foreground">Click to change photo</p>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <Camera className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium mb-1">Upload Profile Picture</p>
                              <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* ID Card Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Government ID Card *
                        <span className="text-xs text-muted-foreground ml-2">
                          Driver's License, Passport, or National ID
                        </span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ID Front */}
                        <div>
                          <label className="block text-xs font-medium mb-2 text-muted-foreground">Front Side *</label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer h-40 flex flex-col items-center justify-center bg-muted/20">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="id-front-upload"
                              onChange={(e) => handleImageUpload('idFront', e)}
                            />
                            <label htmlFor="id-front-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                              {idCardFront ? (
                                <div className="text-center">
                                  <div className="w-full h-24 rounded overflow-hidden mb-2">
                                    <img src={idCardFront} alt="ID Front" className="w-full h-full object-contain" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Click to change</p>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                  <p className="text-sm font-medium mb-1">Upload ID Front</p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* ID Back */}
                        <div>
                          <label className="block text-xs font-medium mb-2 text-muted-foreground">Back Side *</label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer h-40 flex flex-col items-center justify-center bg-muted/20">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="id-back-upload"
                              onChange={(e) => handleImageUpload('idBack', e)}
                            />
                            <label htmlFor="id-back-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                              {idCardBack ? (
                                <div className="text-center">
                                  <div className="w-full h-24 rounded overflow-hidden mb-2">
                                    <img src={idCardBack} alt="ID Back" className="w-full h-full object-contain" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Click to change</p>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                  <p className="text-sm font-medium mb-1">Upload ID Back</p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Information */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Account Security</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        className="pl-10 h-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[
                        { label: "8+ characters", met: formData.password.length >= 8 },
                        { label: "Uppercase", met: /[A-Z]/.test(formData.password) },
                        { label: "Lowercase", met: /[a-z]/.test(formData.password) },
                        { label: "Number", met: /\d/.test(formData.password) },
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-success' : 'bg-muted'}`} />
                          <span className={`text-xs ${req.met ? 'text-success' : 'text-muted-foreground'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 h-12"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {formData.password && formData.confirmPassword && (
                      <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-success' : 'text-destructive'}`}>
                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank Information */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Bank Account Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Name *</label>
                      <Input
                        placeholder="e.g., Chase Bank, Bank of America"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Type *</label>
                      <Select 
                        value={formData.accountType} 
                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Account Holder Name *</label>
                    <Input
                      placeholder="Name as it appears on bank account"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number *</label>
                      <Input
                        placeholder="1234567890"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        required
                      />
                    </div>
                 
                  </div>

                 
                </div>
              </div>
            )}

            {/* Step 4: Grantor Information */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Grantor Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Grantor Name *</label>
                        <Input
                          placeholder="Full name of grantor"
                          value={formData.grantorName}
                          onChange={(e) => setFormData({ ...formData, grantorName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Relationship *</label>
                        <Select 
                          value={formData.grantorRelationship} 
                          onValueChange={(value) => setFormData({ ...formData, grantorRelationship: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="colleague">Colleague</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Grantor Phone *</label>
                        <Input
                          placeholder="+1 (234) 567-8900"
                          value={formData.grantorPhone}
                          onChange={(e) => setFormData({ ...formData, grantorPhone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Grantor Email *</label>
                        <Input
                          type="email"
                          placeholder="grantor@example.com"
                          value={formData.grantorEmail}
                          onChange={(e) => setFormData({ ...formData, grantorEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Grantor Address</label>
                      <Textarea
                        placeholder="Grantor's residential address"
                        value={formData.grantorAddress}
                        onChange={(e) => setFormData({ ...formData, grantorAddress: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Grantor Occupation</label>
                      <Input
                        placeholder="Occupation of grantor"
                        value={formData.grantorOccupation}
                        onChange={(e) => setFormData({ ...formData, grantorOccupation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="pt-6 border-t space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" required />
                    <div>
                      <label htmlFor="terms" className="text-sm font-medium">
                        Terms & Conditions Agreement
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        I agree to all terms and conditions of MarketHub, including commission structure, payment terms, and seller responsibilities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox id="privacy" required />
                    <div>
                      <label htmlFor="privacy" className="text-sm font-medium">
                        Privacy Policy Consent
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        I consent to the collection, processing, and storage of my personal data for account verification and service provision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <Button type="button" variant="hero" onClick={handleNextStep}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" variant="hero" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/client/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;
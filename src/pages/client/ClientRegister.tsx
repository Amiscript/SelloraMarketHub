import { useState, useEffect } from "react";
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
  BadgeCheck,
  AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/store/hooks/useAuth";

const ClientRegister = () => {
  const navigate = useNavigate();
  const { registerClient, isLoading, error, validationErrors, clearError, clearValidationErrors, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // File states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information & Documents
    name: "",
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

  // Field errors from validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/client/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle validation errors from server
  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      const errors: Record<string, string> = {};
      validationErrors.forEach(err => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      
      // Scroll to first error
      const firstErrorField = validationErrors[0]?.field;
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      setFieldErrors({});
    }
  }, [validationErrors]);

  // Show error toast when general error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Registration Failed",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, clearError]);

  // Nigerian states
  const nigeriaStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
    "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
    "FCT"
  ];

  const handleImageUpload = (
    type: 'profile' | 'idFront' | 'idBack', 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'profile') {
        setProfileImage(file);
        setProfileImagePreview(result);
      } else if (type === 'idFront') {
        setIdCardFront(file);
        setIdCardFrontPreview(result);
      } else if (type === 'idBack') {
        setIdCardBack(file);
        setIdCardBackPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    clearValidationErrors();
    setFieldErrors({});

    if (step === 1) {
      if (!formData.name) {
        setFieldErrors(prev => ({ ...prev, name: "Full name is required" }));
        return false;
      }
      if (!formData.email) {
        setFieldErrors(prev => ({ ...prev, email: "Email is required" }));
        return false;
      }
      if (!formData.phone) {
        setFieldErrors(prev => ({ ...prev, phone: "Phone number is required" }));
        return false;
      }
      if (!formData.dateOfBirth) {
        setFieldErrors(prev => ({ ...prev, dateOfBirth: "Date of birth is required" }));
        return false;
      }
      if (!formData.residentialAddress) {
        setFieldErrors(prev => ({ ...prev, residentialAddress: "Residential address is required" }));
        return false;
      }
      if (!formData.city) {
        setFieldErrors(prev => ({ ...prev, city: "City is required" }));
        return false;
      }
      if (!formData.state) {
        setFieldErrors(prev => ({ ...prev, state: "State is required" }));
        return false;
      }
      if (!formData.currentLocation) {
        setFieldErrors(prev => ({ ...prev, currentLocation: "Current location is required" }));
        return false;
      }
      if (!profileImage) {
        toast({
          title: "Profile Picture Required",
          description: "Please upload a profile picture",
          variant: "destructive"
        });
        return false;
      }
      if (!idCardFront || !idCardBack) {
        toast({
          title: "ID Cards Required",
          description: "Please upload both front and back of your ID",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
      if (formData.password.length < 8) {
        setFieldErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
        return false;
      }
      if (!/[A-Z]/.test(formData.password)) {
        setFieldErrors(prev => ({ ...prev, password: "Password must contain at least one uppercase letter" }));
        return false;
      }
      if (!/[a-z]/.test(formData.password)) {
        setFieldErrors(prev => ({ ...prev, password: "Password must contain at least one lowercase letter" }));
        return false;
      }
      if (!/\d/.test(formData.password)) {
        setFieldErrors(prev => ({ ...prev, password: "Password must contain at least one number" }));
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
        return false;
      }
    } else if (step === 3) {
      if (!formData.bankName) {
        setFieldErrors(prev => ({ ...prev, bankName: "Bank name is required" }));
        return false;
      }
      if (!formData.accountName) {
        setFieldErrors(prev => ({ ...prev, accountName: "Account holder name is required" }));
        return false;
      }
      if (!formData.accountNumber) {
        setFieldErrors(prev => ({ ...prev, accountNumber: "Account number is required" }));
        return false;
      }
      if (formData.accountNumber.length !== 10) {
        setFieldErrors(prev => ({ ...prev, accountNumber: "Account number must be 10 digits" }));
        return false;
      }
    } else if (step === 4) {
      if (!formData.grantorName) {
        setFieldErrors(prev => ({ ...prev, grantorName: "Grantor name is required" }));
        return false;
      }
      if (!formData.grantorRelationship) {
        setFieldErrors(prev => ({ ...prev, grantorRelationship: "Relationship is required" }));
        return false;
      }
      if (!formData.grantorPhone) {
        setFieldErrors(prev => ({ ...prev, grantorPhone: "Grantor phone is required" }));
        return false;
      }
      if (!formData.grantorEmail) {
        setFieldErrors(prev => ({ ...prev, grantorEmail: "Grantor email is required" }));
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
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
    
    if (!validateStep()) {
      return;
    }

    try {
      // Prepare files object
      const files: Record<string, File> = {};
      if (profileImage) files.profileImage = profileImage;
      if (idCardFront) files.idCardFront = idCardFront;
      if (idCardBack) files.idCardBack = idCardBack;

      // Prepare bank details object
      const bankDetails = formData.bankName ? {
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
      } : undefined;

      // Prepare grantor object
      const grantor = formData.grantorName ? {
        name: formData.grantorName,
        relationship: formData.grantorRelationship,
        phone: formData.grantorPhone,
        email: formData.grantorEmail,
        address: formData.grantorAddress || undefined,
        occupation: formData.grantorOccupation || undefined,
      } : undefined;

      // Prepare registration data
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        residentialAddress: formData.residentialAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        currentLocation: formData.currentLocation,
        ...(bankDetails && { bankDetails }),
        ...(grantor && { grantor }),
      };

      const response = await registerClient(registerData, files);
      
      toast({
        title: "Registration Successful!",
        description: response.message || "Your account has been created. Please check your email for verification.",
      });

      // Navigate to verification pending page
      navigate("/client/verification-pending");
    } catch (error) {
      // Error is handled by the store
    }
  };

  const getProgressPercentage = () => {
    return (step / 4) * 100;
  };

  const renderFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      return (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {fieldErrors[fieldName]}
        </p>
      );
    }
    return null;
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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                            id="name"
                            placeholder="John Doe"
                            className={`pl-10 h-12 ${fieldErrors.name ? 'border-destructive' : ''}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {renderFieldError('name')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          className={`h-12 ${fieldErrors.dateOfBirth ? 'border-destructive' : ''}`}
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        {renderFieldError('dateOfBirth')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className={`pl-10 h-12 ${fieldErrors.email ? 'border-destructive' : ''}`}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {renderFieldError('email')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+234 801 234 5678"
                            className={`pl-10 h-12 ${fieldErrors.phone ? 'border-destructive' : ''}`}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {renderFieldError('phone')}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Residential Address *</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Textarea
                          id="residentialAddress"
                          placeholder="Your current residential address"
                          className={`pl-10 min-h-[80px] ${fieldErrors.residentialAddress ? 'border-destructive' : ''}`}
                          value={formData.residentialAddress}
                          onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {renderFieldError('residentialAddress')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          id="city"
                          placeholder="City"
                          className={fieldErrors.city ? 'border-destructive' : ''}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        {renderFieldError('city')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <Select 
                          value={formData.state} 
                          onValueChange={(value) => setFormData({ ...formData, state: value })}
                        >
                          <SelectTrigger className={fieldErrors.state ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {nigeriaStates.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldError('state')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          disabled
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
                          id="currentLocation"
                          placeholder="e.g., 40.7128° N, 74.0060° W or 'Near Central Park'"
                          className={`pl-10 h-12 ${fieldErrors.currentLocation ? 'border-destructive' : ''}`}
                          value={formData.currentLocation}
                          onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {renderFieldError('currentLocation')}
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
                          disabled={isLoading}
                        />
                        <label htmlFor="profile-upload" className="cursor-pointer w-full">
                          {profileImagePreview ? (
                            <div className="text-center">
                              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-3 border-4 border-primary/20">
                                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
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
                              disabled={isLoading}
                            />
                            <label htmlFor="id-front-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                              {idCardFrontPreview ? (
                                <div className="text-center">
                                  <div className="w-full h-24 rounded overflow-hidden mb-2">
                                    <img src={idCardFrontPreview} alt="ID Front" className="w-full h-full object-contain" />
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
                              disabled={isLoading}
                            />
                            <label htmlFor="id-back-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                              {idCardBackPreview ? (
                                <div className="text-center">
                                  <div className="w-full h-24 rounded overflow-hidden mb-2">
                                    <img src={idCardBackPreview} alt="ID Back" className="w-full h-full object-contain" />
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
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        className={`pl-10 h-12 ${fieldErrors.password ? 'border-destructive' : ''}`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {renderFieldError('password')}
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[
                        { label: "8+ characters", met: formData.password.length >= 8 },
                        { label: "Uppercase", met: /[A-Z]/.test(formData.password) },
                        { label: "Lowercase", met: /[a-z]/.test(formData.password) },
                        { label: "Number", met: /\d/.test(formData.password) },
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-muted'}`} />
                          <span className={`text-xs ${req.met ? 'text-green-600' : 'text-muted-foreground'}`}>
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
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`pl-10 h-12 ${fieldErrors.confirmPassword ? 'border-destructive' : ''}`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {renderFieldError('confirmPassword')}
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Passwords match
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
                        id="bankName"
                        placeholder="e.g., First Bank, GTBank, Access Bank"
                        className={fieldErrors.bankName ? 'border-destructive' : ''}
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                      {renderFieldError('bankName')}
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
                      id="accountName"
                      placeholder="Name as it appears on bank account"
                      className={fieldErrors.accountName ? 'border-destructive' : ''}
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                    {renderFieldError('accountName')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number *</label>
                      <Input
                        id="accountNumber"
                        placeholder="10-digit account number"
                        className={fieldErrors.accountNumber ? 'border-destructive' : ''}
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        required
                        maxLength={10}
                        disabled={isLoading}
                      />
                      {renderFieldError('accountNumber')}
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
                          id="grantorName"
                          placeholder="Full name of grantor"
                          className={fieldErrors.grantorName ? 'border-destructive' : ''}
                          value={formData.grantorName}
                          onChange={(e) => setFormData({ ...formData, grantorName: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        {renderFieldError('grantorName')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Relationship *</label>
                        <Select 
                          value={formData.grantorRelationship} 
                          onValueChange={(value) => setFormData({ ...formData, grantorRelationship: value })}
                        >
                          <SelectTrigger className={fieldErrors.grantorRelationship ? 'border-destructive' : ''}>
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
                        {renderFieldError('grantorRelationship')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Grantor Phone *</label>
                        <Input
                          id="grantorPhone"
                          placeholder="+234 801 234 5678"
                          className={fieldErrors.grantorPhone ? 'border-destructive' : ''}
                          value={formData.grantorPhone}
                          onChange={(e) => setFormData({ ...formData, grantorPhone: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        {renderFieldError('grantorPhone')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Grantor Email *</label>
                        <Input
                          id="grantorEmail"
                          type="email"
                          placeholder="grantor@example.com"
                          className={fieldErrors.grantorEmail ? 'border-destructive' : ''}
                          value={formData.grantorEmail}
                          onChange={(e) => setFormData({ ...formData, grantorEmail: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        {renderFieldError('grantorEmail')}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Grantor Address</label>
                      <Textarea
                        placeholder="Grantor's residential address"
                        value={formData.grantorAddress}
                        onChange={(e) => setFormData({ ...formData, grantorAddress: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Grantor Occupation</label>
                      <Input
                        placeholder="Occupation of grantor"
                        value={formData.grantorOccupation}
                        onChange={(e) => setFormData({ ...formData, grantorOccupation: e.target.value })}
                        disabled={isLoading}
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
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <Button type="button" variant="hero" onClick={handleNextStep} disabled={isLoading}>
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
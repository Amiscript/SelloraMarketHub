import { Menu, Bell, Search, LogOut, User, Mail, Calendar, Shield, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface DashboardHeaderProps {
  onMenuClick: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  lastLogin?: string;
  userAvatar?: string;
  userPhone?: string;
  userCompany?: string;
  userJobTitle?: string;
  userBio?: string;
}

const DashboardHeader = ({ 
  onMenuClick, 
  userName = "User", 
  userEmail = "user@example.com",
  userRole = "User",
  lastLogin = "Just now",
  userAvatar = "",
  userPhone = "",
  userCompany = "",
  userJobTitle = "",
  userBio = ""
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(userAvatar);

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userName,
      email: userEmail,
      phone: userPhone,
      company: userCompany,
      jobTitle: userJobTitle,
      bio: userBio,
    },
  });

  const handleLogout = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
  };

  const handleEditProfile = () => {
    setProfileOpen(false);
    setEditProfileOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
  };

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Profile updated:", data);
    // Here you would typically make an API call to update the profile
    // Update the parent component state or context with new data
    
    // Update the displayed name if it changed
    if (userName !== data.name) {
      // You might want to update the parent component state here
      console.log("Name updated to:", data.name);
    }

    // Close the modal
    setEditProfileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-primary/20">
                      <span className="text-xs font-semibold text-primary-foreground">
                        {form.getValues("name").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">{form.getValues("name")}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Profile Dialog */}
                <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Profile Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Profile Header */}
                      <div className="flex items-center gap-4">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt={form.getValues("name")}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-primary/30">
                            <span className="text-2xl font-bold text-primary-foreground">
                              {form.getValues("name").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">{form.getValues("name")}</h3>
                          <p className="text-sm text-muted-foreground">{form.getValues("email")}</p>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{form.getValues("email")}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="font-medium">{userRole}</p>
                          </div>
                        </div>

                        {form.getValues("phone") && (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{form.getValues("phone")}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Last Login</p>
                            <p className="font-medium">{lastLogin}</p>
                          </div>
                        </div>

                        {form.getValues("bio") && (
                          <div className="pt-3 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Bio</p>
                            <p className="text-sm">{form.getValues("bio")}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleEditProfile}
                        >
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-primary/20">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {form.getValues("name").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                    <Camera className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Click the camera icon to upload a new photo
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Tell us a little about yourself..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground text-right">
                        {field.value?.length || 0}/500 characters
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;
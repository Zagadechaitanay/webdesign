import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shield, Eye, EyeOff, UserPlus, Lock, Sparkles, ArrowRight, X, CheckCircle, Star } from "lucide-react";

interface LoginFormProps {
  onLogin: (userType: 'student' | 'admin', credentials: { email: string; password: string }) => void;
  onCreate: (credentials: { name: string; email: string; studentId: string; password: string; branch: string; semester: string }) => void;
  onClose: () => void;
}

const LoginForm = ({ onLogin, onCreate, onClose }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [studentCredentials, setStudentCredentials] = useState({ email: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [createAccountData, setCreateAccountData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    branch: '',
    semester: ''
  });
  const [activeTab, setActiveTab] = useState('login');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('student', studentCredentials);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (createAccountData.password !== createAccountData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onCreate(createAccountData);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', adminCredentials);
  };

  const branches = [
    'Computer Engineering',
    'Electronics & Telecommunication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Automobile Engineering',
    'Instrumentation Engineering'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-0 glass-card animate-scale-in">
        {/* Enhanced Header */}
        <div className="bg-gradient-hero p-10 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full animate-float-slow"></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 bg-white rounded-full animate-float-slow delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full animate-pulse-slow"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
              <BookOpen className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">Welcome Back</h2>
            <p className="text-primary-foreground/90 text-xl">Access your Digi Diploma account</p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 glass rounded-full flex items-center justify-center text-primary-foreground hover:bg-background/30 transition-all duration-300 hover-scale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enhanced Login Tabs */}
        <div className="p-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 glass p-1 rounded-2xl">
              <TabsTrigger 
                value="login" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-xl"
              >
                <BookOpen className="w-4 h-4" />
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-xl"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Student Login */}
            <TabsContent value="login" className="space-y-8">
              <form onSubmit={handleStudentLogin} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="student-email" className="text-sm font-medium">Email / Student ID</Label>
                  <Input
                    id="student-email"
                    type="text"
                    placeholder="Enter your email or student ID"
                    value={studentCredentials.email}
                    onChange={(e) => setStudentCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="h-14 border-border/50 focus:border-primary transition-colors focus-ring"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="student-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="student-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={studentCredentials.password}
                      onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="h-14 pr-14 border-border/50 focus:border-primary transition-colors focus-ring"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 btn-hero group text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Login to Account
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </TabsContent>

            {/* Enhanced Create Account */}
            <TabsContent value="create" className="space-y-8">
              <form onSubmit={handleCreateAccount} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="create-name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="create-name"
                      type="text"
                      placeholder="Your full name"
                      value={createAccountData.name}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-14 border-border/50 focus:border-primary transition-colors focus-ring"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="create-studentId" className="text-sm font-medium">Student ID</Label>
                    <Input
                      id="create-studentId"
                      type="text"
                      placeholder="Student ID"
                      value={createAccountData.studentId}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, studentId: e.target.value }))}
                      className="h-14 border-border/50 focus:border-primary transition-colors focus-ring"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="create-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="your.email@college.edu"
                    value={createAccountData.email}
                    onChange={(e) => setCreateAccountData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-14 border-border/50 focus:border-primary transition-colors focus-ring"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="create-branch" className="text-sm font-medium">Branch</Label>
                    <select
                      id="create-branch"
                      value={createAccountData.branch}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, branch: e.target.value }))}
                      className="h-14 w-full px-4 border border-border/50 bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="create-semester" className="text-sm font-medium">Semester</Label>
                    <select
                      id="create-semester"
                      value={createAccountData.semester}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, semester: e.target.value }))}
                      className="h-14 w-full px-4 border border-border/50 bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="create-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={createAccountData.password}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-14 pr-14 border-border/50 focus:border-primary transition-colors focus-ring"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="create-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="create-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={createAccountData.confirmPassword}
                    onChange={(e) => setCreateAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="h-14 border-border/50 focus:border-primary transition-colors focus-ring"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-button hover:shadow-glow transition-all duration-300 group text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Create Student Account
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Enhanced Footer */}
          <div className="text-center mt-10 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-6">
              Need help? Contact your institution
            </p>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="text-sm hover:bg-muted/50 transition-colors"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
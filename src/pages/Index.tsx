import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import BranchSelection from "@/components/BranchSelection";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Award, 
  GraduationCap, 
  Star,
  ArrowRight,
  Play,
  Code,
  Smartphone,
  User,
  Cpu,
  Brain,
  Target,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Menu
} from "lucide-react";
import CollegeNoticeBoard from "@/components/CollegeNoticeBoard";
import ScrollingNoticeBoard from "@/components/ScrollingNoticeBoard";
import LoginForm from "@/components/LoginForm";
import { authService } from "@/lib/auth";

const Index = () => {
  const [currentState, setCurrentState] = useState<'home' | 'login' | 'branches'>('home');
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 1250,
    faculty: 45,
    courses: 120,
    materials: 850
  });

  useEffect(() => {
    // Always fetch public data for landing page
    fetchNotices();
    fetchStats();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices/public");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/public-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      // Use default stats if API fails
      setStats({
        students: 1250,
        faculty: 45,
        courses: 120,
        materials: 850
      });
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const success = await login(credentials);
      if (success) {
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        
        // Navigate based on user type
        if (user.userType === 'admin') {
          toast({ title: "Admin Login Successful!", description: `Welcome back, ${user.name}! Redirecting to admin panel...` });
          setTimeout(() => navigate('/admin-dashboard'), 1000);
        } else {
          toast({ title: "Student Login Successful!", description: `Welcome back, ${user.name}! Redirecting to student dashboard...` });
          setTimeout(() => navigate('/student-dashboard'), 1000);
        }
      } else {
        toast({ title: "Login Failed", description: "Invalid credentials. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Login Failed", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleCreateAccount = async (credentials) => {
    try {
      const success = await register(credentials);
      if (success) {
        toast({ title: "Account Created!", description: `Welcome ${credentials.name}! You can now login with your credentials.` });
        setCurrentState('home');
      } else {
        toast({ title: "Registration Failed", description: "Failed to register user.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Registration Failed", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleBranchSelect = (branchId) => {
    toast({ title: "Branch Selected", description: "Redirecting to semester selection..." });
    navigate('/semester-selection', { state: { selectedBranch: branchId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    DigiDiploma
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setCurrentState('login')}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Admin Login
              </Button>
              <Button 
                onClick={() => setCurrentState('login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Student Login
              </Button>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">Revolutionizing Digital Education</span>
              <Star className="w-4 h-4 text-yellow-300" />
          </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                DigiDiploma
              </span>
          </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Your comprehensive digital college portal for modern education management. 
              <span className="block text-lg text-blue-200 mt-3">
                Experience seamless learning with our advanced study materials, project management, and interactive resources.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
            onClick={() => setCurrentState('login')}
                className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Get Started Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 h-14 px-8 text-lg font-bold border-2 border-black"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
            Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.students}+</div>
                <div className="text-blue-200 text-sm">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.faculty}+</div>
                <div className="text-blue-200 text-sm">Faculty Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.courses}+</div>
                <div className="text-blue-200 text-sm">Courses Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.materials}+</div>
                <div className="text-blue-200 text-sm">Study Materials</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login and Branch Selection Panel */}
      {currentState === 'login' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
          <LoginForm 
            onLogin={handleLogin}
            onCreate={handleCreateAccount}
            onClose={() => setCurrentState('home')}
          />
          </div>
        </div>
      )}
      
      {currentState === 'branches' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
          <BranchSelection 
            onBranchSelect={handleBranchSelect}
          />
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose DigiDiploma?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive digital platform designed specifically for diploma students.
            </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Comprehensive Study Materials"
              description="Access PDFs, PPTs, videos, and handwritten notes organized by branch, semester, and subject with advanced search capabilities."
              color="blue"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="7 Engineering Branches"
              description="Complete coverage across Computer, IT, Mechanical, Electrical, Civil, ENTC, and Chemical Engineering branches."
              color="green"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="6 Semester Structure"
              description="Organized semester-wise content with MSBTE K-Scheme subjects, quizzes, and progress tracking."
              color="purple"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Project Management"
              description="Showcase your projects, collaborate with peers, and build your portfolio with our integrated project system."
              color="orange"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Secure & Reliable"
              description="Enterprise-grade security with role-based access control, ensuring your data is always protected."
              color="red"
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="24/7 Access"
              description="Access your learning materials anytime, anywhere with our responsive web platform and mobile optimization."
              color="indigo"
            />
          </div>
            </div>
      </section>

      {/* Branch Overview Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Available Engineering Branches
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of diploma engineering programs designed for the modern industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BranchCard
              icon={<Code className="w-8 h-8" />}
              title="Computer Engineering"
              description="Programming, software development, and computer systems with modern technologies."
              subjects={["Programming", "Database", "Web Development", "Networking"]}
              color="blue"
            />
            <BranchCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Information Technology"
              description="IT infrastructure, software applications, and digital transformation solutions."
              subjects={["IT Fundamentals", "Software Engineering", "Cloud Computing", "Cybersecurity"]}
              color="green"
            />
            <BranchCard
              icon={<Cpu className="w-8 h-8" />}
              title="Mechanical Engineering"
              description="Machine design, manufacturing processes, and mechanical systems engineering."
              subjects={["Machine Design", "Thermodynamics", "Manufacturing", "CAD/CAM"]}
              color="orange"
            />
            <BranchCard
              icon={<Brain className="w-8 h-8" />}
              title="Electrical Engineering"
              description="Electrical systems, power generation, and electronic circuit design."
              subjects={["Circuit Theory", "Power Systems", "Electronics", "Control Systems"]}
              color="yellow"
            />
            <BranchCard
              icon={<Target className="w-8 h-8" />}
              title="Civil Engineering"
              description="Infrastructure development, construction management, and structural design."
              subjects={["Structural Analysis", "Construction", "Surveying", "Transportation"]}
              color="brown"
            />
            <BranchCard
              icon={<Brain className="w-8 h-8" />}
              title="ENTC Engineering"
              description="Electronics and telecommunications with modern communication systems."
              subjects={["Electronics", "Communication", "Signal Processing", "Telecom"]}
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Hear from students who have transformed their learning experience with DigiDiploma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Aarav Patel"
              role="Computer Engineering Student"
              text="DigiDiploma has completely transformed how I study. The organized materials and project showcase features are incredible!"
              rating={5}
            />
            <TestimonialCard
              name="Priya Sharma"
              role="Electrical Engineering Student"
              text="The branch-specific content and semester organization make it so easy to find exactly what I need for my studies."
              rating={5}
            />
            <TestimonialCard
              name="Rahul Verma"
              role="Mechanical Engineering Student"
              text="I love how I can access study materials 24/7 and collaborate on projects with my classmates. Highly recommended!"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have already discovered the power of digital education with DigiDiploma.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              onClick={() => setCurrentState('login')}
              className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-semibold shadow-xl"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 h-14 px-8 text-lg font-bold border-2 border-black"
            >
              <Phone className="w-6 h-6 mr-3" />
              Get Support
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    DigiDiploma
                  </h3>
                  <p className="text-slate-300 text-sm">Revolutionizing Digital Education</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                Empowering diploma students with comprehensive study materials, project management, and interactive learning resources. Experience the future of education with our advanced digital platform.
              </p>
              
                             {/* Social Media Links */}
               <div className="flex space-x-3">
                 <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
                 <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                 <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
                 <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                 <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
               </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2" />
                    Contact
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentState('login')}
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center"
                  >
                    <ArrowRight className="w-3 h-3 mr-2" />
                    Admin Login
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentState('login')}
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center"
                  >
                    <ArrowRight className="w-3 h-3 mr-2" />
                    Student Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Information</h4>
              <ul className="space-y-4">
                <li className="flex items-start text-slate-300">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">Pune, Maharashtra, India</p>
                  </div>
                </li>
                <li className="flex items-start text-slate-300">
                  <Mail className="w-5 h-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm">zagadechaitanya@gmail.com</p>
                  </div>
                </li>
                <li className="flex items-start text-slate-300">
                  <Phone className="w-5 h-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm">+91 98765 43210</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Footer Sections */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 pt-8 border-t border-slate-700">
            {/* Features */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Platform Features</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Study Materials Management</li>
                <li>• Project Showcase</li>
                <li>• Branch-wise Organization</li>
                <li>• Semester Structure</li>
                <li>• Interactive Learning</li>
                <li>• Progress Tracking</li>
              </ul>
            </div>

            {/* Branches */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Engineering Branches</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Computer Engineering</li>
                <li>• Information Technology</li>
                <li>• Mechanical Engineering</li>
                <li>• Electrical Engineering</li>
                <li>• Civil Engineering</li>
                <li>• ENTC Engineering</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support & Help</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• 24/7 Technical Support</li>
                <li>• User Documentation</li>
                <li>• FAQ Section</li>
                <li>• Video Tutorials</li>
                <li>• Community Forum</li>
                <li>• Feedback System</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} DigiDiploma. All rights reserved.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Designed and Developed by{' '}
                  <a 
                    href="https://github.com/Onkar3333/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                  >
                    Onkar Bansode
                  </a>
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <Link to="/privacy" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component definitions
const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    red: "bg-red-50 border-red-200 text-red-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600"
  };

  return (
    <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
    </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </Card>
  );
};

const BranchCard = ({ icon, title, description, subjects, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
    brown: "bg-amber-50 border-amber-200 text-amber-600"
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <div className={`w-14 h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
  </div>
    </Card>
  );
};

const TestimonialCard = ({ name, role, text, rating }) => (
  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
    <div className="flex items-center mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-slate-600 mb-6 italic">"{text}"</p>
    <div>
      <div className="font-semibold text-slate-900">{name}</div>
      <div className="text-sm text-slate-500">{role}</div>
  </div>
  </Card>
);

const SocialLink = ({ href, icon, label = "" }) => (
  <a 
    href={href} 
    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
    title={label}
  >
    {icon}
  </a>
);

export default Index;

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import BranchSelection from "@/components/BranchSelection";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { userManagement } from "@/lib/userManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Users, Award } from "lucide-react";
import CollegeNoticeBoard from "@/components/CollegeNoticeBoard";
import ScrollingNoticeBoard from "@/components/ScrollingNoticeBoard";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  const [currentState, setCurrentState] = useState<'home' | 'login' | 'branches'>('home');
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Login Successful!", description: `Welcome back, ${data.user.name}!` });
        // Redirect to branch subject page
        navigate(`/branch/${encodeURIComponent(data.user.branch)}`);
      } else {
        toast({ title: "Login Failed", description: data.error || "Invalid credentials. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Login Failed", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleCreateAccount = async (credentials) => {
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Account Created!", description: `Welcome ${credentials.name}! You can now login with your credentials.` });
        // Redirect to branch subject page after registration (optional)
        // navigate(`/branch/${encodeURIComponent(credentials.branch)}`);
      } else {
        toast({ title: "Registration Failed", description: data.error || "Failed to register user.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Registration Failed", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleBranchSelect = (branchId) => {
    userManagement.updateUserBranch(branchId);
    toast({ title: "Branch Selected", description: "Redirecting to semester selection..." });
    navigate('/semester-selection', { state: { selectedBranch: branchId } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center py-4 px-6 bg-white/80 shadow-md rounded-b-xl sticky top-0 z-10">
        <div className="text-2xl font-bold text-primary">DigiDiploma</div>
        <div className="flex gap-6">
          <Link to="/" className="text-lg font-medium text-foreground hover:text-primary transition">Home</Link>
          <Link to="/about" className="text-lg font-medium text-foreground hover:text-primary transition">About</Link>
          <button
            className="text-lg font-medium text-foreground hover:text-primary transition"
            onClick={() => navigate('/admin')}
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-20 mb-0 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
        {/* SVG Wave */}
        <svg className="absolute bottom-0 left-0 w-full h-24" viewBox="0 0 1440 320"><path fill="#e0e7ff" fillOpacity="1" d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,197.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-primary to-primary-glow rounded-full p-6 shadow-glow animate-glow-slow mb-6">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-primary text-center mb-3 drop-shadow-lg">
            Welcome to DigiDiploma
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mb-2">
            Your premium digital college portal for notices, resources, and more.
          </p>
          <button
            className="mt-6 btn-hero px-8 py-3 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200 animate-bounce"
            onClick={() => setCurrentState('login')}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Centered Login/Register Button */}
      {currentState === 'home' && (
        <div className="flex justify-center my-8">
          <button
            className="btn-hero px-8 py-3 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={() => setCurrentState('login')}
          >
            Login / Register
          </button>
        </div>
      )}

      {/* Login and Branch Selection Panel */}
      {currentState === 'login' && (
        <div className="flex justify-center my-8">
          <LoginForm 
            onLogin={handleLogin}
            onCreate={handleCreateAccount}
            onClose={() => setCurrentState('home')}
          />
        </div>
      )}
      {currentState === 'branches' && (
        <div className="flex justify-center my-8">
          <BranchSelection 
            onBranchSelect={handleBranchSelect} 
            userSelectedBranch={userManagement.getCurrentUser()?.selectedBranch}
          />
        </div>
      )}

      {/* Animated Statistics Section */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12">
        <AnimatedStats />
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-12">
          {/* Study Materials */}
          <div className="flex-1 bg-blue-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-blue-500 rounded-xl p-4 mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-blue-700">Study Materials</h3>
            <p className="text-slate-600 text-lg">PDFs, PPTs, and handwritten notes organized by branch, semester, and subject</p>
          </div>
          {/* 7 Branches */}
          <div className="flex-1 bg-pink-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-pink-400 rounded-xl p-4 mb-5">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-pink-600">7 Branches</h3>
            <p className="text-slate-600 text-lg">Comprehensive coverage across all diploma engineering branches</p>
          </div>
          {/* 6 Semesters */}
          <div className="flex-1 bg-blue-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-white border border-blue-200 rounded-xl p-4 mb-5">
              <Award className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-blue-700">6 Semesters</h3>
            <p className="text-slate-600 text-lg">Complete semester-wise organization with quizzes and assessments</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12">
        <Testimonials />
      </section>

      {/* Call-to-Action Section */}
      <section className="w-full bg-gradient-to-r from-primary to-primary-glow py-12 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to start your digital learning journey?</h2>
        <Link to="/" className="btn-hero px-8 py-3 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200 bg-white text-primary mt-2">
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-muted-foreground bg-white/80 mt-auto">
        &copy; {new Date().getFullYear()} DigiDiploma. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;

const AnimatedStats = () => {
  const [users, setUsers] = useState(0);
  const [materials, setMaterials] = useState(0);
  const [achievements, setAchievements] = useState(0);

  useEffect(() => {
    let u = 0, m = 0, a = 0;
    const interval = setInterval(() => {
      if (u < 1200) setUsers(u += 24);
      if (m < 350) setMaterials(m += 7);
      if (a < 95) setAchievements(a += 2);
      if (u >= 1200 && m >= 350 && a >= 95) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-12">
      <StatCard label="Active Users" value={users} icon={<Users className="w-8 h-8 text-blue-500" />} />
      <StatCard label="Study Materials" value={materials} icon={<BookOpen className="w-8 h-8 text-green-500" />} />
      <StatCard label="Achievements" value={achievements} icon={<Award className="w-8 h-8 text-yellow-500" />} />
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="flex-1 bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-3xl font-bold mb-2">{value}+</h3>
    <p className="text-gray-500 text-lg">{label}</p>
  </div>
);

const Testimonials = () => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-center mb-8 text-gradient-primary">What Our Users Say</h2>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
      <TestimonialCard
        name="Aarav Patel"
        role="Student, ENTC"
        text="DigiDiploma made it so easy to find all my study materials and stay updated with college notices!"
      />
      <TestimonialCard
        name="Priya Sharma"
        role="Faculty, Electrical"
        text="The portal is intuitive and saves me a lot of time managing resources for my students."
      />
      <TestimonialCard
        name="Rahul Verma"
        role="Student, Computer"
        text="I love the clean design and how everything is organized by semester and branch."
      />
    </div>
  </div>
);

const TestimonialCard = ({ name, role, text }) => (
  <div className="flex-1 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center mb-4">
      <Sparkles className="w-8 h-8 text-white" />
    </div>
    <p className="text-lg text-muted-foreground mb-4">"{text}"</p>
    <div className="font-bold text-foreground">{name}</div>
    <div className="text-sm text-muted-foreground">{role}</div>
  </div>
);

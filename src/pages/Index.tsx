import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import BranchSelection from "@/components/BranchSelection";
import LoginForm from "@/components/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { userManagement } from "@/lib/userManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Users, Award } from "lucide-react";
import CollegeNoticeBoard from "@/components/CollegeNoticeBoard";
import ScrollingNoticeBoard from "@/components/ScrollingNoticeBoard";

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

  const handleLogin = (type, credentials) => {
    const user = userManagement.login(credentials.email, credentials.password, type);
    if (user) {
      toast({ title: "Login Successful!", description: `Welcome back, ${user.name}!` });
      setUserType(type);
      if (type === 'admin') {
        navigate('/admin');
      } else {
        if (user.selectedBranch && user.selectedSemester) {
          navigate(`/semester/${user.selectedSemester}`, {
            state: { selectedBranch: user.selectedBranch, selectedSemester: user.selectedSemester, userType: "student" }
          });
        } else if (user.selectedBranch) {
          navigate('/semester-selection', { state: { selectedBranch: user.selectedBranch } });
        } else {
          setCurrentState('branches');
        }
      }
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials. Please try again.", variant: "destructive" });
    }
  };

  const handleCreateAccount = (credentials) => {
    if (userManagement.userExists(credentials.email, 'student')) {
      toast({ title: "Account Already Exists", description: "A user with this email already exists. Please login instead.", variant: "destructive" });
      return;
    }
    const newUser = userManagement.createUser(credentials);
    toast({ title: "Account Created!", description: `Welcome ${newUser.name}! You can now login with your credentials.` });
  };

  const handleBranchSelect = (branchId) => {
    userManagement.updateUserBranch(branchId);
    toast({ title: "Branch Selected", description: "Redirecting to semester selection..." });
    navigate('/semester-selection', { state: { selectedBranch: branchId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      <div className="max-w-3xl mx-auto p-6">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-14 mb-10">
          <div className="bg-gradient-to-tr from-primary to-primary-glow rounded-full p-6 shadow-glow animate-glow-slow mb-6">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-primary text-center mb-3 drop-shadow-lg">
            Welcome to DigiDiploma
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mb-2">
            Your premium digital college portal for notices, resources, and more. Login or browse notices below.
          </p>
        </div>

        {/* Login and Branch Selection */}
        <div className="mb-10">
          {currentState === 'login' && (
            <LoginForm 
              onLogin={handleLogin}
              onCreate={handleCreateAccount}
              onClose={() => setCurrentState('home')}
            />
          )}
          {currentState === 'branches' && (
            <BranchSelection 
              onBranchSelect={handleBranchSelect} 
              userSelectedBranch={userManagement.getCurrentUser()?.selectedBranch}
            />
          )}
          {currentState === 'home' && (
            <div className="flex justify-center">
              <button className="btn-hero px-8 py-3 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200" onClick={() => setCurrentState('login')}>
                Login / Register
              </button>
            </div>
          )}
        </div>

        {/* College Notice Board (Official) */}
        <div className="mb-10">
          <CollegeNoticeBoard />
        </div>

        {/* Dynamic Scrolling Notice Board */}
        <div className="mb-10">
          <ScrollingNoticeBoard />
        </div>

        {/* Feature Cards Section */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-12">
          {/* Study Materials */}
          <div className="flex-1 bg-gray-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-orange-400 rounded-xl p-4 mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Study Materials</h3>
            <p className="text-gray-500 text-lg">PDFs, PPTs, and handwritten notes organized by branch, semester, and subject</p>
          </div>
          {/* 7 Branches */}
          <div className="flex-1 bg-gray-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-gradient-to-tr from-yellow-300 to-orange-200 rounded-xl p-4 mb-5">
              <Users className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2">7 Branches</h3>
            <p className="text-gray-500 text-lg">Comprehensive coverage across all diploma engineering branches</p>
          </div>
          {/* 6 Semesters */}
          <div className="flex-1 bg-gray-50 rounded-2xl shadow-lg p-10 flex flex-col items-start hover:shadow-educational hover:-translate-y-1 transition-all duration-300">
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
              <Award className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2">6 Semesters</h3>
            <p className="text-gray-500 text-lg">Complete semester-wise organization with quizzes and assessments</p>
          </div>
        </div>

        {/* Removed dynamic College Notice Panel section */}
      </div>
    </div>
  );
};

export default Index;

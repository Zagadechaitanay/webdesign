import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  ArrowLeft,
  Clock,
  Star,
  TrendingUp,
  Code
} from "lucide-react";
import React from "react";
import { noticeManagement, Notice } from "@/lib/noticeManagement";
import StudentProjectSection from "@/components/StudentProjectSection";

// Temporary NoticeBoard component (to be replaced with dynamic data)
const NoticeBoard = () => {
  const [notices, setNotices] = React.useState<Notice[]>(noticeManagement.getAllNotices());

  React.useEffect(() => {
    // Listen for storage changes (in case admin updates in another tab)
    const handler = () => setNotices(noticeManagement.getAllNotices());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <Card className="mb-8 p-6 glass-card border-l-4 border-primary">
      <h2 className="text-xl font-bold mb-4 text-primary">Notice Board</h2>
      <ul className="space-y-3">
        {notices.map((notice, idx) => (
          <li key={notice.id} className="bg-muted/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">{notice.title}</span>
              <span className="text-xs text-muted-foreground">{notice.date}</span>
            </div>
            <div className="text-muted-foreground text-sm">{notice.content}</div>
          </li>
        ))}
        {notices.length === 0 && <li className="text-muted-foreground">No notices yet.</li>}
      </ul>
    </Card>
  );
};

const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBranch, selectedSemester, userType } = location.state || {};

  const handleLogout = () => {
    navigate("/");
  };

  const handleBack = () => {
    navigate("/semester-selection", {
      state: { selectedBranch }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  Student Dashboard
                </h1>
                <p className="text-primary-foreground/80">
                  {selectedBranch} • Semester {selectedSemester}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Notice Board */}
      <div className="container mx-auto">
        <NoticeBoard />
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 p-6 glass-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Welcome to Semester {selectedSemester}
              </h2>
              <p className="text-muted-foreground">
                Access your subjects, assignments, and learning resources for {selectedBranch}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">6</h3>
                <p className="text-muted-foreground">Active Subjects</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">85%</h3>
                <p className="text-muted-foreground">Attendance</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">8.5</h3>
                <p className="text-muted-foreground">CGPA</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Engineering Mathematics",
              instructor: "Dr. Sarah Johnson",
              progress: 75,
              color: "from-blue-500 to-blue-600"
            },
            {
              name: "Programming Fundamentals",
              instructor: "Prof. Michael Chen",
              progress: 90,
              color: "from-green-500 to-green-600"
            },
            {
              name: "Digital Electronics",
              instructor: "Dr. Emily Davis",
              progress: 60,
              color: "from-purple-500 to-purple-600"
            },
            {
              name: "Workshop Practice",
              instructor: "Mr. Robert Wilson",
              progress: 85,
              color: "from-orange-500 to-orange-600"
            },
            {
              name: "Engineering Drawing",
              instructor: "Ms. Lisa Anderson",
              progress: 70,
              color: "from-red-500 to-red-600"
            },
            {
              name: "Basic Electronics",
              instructor: "Dr. James Brown",
              progress: 80,
              color: "from-teal-500 to-teal-600"
            }
          ].map((subject, index) => (
            <Card key={index} className="p-6 glass-card hover-lift cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">{subject.instructor}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium text-foreground">{subject.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-muted-foreground">4.2/5.0</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mt-12">
          <StudentProjectSection 
            currentUser={{
              studentId: "12345", // This should come from actual logged-in user data
              name: "John Doe", // This should come from actual logged-in user data
              branch: selectedBranch || "Computer Science",
              semester: selectedSemester || 2
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 
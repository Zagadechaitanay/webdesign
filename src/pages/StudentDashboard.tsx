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
import BranchSpecificSubjects from "@/components/BranchSpecificSubjects";

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
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary-foreground">
                    Student Dashboard
                  </h1>
                  <p className="text-primary-foreground/90 text-lg">
                    {selectedBranch} • Semester {selectedSemester}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
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
        {/* Enhanced Welcome Card */}
        <Card className="mb-8 p-8 border-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Welcome to Semester {selectedSemester}!
              </h2>
              <p className="text-lg text-muted-foreground mb-3">
                Access your subjects, assignments, and learning resources for {selectedBranch}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Academic Year 2024-25</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>120 Students in Branch</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">8.5</div>
              <div className="text-sm text-muted-foreground">Current CGPA</div>
            </div>
          </div>
        </Card>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-blue-700">6</h3>
                <p className="text-blue-600 font-medium">Active Subjects</p>
                <p className="text-xs text-blue-500 mt-1">This semester</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-green-700">85%</h3>
                <p className="text-green-600 font-medium">Attendance</p>
                <p className="text-xs text-green-500 mt-1">Good standing</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-700">8.5</h3>
                <p className="text-purple-600 font-medium">Current CGPA</p>
                <p className="text-xs text-purple-500 mt-1">Excellent!</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-orange-700">120</h3>
                <p className="text-orange-600 font-medium">Classmates</p>
                <p className="text-xs text-orange-500 mt-1">In your branch</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Branch-Specific Subjects */}
        <div className="mt-12">
          <BranchSpecificSubjects 
            studentBranch={selectedBranch || "Computer Engineering"}
            studentSemester={selectedSemester || "1"}
          />
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
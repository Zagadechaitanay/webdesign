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
import React, { useState, useEffect } from "react";
import StudentProjectSection from "@/components/StudentProjectSection";
import BranchSpecificSubjects from "@/components/BranchSpecificSubjects";
import UserNotifications from "@/components/UserNotifications";


const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBranch, selectedSemester, userType } = location.state || {};
  
  // User state - get from location state or create default
  const [user, setUser] = useState({
    id: location.state?.user?.id || '68b5672f562c89097cf11bf9', // Valid MongoDB ObjectId
    name: location.state?.user?.name || 'Test Student',
    email: location.state?.user?.email || 'test@student.com',
    branch: selectedBranch || 'Computer Engineering',
    userType: userType || 'student',
    semester: selectedSemester || '1'
  });

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
      {/* Responsive Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground">
                    Student Dashboard
                  </h1>
                  <p className="text-primary-foreground/90 text-sm sm:text-base lg:text-lg">
                    {selectedBranch} • Semester {selectedSemester}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Notice Board */}
      <div className="container mx-auto px-4 py-6">
        <UserNotifications 
          userId={user?.id || 'default-user-id'} 
          userBranch={user?.branch || 'Computer Engineering'} 
          userType={user?.userType || 'student'} 
        />
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Enhanced Welcome Card */}
        <Card className="mb-6 lg:mb-8 p-4 lg:p-8 border-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2">
                Welcome back, {user.name}!
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground mb-3">
                Access your subjects, assignments, and learning resources for {user.branch} - Semester {user.semester}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="group p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-blue-50/80 to-blue-100/50 backdrop-blur-sm hover:from-blue-100 hover:to-blue-200/70 hover:scale-105 hover:rotate-1">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">6</h3>
                <p className="text-blue-600 font-medium text-sm lg:text-base group-hover:text-blue-700 transition-colors">Active Subjects</p>
                <p className="text-xs text-blue-500 mt-1 group-hover:text-blue-600 transition-colors">This semester</p>
              </div>
            </div>
          </Card>

          <Card className="group p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-green-50/80 to-green-100/50 backdrop-blur-sm hover:from-green-100 hover:to-green-200/70 hover:scale-105 hover:-rotate-1">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-green-700 group-hover:text-green-800 transition-colors">85%</h3>
                <p className="text-green-600 font-medium text-sm lg:text-base group-hover:text-green-700 transition-colors">Attendance</p>
                <p className="text-xs text-green-500 mt-1 group-hover:text-green-600 transition-colors">Good standing</p>
              </div>
            </div>
          </Card>

          <Card className="group p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-purple-50/80 to-purple-100/50 backdrop-blur-sm hover:from-purple-100 hover:to-purple-200/70 hover:scale-105 hover:rotate-1">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-purple-700 group-hover:text-purple-800 transition-colors">8.5</h3>
                <p className="text-purple-600 font-medium text-sm lg:text-base group-hover:text-purple-700 transition-colors">Current CGPA</p>
                <p className="text-xs text-purple-500 mt-1 group-hover:text-purple-600 transition-colors">Excellent!</p>
              </div>
            </div>
          </Card>

          <Card className="group p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-orange-50/80 to-orange-100/50 backdrop-blur-sm hover:from-orange-100 hover:to-orange-200/70 hover:scale-105 hover:-rotate-1">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Users className="w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">120</h3>
                <p className="text-orange-600 font-medium text-sm lg:text-base group-hover:text-orange-700 transition-colors">Classmates</p>
                <p className="text-xs text-orange-500 mt-1 group-hover:text-orange-600 transition-colors">In your branch</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Branch-Specific Subjects */}
        <div className="mt-8 lg:mt-12">
          <BranchSpecificSubjects 
            studentBranch={user.branch}
            studentSemester={user.semester}
          />
        </div>

        {/* Projects Section */}
        <div className="mt-8 lg:mt-12">
          <StudentProjectSection 
            currentUser={{
              studentId: user.id,
              name: user.name,
              branch: user.branch,
              semester: parseInt(user.semester)
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 
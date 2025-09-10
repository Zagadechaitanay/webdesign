import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Code,
  Award,
  Target,
  BarChart3,
  FileText,
  Video,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  BookMarked,
  Timer
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

  // Dashboard state
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'assignment', title: 'Data Structures Assignment', subject: 'CS201', dueDate: '2024-01-15', status: 'pending' },
    { id: 2, type: 'material', title: 'Database Design PPT', subject: 'CS202', uploadedAt: '2024-01-10', status: 'viewed' },
    { id: 3, type: 'quiz', title: 'Operating Systems Quiz', subject: 'CS203', score: 85, status: 'completed' },
    { id: 4, type: 'notice', title: 'Mid-term Exam Schedule', subject: 'General', status: 'unread' }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Data Structures Lab', time: '10:00 AM', date: 'Today', type: 'lab' },
    { id: 2, title: 'Database Systems Lecture', time: '2:00 PM', date: 'Tomorrow', type: 'lecture' },
    { id: 3, title: 'Project Submission', time: '11:59 PM', date: 'Jan 20', type: 'deadline' }
  ]);

  const [studyProgress, setStudyProgress] = useState({
    totalSubjects: 6,
    completedSubjects: 4,
    assignmentsCompleted: 12,
    totalAssignments: 18,
    studyStreak: 7,
    weeklyGoal: 25,
    weeklyProgress: 18
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Student Dashboard
                  </h1>
                  <p className="text-slate-600 text-sm">
                    {user.branch} • Semester {user.semester}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 hover:bg-slate-50"
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
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                  <p className="text-blue-100 text-lg">Ready to continue your learning journey?</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Academic Year 2024-25</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>120 Students in Branch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>CGPA: 8.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{studyProgress.totalSubjects}</h3>
                  <p className="text-slate-600 font-medium">Active Subjects</p>
                  <p className="text-xs text-slate-500">This semester</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{studyProgress.weeklyProgress}/{studyProgress.weeklyGoal}</h3>
                  <p className="text-slate-600 font-medium">Weekly Goal</p>
                  <Progress value={(studyProgress.weeklyProgress / studyProgress.weeklyGoal) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{studyProgress.studyStreak}</h3>
                  <p className="text-slate-600 font-medium">Day Streak</p>
                  <p className="text-xs text-slate-500">Keep it up!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">{Math.round((studyProgress.assignmentsCompleted / studyProgress.totalAssignments) * 100)}%</h3>
                  <p className="text-slate-600 font-medium">Assignments</p>
                  <p className="text-xs text-slate-500">{studyProgress.assignmentsCompleted}/{studyProgress.totalAssignments} completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'material' ? 'bg-green-100 text-green-600' :
                      activity.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'assignment' ? <FileText className="w-5 h-5" /> :
                       activity.type === 'material' ? <Download className="w-5 h-5" /> :
                       activity.type === 'quiz' ? <Award className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                      <p className="text-sm text-slate-600">{activity.subject}</p>
                      {activity.dueDate && <p className="text-xs text-slate-500">Due: {activity.dueDate}</p>}
                      {activity.score && <p className="text-xs text-green-600">Score: {activity.score}%</p>}
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : activity.status === 'pending' ? 'destructive' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.type === 'lab' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'lecture' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {event.type === 'lab' ? <Code className="w-4 h-4" /> :
                     event.type === 'lecture' ? <BookOpen className="w-4 h-4" /> :
                     <Timer className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{event.title}</h4>
                      <p className="text-sm text-slate-600">{event.time} • {event.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {Math.round((studyProgress.completedSubjects / studyProgress.totalSubjects) * 100)}%
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800">Subjects Completed</h3>
                <p className="text-sm text-slate-600">{studyProgress.completedSubjects}/{studyProgress.totalSubjects}</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                    {Math.round((studyProgress.assignmentsCompleted / studyProgress.totalAssignments) * 100)}%
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800">Assignments Done</h3>
                <p className="text-sm text-slate-600">{studyProgress.assignmentsCompleted}/{studyProgress.totalAssignments}</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {studyProgress.studyStreak}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800">Study Streak</h3>
                <p className="text-sm text-slate-600">Days in a row</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch-Specific Subjects */}
        <div className="mb-8">
          <BranchSpecificSubjects 
            studentBranch={user.branch}
            studentSemester={user.semester}
          />
        </div>

        {/* Projects Section */}
        <div className="mb-8">
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
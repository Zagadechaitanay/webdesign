import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Bell, 
  TrendingUp, 
  Activity,
  Award,
  Clock,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Settings
} from 'lucide-react';

interface ModernAdminDashboardProps {
  users: any[];
  materials: any[];
  notices: any[];
  maintenanceMode: boolean;
}

const ModernAdminDashboard: React.FC<ModernAdminDashboardProps> = ({
  users,
  materials,
  notices,
  maintenanceMode
}) => {
  const stats = {
    totalUsers: users.length,
    totalStudents: users.filter(u => u.userType === 'student').length,
    totalAdmins: users.filter(u => u.userType === 'admin').length,
    totalMaterials: materials.length,
    totalNotices: notices.length,
    activeNotices: notices.filter(n => n.isActive).length,
    totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
    averageRating: materials.length > 0 
      ? (materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length)
      : 0
  };

  const recentActivity = [
    { id: 1, type: 'user', title: 'New student registered', user: 'John Doe', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'material', title: 'Material uploaded', user: 'Admin', time: '4 hours ago', status: 'info' },
    { id: 3, type: 'notice', title: 'Notice published', user: 'Admin', time: '6 hours ago', status: 'success' },
    { id: 4, type: 'system', title: 'Maintenance mode toggled', user: 'System', time: '1 day ago', status: 'warning' }
  ];

  const quickActions = [
    { title: 'Create Notice', description: 'Publish a new notice', icon: Bell, color: 'blue' },
    { title: 'Add Material', description: 'Upload study material', icon: FileText, color: 'green' },
    { title: 'Manage Users', description: 'View and manage users', icon: Users, color: 'purple' },
    { title: 'System Settings', description: 'Configure platform settings', icon: Award, color: 'orange' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-blue-100 text-lg">Manage your educational platform efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{stats.totalUsers} Total Users</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{stats.totalMaterials} Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>{stats.totalNotices} Notices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800">{stats.totalUsers}</h3>
                <p className="text-slate-600 font-medium">Total Users</p>
                <p className="text-xs text-slate-500">{stats.totalStudents} students, {stats.totalAdmins} admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800">{stats.totalMaterials}</h3>
                <p className="text-slate-600 font-medium">Materials</p>
                <p className="text-xs text-slate-500">{stats.totalDownloads} downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800">{stats.activeNotices}</h3>
                <p className="text-slate-600 font-medium">Active Notices</p>
                <p className="text-xs text-slate-500">{stats.totalNotices} total</p>
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
                <h3 className="text-3xl font-bold text-slate-800">{stats.averageRating.toFixed(1)}</h3>
                <p className="text-slate-600 font-medium">Avg Rating</p>
                <p className="text-xs text-slate-500">Material quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'material' ? 'bg-green-100 text-green-600' :
                    activity.type === 'notice' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'user' ? <Users className="w-5 h-5" /> :
                     activity.type === 'material' ? <FileText className="w-5 h-5" /> :
                     activity.type === 'notice' ? <Bell className="w-5 h-5" /> :
                     <Settings className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                    <p className="text-sm text-slate-600">by {activity.user}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  <Badge variant={activity.status === 'success' ? 'default' : activity.status === 'warning' ? 'destructive' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    action.color === 'green' ? 'bg-green-100 text-green-600' :
                    action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{action.title}</h4>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {maintenanceMode ? <AlertCircle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
              </div>
              <h3 className="font-semibold text-slate-800">Maintenance Mode</h3>
              <p className="text-sm text-slate-600">{maintenanceMode ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800">Platform Health</h3>
              <p className="text-sm text-slate-600">All systems operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800">Performance</h3>
              <p className="text-sm text-slate-600">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernAdminDashboard;

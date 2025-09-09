import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Bell, 
  Pin, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'urgent' | 'announcement' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'students' | 'admins' | 'specific_branch';
  targetBranch?: string;
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: string;
  views: number;
  readBy: Array<{ user: string; readAt: string }>;
  createdAt: string;
  createdBy: { name: string; email: string };
}

const AdminNoticeManager = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [stats, setStats] = useState({
    totalNotices: 0,
    activeNotices: 0,
    pinnedNotices: 0,
    urgentNotices: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'important' | 'urgent' | 'announcement' | 'maintenance',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    targetAudience: 'all' as 'all' | 'students' | 'admins' | 'specific_branch',
    targetBranch: '',
    isPinned: false,
    expiresAt: ''
  });

  const typeColors = {
    general: 'bg-blue-100 text-blue-800',
    important: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
    announcement: 'bg-green-100 text-green-800',
    maintenance: 'bg-purple-100 text-purple-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    general: Info,
    important: AlertTriangle,
    urgent: AlertTriangle,
    announcement: CheckCircle,
    maintenance: Clock
  };

  useEffect(() => {
    fetchNotices();
    fetchStats();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices', {
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      const data = await response.json();
      setNotices(data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notices/stats/overview', {
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingNotice ? `/api/notices/${editingNotice._id}` : '/api/notices';
      const method = editingNotice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          ...formData,
          createdBy: '507f1f77bcf86cd799439011' // Default admin ID
        })
      });

      if (response.ok) {
        toast.success(editingNotice ? 'Notice updated successfully' : 'Notice created successfully');
        setIsDialogOpen(false);
        setEditingNotice(null);
        resetForm();
        fetchNotices();
        fetchStats();
      } else {
        throw new Error('Failed to save notice');
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Failed to save notice');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      targetBranch: notice.targetBranch || '',
      isPinned: notice.isPinned,
      expiresAt: notice.expiresAt ? notice.expiresAt.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const response = await fetch(`/api/notices/${id}`, { method: 'DELETE', headers: { ...authService.getAuthHeaders() } });
      if (response.ok) {
        toast.success('Notice deleted successfully');
        fetchNotices();
        fetchStats();
      } else {
        throw new Error('Failed to delete notice');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const toggleActive = async (notice: Notice) => {
    try {
      const response = await fetch(`/api/notices/${notice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ isActive: !notice.isActive })
      });

      if (response.ok) {
        toast.success(`Notice ${!notice.isActive ? 'activated' : 'deactivated'}`);
        fetchNotices();
        fetchStats();
      } else {
        throw new Error('Failed to update notice');
      }
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('Failed to update notice');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general' as 'general' | 'important' | 'urgent' | 'announcement' | 'maintenance',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      targetAudience: 'all' as 'all' | 'students' | 'admins' | 'specific_branch',
      targetBranch: '',
      isPinned: false,
      expiresAt: ''
    });
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notice.type === filterType;
    const matchesPriority = filterPriority === 'all' || notice.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Notice Management</h2>
          <p className="text-slate-600 mt-1">Create and manage notices for all users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingNotice(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-black text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  maxLength={2000}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger className="bg-black text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={formData.targetAudience} onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}>
                    <SelectTrigger className="bg-black text-white">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="specific_branch">Specific Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.targetAudience === 'specific_branch' && (
                <div>
                  <Label htmlFor="targetBranch">Target Branch</Label>
                  <Input
                    id="targetBranch"
                    value={formData.targetBranch}
                    onChange={(e) => setFormData({ ...formData, targetBranch: e.target.value })}
                    placeholder="e.g., Computer Engineering"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPinned">Pin this notice</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Notices</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalNotices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Active Notices</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeNotices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Pinned Notices</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pinnedNotices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Urgent Notices</p>
                <p className="text-2xl font-bold text-slate-900">{stats.urgentNotices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No notices found</h3>
              <p className="text-slate-600">Create your first notice to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotices.map((notice) => {
            const TypeIcon = typeIcons[notice.type];
            return (
              <Card key={notice._id} className={`${notice.isPinned ? 'ring-2 ring-purple-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {notice.isPinned && <Pin className="w-4 h-4 text-purple-600" />}
                        <TypeIcon className="w-5 h-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900">{notice.title}</h3>
                        <Badge className={typeColors[notice.type]}>{notice.type}</Badge>
                        <Badge className={priorityColors[notice.priority]}>{notice.priority}</Badge>
                        {!notice.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      
                      <p className="text-slate-600 mb-3 line-clamp-2">{notice.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{notice.targetAudience === 'all' ? 'All Users' : notice.targetAudience}</span>
                          {notice.targetBranch && <span>({notice.targetBranch})</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{notice.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{notice.readBy.length} read</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(notice)}
                      >
                        {notice.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(notice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notice._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminNoticeManager;

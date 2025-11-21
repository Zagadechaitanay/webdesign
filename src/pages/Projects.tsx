import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, Search, Filter, Upload, Download, Eye, Star, 
  Github, ExternalLink, FileText, Image as ImageIcon, Video,
  Plus, X, CheckCircle, Clock, Users, BookOpen, ArrowLeft,
  Mail, Phone, MessageCircle, Send, Trash2, Edit, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  branch: string;
  semester: number;
  githubLink?: string;
  demoLink?: string;
  pdfUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  studentName: string;
  studentId?: string;
  status: string;
  isAdminProject: boolean;
  views: number;
  likes: number;
  canDownload?: boolean;
  createdAt: string;
}

const Projects = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [studentProjects, setStudentProjects] = useState<Project[]>([]);
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activeTab, setActiveTab] = useState('admin');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'mini',
    branch: user?.branch || '',
    semester: user?.semester || '',
    techStack: '',
    githubLink: '',
    demoLink: '',
    pdfUrl: '',
    imageUrls: '',
    videoUrl: '',
    teamMembers: '',
    projectType: 'mini'
  });

  const [requestForm, setRequestForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    branch: user?.branch || '',
    semester: user?.semester || '',
    projectIdea: '',
    description: '',
    requiredTools: '',
    deadline: '',
    notes: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      checkDownloadPermission();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const checkDownloadPermission = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/projects/${user.id}/can-download`, {
        headers: { ...authService.getAuthHeaders() }
      });
      if (res.ok) {
        const data = await res.json();
        setCanDownload(data.canDownload || false);
      }
    } catch (err) {
      console.error('Error checking download permission:', err);
    }
  };

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        headers: { ...authService.getAuthHeaders() }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      const allProjects = data.projects || [];
      
      // Separate admin and student projects
      const adminProjects = allProjects.filter((p: any) => p.isAdminProject && p.status === 'approved');
      const studentProjs = allProjects.filter((p: any) => 
        !p.isAdminProject && (p.status === 'approved' || p.studentId === user?.id)
      );
      
      setProjects(adminProjects);
      setStudentProjects(studentProjs);
    } catch (err) {
      toast({ title: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    if (!isAuthenticated) {
      toast({ title: "Please login first", variant: "destructive" });
      window.location.href = '/?login=1';
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { ...authService.getAuthHeaders() }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSelectedProject(data);
      setShowProjectDialog(true);
    } catch (err) {
      toast({ title: "Failed to load project details", variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please login first", variant: "destructive" });
      window.location.href = '/?login=1';
      return;
    }
    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          ...uploadForm,
          techStack: uploadForm.techStack.split(',').map(t => t.trim()).filter(Boolean),
          imageUrls: uploadForm.imageUrls.split(',').map(u => u.trim()).filter(Boolean),
          teamMembers: uploadForm.teamMembers.split(',').map(m => m.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        toast({ title: "Project submitted successfully!", description: "Your project is pending admin approval." });
        setShowUploadDialog(false);
        setUploadForm({
          title: '', description: '', category: 'mini', branch: user?.branch || '',
          semester: user?.semester || '', techStack: '', githubLink: '', demoLink: '',
          pdfUrl: '', imageUrls: '', videoUrl: '', teamMembers: '', projectType: 'mini'
        });
        fetchProjects();
        checkDownloadPermission();
      } else {
        toast({ title: "Failed to submit project", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to submit project", variant: "destructive" });
    }
  };

  const handleDownload = async (project: Project) => {
    if (!isAuthenticated) {
      toast({ title: "Please login first", variant: "destructive" });
      window.location.href = '/?login=1';
      return;
    }
    if (!canDownload) {
      toast({
        title: "Download Restricted",
        description: "You must upload at least one project to unlock downloads.",
        variant: "destructive"
      });
      setShowUploadDialog(true);
      return;
    }
    if (project.pdfUrl) {
      window.open(project.pdfUrl, '_blank');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      });
      if (res.ok) {
        toast({ title: "Request submitted!", description: "We'll get back to you soon." });
        setShowRequestDialog(false);
        setRequestForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          branch: user?.branch || '',
          semester: user?.semester || '',
          projectIdea: '',
          description: '',
          requiredTools: '',
          deadline: '',
          notes: ''
        });
      } else {
        toast({ title: "Failed to submit request", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to submit request", variant: "destructive" });
    }
  };

  const getFilteredProjects = (projectList: Project[]) => {
    return projectList.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesBranch = selectedBranch === 'all' || p.branch === selectedBranch;
      return matchesSearch && matchesCategory && matchesBranch;
    });
  };

  const filteredAdminProjects = getFilteredProjects(projects);
  const filteredStudentProjects = getFilteredProjects(studentProjects);
  const myProjects = studentProjects.filter((p: any) => p.studentId === user?.id);

  const categories = ['all', 'Web Development', 'Mobile Development', 'Machine Learning', 'IoT', 'Cybersecurity', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student-dashboard')}
                className="text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Projects</h1>
                  <p className="text-sm text-slate-600">Browse and share academic projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Branches</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Telecommunication">ENTC</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Electrical Engineering">Electrical</option>
            <option value="Civil Engineering">Civil</option>
            <option value="Automobile Engineering">Automobile</option>
            <option value="Instrumentation Engineering">Instrumentation</option>
            <option value="Artificial Intelligence & Machine Learning (AIML)">AIML</option>
            <option value="Mechatronics Engineering">Mechatronics</option>
          </select>
          <Button 
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = '/?login=1';
              } else {
                setShowUploadDialog(true);
              }
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Project
          </Button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Login Required</h3>
            <p className="text-gray-600 mb-4">Please login to browse and upload projects</p>
            <Button onClick={() => window.location.href = '/?login=1'}>
              Login Now
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin">Admin Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="student">Student Projects ({studentProjects.length})</TabsTrigger>
              <TabsTrigger value="my">My Projects ({myProjects.length})</TabsTrigger>
            </TabsList>

            {/* Admin Projects Tab */}
            <TabsContent value="admin" className="space-y-6">
              {!canDownload && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Lock className="w-6 h-6 text-orange-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 mb-2">Download Restricted</h3>
                        <p className="text-orange-800 mb-4">
                          To download any project, you must upload at least one project first.
                        </p>
                        <Button onClick={() => setShowUploadDialog(true)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {filteredAdminProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No admin projects available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAdminProjects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{project.category}</Badge>
                        {project.isAdminProject && <Badge variant="secondary">Official</Badge>}
                        {project.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span>{project.views} views</span>
                    <span>{project.likes} likes</span>
                    <span>{project.branch}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProjectDetails(project.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {project.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(project)}
                        disabled={!canDownload}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Student Projects Tab */}
            <TabsContent value="student" className="space-y-6">
              {filteredStudentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No student projects available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudentProjects.map(project => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{project.category}</Badge>
                              {project.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                          <span>{project.views} views</span>
                          <span>{project.likes} likes</span>
                          <span>{project.branch}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProjectDetails(project.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Projects Tab */}
            <TabsContent value="my" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Projects</h3>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Project
                </Button>
              </div>
              {myProjects.length === 0 ? (
                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Upload your first project to get started!</p>
                    <Button onClick={() => setShowUploadDialog(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProjects.map(project => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{project.category}</Badge>
                              <Badge variant={project.status === 'approved' ? 'default' : 'outline'}>
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProjectDetails(project.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Project Request & Contact Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Request Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Request Custom Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Need a custom project developed? Fill out the form and we'll get back to you.
              </p>
              <Button onClick={() => setShowRequestDialog(true)} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Phone</p>
                  <p className="text-sm text-slate-600">+91 8432971897</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <p className="text-sm text-slate-600">digidiploma06@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">WhatsApp</p>
                  <a 
                    href="https://chat.whatsapp.com/GBG7hvAwuIo85iFkG4xyqy?mode=wwt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Join Community
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Your Project</DialogTitle>
            <DialogDescription>Share your project with the community</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <Input
              placeholder="Project Title *"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Project Description *"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={4}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="IoT">IoT</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={uploadForm.projectType}
                onChange={(e) => setUploadForm({ ...uploadForm, projectType: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="mini">Mini Project</option>
                <option value="major">Major Project</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={uploadForm.branch}
                onChange={(e) => setUploadForm({ ...uploadForm, branch: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Telecommunication">ENTC</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Electrical Engineering">Electrical</option>
                <option value="Civil Engineering">Civil</option>
                <option value="Automobile Engineering">Automobile</option>
                <option value="Instrumentation Engineering">Instrumentation</option>
                <option value="Artificial Intelligence & Machine Learning (AIML)">AIML</option>
                <option value="Mechatronics Engineering">Mechatronics</option>
              </select>
            </div>
            <Input
              placeholder="Semester (e.g., 3)"
              type="number"
              value={uploadForm.semester}
              onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
              required
            />
            <Input
              placeholder="Technologies (comma-separated)"
              value={uploadForm.techStack}
              onChange={(e) => setUploadForm({ ...uploadForm, techStack: e.target.value })}
            />
            <Input
              placeholder="GitHub Link"
              value={uploadForm.githubLink}
              onChange={(e) => setUploadForm({ ...uploadForm, githubLink: e.target.value })}
            />
            <Input
              placeholder="PDF URL"
              value={uploadForm.pdfUrl}
              onChange={(e) => setUploadForm({ ...uploadForm, pdfUrl: e.target.value })}
            />
            <Input
              placeholder="Image URLs (comma-separated)"
              value={uploadForm.imageUrls}
              onChange={(e) => setUploadForm({ ...uploadForm, imageUrls: e.target.value })}
            />
            <Input
              placeholder="Video URL"
              value={uploadForm.videoUrl}
              onChange={(e) => setUploadForm({ ...uploadForm, videoUrl: e.target.value })}
            />
            <Input
              placeholder="Team Members (comma-separated)"
              value={uploadForm.teamMembers}
              onChange={(e) => setUploadForm({ ...uploadForm, teamMembers: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit">Submit Project</Button>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Custom Project</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a custom project development
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Name *"
                value={requestForm.name}
                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Email *"
                type="email"
                value={requestForm.email}
                onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Phone *"
              value={requestForm.phone}
              onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={requestForm.branch}
                onChange={(e) => setRequestForm({ ...requestForm, branch: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Telecommunication">ENTC</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Electrical Engineering">Electrical</option>
                <option value="Civil Engineering">Civil</option>
                <option value="Automobile Engineering">Automobile</option>
                <option value="Instrumentation Engineering">Instrumentation</option>
                <option value="Artificial Intelligence & Machine Learning (AIML)">AIML</option>
                <option value="Mechatronics Engineering">Mechatronics</option>
              </select>
              <Input
                placeholder="Semester *"
                type="number"
                value={requestForm.semester}
                onChange={(e) => setRequestForm({ ...requestForm, semester: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Project Title *"
              value={requestForm.projectIdea}
              onChange={(e) => setRequestForm({ ...requestForm, projectIdea: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description / Requirements *"
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              rows={4}
              required
            />
            <Input
              placeholder="Required Tools/Technologies"
              value={requestForm.requiredTools}
              onChange={(e) => setRequestForm({ ...requestForm, requiredTools: e.target.value })}
            />
            <Input
              placeholder="Deadline (optional)"
              type="date"
              value={requestForm.deadline}
              onChange={(e) => setRequestForm({ ...requestForm, deadline: e.target.value })}
            />
            <Textarea
              placeholder="Additional Notes"
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Detail Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>{selectedProject.category} • {selectedProject.branch}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>{selectedProject.description}</p>
                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, i) => (
                        <Badge key={i}>{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {selectedProject.pdfUrl && (
                    <Button
                      onClick={() => handleDownload(selectedProject)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                  {selectedProject.githubLink && (
                    <a href={selectedProject.githubLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <Github className="w-4 h-4 mr-2" />
                        View on GitHub
                      </Button>
                    </a>
                  )}
                  {selectedProject.demoLink && (
                    <a href={selectedProject.demoLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Demo
                      </Button>
                    </a>
                  )}
                </div>
                {selectedProject.imageUrls && selectedProject.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProject.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="rounded" />
                    ))}
                  </div>
                )}
                {selectedProject.videoUrl && (
                  <iframe
                    src={selectedProject.videoUrl}
                    className="w-full h-64 rounded"
                    allowFullScreen
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Code, Search, Upload, Download, Eye, Star, Github, CheckCircle, X, Clock,
  FileText, Image as ImageIcon, Video, Plus, Trash2, Edit
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  branch: string;
  semester: number;
  studentName: string;
  status: string;
  isAdminProject: boolean;
  pdfUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  githubLink?: string;
  createdAt: string;
}

interface ProjectRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  branch: string;
  semester: string;
  projectIdea: string;
  description?: string;
  requiredTools?: string;
  deadline?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const AdminProjectsManager = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'mini',
    branch: '',
    semester: '',
    techStack: '',
    githubLink: '',
    demoLink: '',
    pdfUrl: '',
    imageUrls: '',
    videoUrl: '',
    projectType: 'mini',
    coverPhoto: null as File | null,
    coverPhotoUrl: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchRequests();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { ...authService.getAuthHeaders() }
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      toast({ title: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/projects/requests/all', {
        headers: { ...authService.getAuthHeaders() }
      });
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      toast({ title: "Failed to load requests", variant: "destructive" });
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload cover photo if provided
      let coverPhotoUrl = uploadForm.coverPhotoUrl || '';
      if (uploadForm.coverPhoto) {
        const coverPhotoBase64 = await convertFileToBase64(uploadForm.coverPhoto);
        const coverPhotoRes = await fetch('/api/materials/upload-base64', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders()
          },
          body: JSON.stringify({
            filename: uploadForm.coverPhoto.name,
            contentType: uploadForm.coverPhoto.type,
            dataBase64: coverPhotoBase64
          })
        });

        if (coverPhotoRes.ok) {
          const coverPhotoData = await coverPhotoRes.json();
          coverPhotoUrl = coverPhotoData.url;
        }
      }

      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          ...uploadForm,
          isAdminProject: true,
          techStack: uploadForm.techStack.split(',').map(t => t.trim()).filter(Boolean),
          imageUrls: uploadForm.imageUrls.split(',').map(u => u.trim()).filter(Boolean),
          coverPhoto: coverPhotoUrl || null
        })
      });
      if (res.ok) {
        toast({ title: "Official project uploaded successfully!" });
        setShowUploadDialog(false);
        setUploadForm({
          title: '', description: '', category: 'mini', branch: '', semester: '',
          techStack: '', githubLink: '', demoLink: '', pdfUrl: '', imageUrls: '', videoUrl: '', projectType: 'mini',
          coverPhoto: null, coverPhotoUrl: ''
        });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: "Failed to upload project", variant: "destructive" });
    }
  };

  const handleApprove = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        toast({ title: "Project approved" });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: "Failed to approve project", variant: "destructive" });
    }
  };

  const handleReject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        toast({ title: "Project rejected" });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: "Failed to reject project", variant: "destructive" });
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { ...authService.getAuthHeaders() }
      });
      if (res.ok) {
        toast({ title: "Project deleted" });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast({ title: `Request ${status}` });
        fetchRequests();
      }
    } catch (err) {
      toast({ title: "Failed to update request", variant: "destructive" });
    }
  };

  const pendingProjects = projects.filter(p => p.status === 'pending' && !p.isAdminProject);
  const approvedProjects = projects.filter(p => p.status === 'approved');
  const adminProjects = projects.filter(p => p.isAdminProject);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects Management</h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Official Project
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="official">
            Official ({adminProjects.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({requests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingProjects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">By {project.studentName} • {project.branch}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(project.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(project.id)}>
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech, i) => (
                    <Badge key={i}>{tech}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingProjects.length === 0 && <p className="text-slate-500">No pending projects</p>}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedProjects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <p className="text-sm text-slate-600">By {project.studentName}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2 line-clamp-2">{project.description}</p>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="official" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminProjects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge>Official</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2 line-clamp-2">{project.description}</p>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{request.projectIdea}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {request.name} ({request.email}) • {request.branch} • Sem {request.semester}
                    </p>
                  </div>
                  <Badge variant={request.status === 'accepted' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{request.description}</p>
                {request.requiredTools && <p className="text-sm text-slate-600">Tools: {request.requiredTools}</p>}
                {request.deadline && <p className="text-sm text-slate-600">Deadline: {request.deadline}</p>}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => updateRequestStatus(request.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateRequestStatus(request.id, 'under_review')}>
                    Under Review
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(request.id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && <p className="text-slate-500">No project requests</p>}
        </TabsContent>
      </Tabs>

      {/* Upload Official Project Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Official Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadOfficial} className="space-y-4">
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
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="IoT">IoT</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Other">Other</option>
              </select>
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
              placeholder="Semester"
              type="number"
              value={uploadForm.semester}
              onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
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
            <div>
              <Label>Cover Photo (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      toast({ title: "Please select an image file", variant: "destructive" });
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast({ title: "Cover photo size exceeds 5MB limit", variant: "destructive" });
                      return;
                    }
                    setUploadForm({ ...uploadForm, coverPhoto: file, coverPhotoUrl: '' });
                  }
                }}
              />
              {(uploadForm.coverPhoto || uploadForm.coverPhotoUrl) && (
                <div className="mt-2">
                  {uploadForm.coverPhoto ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={URL.createObjectURL(uploadForm.coverPhoto)} 
                        alt="Cover preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadForm({ ...uploadForm, coverPhoto: null, coverPhotoUrl: '' })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : uploadForm.coverPhotoUrl ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={uploadForm.coverPhotoUrl.startsWith('http') ? uploadForm.coverPhotoUrl : `${window.location.origin}${uploadForm.coverPhotoUrl}`} 
                        alt="Cover preview" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadForm({ ...uploadForm, coverPhotoUrl: '' })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Upload a cover image for this project (max 5MB, JPG/PNG)</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Upload Project</Button>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectsManager;


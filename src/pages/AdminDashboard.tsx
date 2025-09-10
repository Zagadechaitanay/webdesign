import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Code, Cpu, Layers, Globe, Star, Pencil, Trash2, Users, Settings, Bell, ClipboardList, GraduationCap, UserCog, TrendingUp, LogOut } from "lucide-react";
import axios from "axios";
import { authService } from '@/lib/auth';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/LoginForm";
import StudentPanel from "@/components/StudentPanel";
import AdminSubjectManager from "@/components/AdminSubjectManager";
import AdminDashboardComponent from "@/components/AdminDashboard";
import ModernAdminDashboard from "@/components/ModernAdminDashboard";
import AdminNoticeManager from "@/components/AdminNoticeManager";

// Local material type since external helper was removed
type MaterialItem = { id: string; name: string; url: string; type: string; uploadedAt: string; subjectCode: string; downloads?: number; rating?: number };

const subjectIcons = [BookOpen, FileText, Code, Cpu, Layers, Globe, Star];

// ENTC Subject List for 6 Semesters
const ENTC_SUBJECTS = {
  "Electronics & Telecommunication": {
    2: [
      { name: "Applied Mathematics", code: "312301" },
      { name: "Basic Electronics", code: "312314" },
      { name: "Elements of Electrical Engineering", code: "312315" },
      { name: "Electronic Materials & Components", code: "312316" },
      { name: "Professional Communication", code: "312002" },
      { name: "Social and Life Skills", code: "312003" },
      { name: "Electronics Workshop Practice", code: "312008" },
      { name: "Programming in 'C' Language", code: "312009" }
    ],
    3: [
      { name: "Essence of Indian Constitution", code: "313304" },
      { name: "Basic Python Programming", code: "313306" },
      { name: "Analog Electronics", code: "313320" },
      { name: "Digital Techniques", code: "313322" },
      { name: "Electrical Circuits & Networks", code: "313326" },
      { name: "Principles of Electronic Communication", code: "313327" },
      { name: "Electronics Measurements & Instrumentation", code: "313007" }
    ],
    4: [
      { name: "Environmental Education and Sustainability", code: "314322" },
      { name: "Microcontroller & Applications", code: "314323" },
      { name: "Consumer Electronics", code: "314333" },
      { name: "Digital Communication", code: "314334" },
      { name: "Basic Power Electronics", code: "324304" },
      { name: "Electronic Equipment Maintenance & Simulation", code: "314011" },
      { name: "Open Elective", code: "314328" }
    ],
    5: [
      { name: "Entrepreneurship Development and Startups", code: "315302" },
      { name: "Embedded System", code: "315340" },
      { name: "Mobile & Wireless Communication", code: "315344" },
      { name: "Seminar and Project Initiation Course", code: "315002" },
      { name: "Internship (12 Weeks)", code: "315001" },
      { name: "IoT Applications", code: "315338" },
      { name: "Microwave Engineering & Radar System", code: "315346" }
    ],
    6: [
      { name: "Management", code: "316302" },
      { name: "Emerging Trends in Electronics", code: "316326" },
      { name: "Computer Network & Data Communication", code: "316330" },
      { name: "Optical Networking and Satellite Communication", code: "316331" },
      { name: "Capstone Project", code: "316001" },
      { name: "Drone Technology", code: "316328" },
      { name: "Control System & PLC", code: "316332" },
      { name: "VLSI Applications", code: "316333" }
    ]
  }
};

// Electrical Engineering Subject List for 6 Semesters
const ELECTRICAL_SUBJECTS = {
  "Electrical Engineering": {
    1: [
      { name: "Engineering Mathematics-I", code: "EE101" },
      { name: "Engineering Physics", code: "EE102" },
      { name: "Engineering Chemistry", code: "EE103" },
      { name: "Basic Electrical Engineering", code: "EE104" },
      { name: "Engineering Drawing", code: "EE105" },
      { name: "Communication Skills", code: "EE106" }
    ],
    2: [
      { name: "Engineering Mathematics-II", code: "EE201" },
      { name: "Electrical Circuits & Networks", code: "EE202" },
      { name: "Electronic Devices", code: "EE203" },
      { name: "Programming in C", code: "EE204" },
      { name: "Engineering Mechanics", code: "EE205" },
      { name: "Workshop Practice", code: "EE206" }
    ],
    3: [
      { name: "Engineering Mathematics-III", code: "EE301" },
      { name: "Electrical Machines-I", code: "EE302" },
      { name: "Electrical Measurements & Instrumentation", code: "EE303" },
      { name: "Analog Electronics", code: "EE304" },
      { name: "Power Electronics", code: "EE305" },
      { name: "Digital Electronics", code: "EE306" }
    ],
    4: [
      { name: "Engineering Mathematics-IV", code: "EE401" },
      { name: "Electrical Machines-II", code: "EE402" },
      { name: "Power Systems-I", code: "EE403" },
      { name: "Microprocessors & Applications", code: "EE404" },
      { name: "Control Systems", code: "EE405" },
      { name: "Electrical Workshop", code: "EE406" }
    ],
    5: [
      { name: "Power Systems-II", code: "EE501" },
      { name: "Switchgear & Protection", code: "EE502" },
      { name: "Utilization of Electrical Energy", code: "EE503" },
      { name: "Industrial Drives & Control", code: "EE504" },
      { name: "Renewable Energy Sources", code: "EE505" },
      { name: "Electrical Design, Estimation & Costing", code: "EE506" }
    ],
    6: [
      { name: "Electric Traction", code: "EE601" },
      { name: "Testing & Maintenance of Electrical Machines", code: "EE602" },
      { name: "Project Work", code: "EE603" },
      { name: "Industrial Training", code: "EE604" },
      { name: "Energy Management & Audit", code: "EE605" },
      { name: "Elective (Smart Grid/PLC/SCADA)", code: "EE606" }
    ]
  }
};

// Backend-powered subjects will be used in the Materials panel

const AdminDashboard: React.FC = () => {
  // Replace section and tab with a single activePanel state
  const [activePanel, setActivePanel] = useState('dashboard'); // default to 'dashboard'
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  // Portal control state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [lastBroadcast, setLastBroadcast] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([]);

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [backendBranches, setBackendBranches] = useState<string[]>([]);
  const [backendSemesters, setBackendSemesters] = useState<number[]>([]);
  const [backendSubjects, setBackendSubjects] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{ open: boolean, subject: any, index: number | null }>({ open: false, subject: null, index: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [editForm, setEditForm] = useState({ name: "", code: "" });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // removed duplicate subjects state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    branch: '',
    semester: '',
    college: '',
    userType: 'student',
  });
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  // Add subject handler
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode) return;
    // Add locally to current subjects list (demo only)
    setSubjects(prev => [...prev, { name: newSubjectName, code: newSubjectCode }]);
    setNewSubjectName('');
    setNewSubjectCode('');
    // Optionally, force a re-render
    // subjects state already updated
  };
  // REMOVE: const [showLogin, setShowLogin] = useState(false);
  // REMOVE: const isAdmin = localStorage.getItem('userRole') === 'admin';
  // REMOVE: if (!isAdmin) { ... }
  // Just render the dashboard for everyone

  // Refresh users when section changes to 'users' or 'students'
  useEffect(() => {
    if (activePanel === 'users' || activePanel === 'students') {
      fetchUsers();
    }
  }, [activePanel]);

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch('/api/subjects/branches', { headers: { ...authService.getAuthHeaders() } });
        if (!res.ok) throw new Error('Failed to fetch branches');
        const branches = await res.json();
        setBackendBranches(branches);
        if (branches.length > 0) setSelectedBranch(branches[0]);
      } catch {
        setBackendBranches([]);
      }
    };
    loadBranches();
  }, []);

  // Load semesters when branch changes
  useEffect(() => {
    const loadSemesters = async () => {
      if (!selectedBranch) { setBackendSemesters([]); return; }
      try {
        const res = await fetch(`/api/subjects/branches/${encodeURIComponent(selectedBranch)}/semesters`, { headers: { ...authService.getAuthHeaders() } });
        if (!res.ok) throw new Error('Failed to fetch semesters');
        const sems = await res.json();
        setBackendSemesters(sems);
        if (sems.length > 0) setSelectedSemester(String(sems[0]));
      } catch {
        setBackendSemesters([]);
      }
    };
    loadSemesters();
  }, [selectedBranch]);

  // Load subjects for selected branch (for Student Panel overview)
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const q = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : '';
        const res = await fetch(`/api/subjects${q}`, { headers: { ...authService.getAuthHeaders() } });
        if (!res.ok) throw new Error('Failed to fetch subjects');
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : []);
      } catch {
        setSubjects([]);
      }
    };
    loadSubjects();
  }, [selectedBranch]);

  // Load subjects when branch or semester changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedBranch || !selectedSemester) { setBackendSubjects([]); return; }
      try {
        const res = await fetch(`/api/subjects?branch=${encodeURIComponent(selectedBranch)}&semester=${encodeURIComponent(selectedSemester)}`, { headers: { ...authService.getAuthHeaders() } });
        if (!res.ok) throw new Error('Failed to fetch subjects');
        const subs = await res.json();
        setBackendSubjects(subs);
      } catch {
        setBackendSubjects([]);
      }
    };
    loadSubjects();
  }, [selectedBranch, selectedSemester]);

  // Deprecated local subject injection removed in favor of backend subjects

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      setBroadcastHistory(prev => [broadcastMessage, ...prev]);
      setBroadcastMessage('');
      // Here you would also send the broadcast to the backend or global state
    }
  };

  // Maintenance API wiring
  const fetchMaintenance = async () => {
    try {
      const res = await fetch('/api/system/maintenance');
      if (!res.ok) return;
      const data = await res.json();
      setMaintenanceMode(!!data.maintenance);
    } catch {}
  };

  const setGlobalMaintenance = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ maintenance: enabled })
      });
      if (!res.ok) throw new Error('Failed to update maintenance');
      const data = await res.json();
      setMaintenanceMode(!!data.maintenance);
      toast(`Maintenance ${data.maintenance ? 'enabled' : 'disabled'}`);
    } catch {
      toast('Failed to update maintenance');
    }
  };

  useEffect(() => {
    if (activePanel === 'portal') {
      fetchMaintenance();
    }
  }, [activePanel]);



  const handleAddUser = async (userData?: any) => {
    try {
      const data = userData || {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        college: newUser.college || 'Default College',
        studentId: newUser.studentId,
        branch: newUser.branch,
        semester: newUser.semester,
        userType: newUser.userType || 'student'
      };

      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
    toast("User added successfully");
        setNewUser({ name: '', email: '', studentId: '', password: '', branch: '', semester: '', college: '', userType: 'student' });
        fetchUsers(); // Refresh the users list
      } else {
        const data = await res.json();
        toast(data.error || "Failed to add user");
      }
    } catch (err) {
      toast("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { ...authService.getAuthHeaders() },
      });

      if (res.ok) {
        toast("User deleted successfully");
        fetchUsers(); // Refresh the users list
      } else {
        toast("Failed to delete user");
      }
    } catch (err) {
      toast("Failed to delete user");
    }
  };

  // Material upload handler
  const handleMaterialUpload = async (subjectCode: string, e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        const dataBase64 = await toBase64(file);
        const uploadRes = await fetch('/api/materials/upload-base64', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders()
          },
          body: JSON.stringify({ filename: file.name, contentType: file.type, dataBase64 })
        });
        if (!uploadRes.ok) continue;
        const { url } = await uploadRes.json();
        const createRes = await fetch('/api/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders()
          },
          body: JSON.stringify({
            title: `${type} - ${file.name}`,
            type: file.type.includes('pdf') ? 'pdf' : (file.type.startsWith('video') ? 'video' : 'document'),
            url,
            description: '',
            uploadedBy: 'admin',
            subjectId: selectedSubjectDropdown?.code || subjectCode,
            subjectName: selectedSubjectDropdown?.name || '',
            branch: selectedBranch,
            semester: selectedSemester,
            subjectCode
          })
        });
        if (createRes.ok) {
          const { material } = await createRes.json();
          setMaterials(prev => [...prev, {
            id: material._id,
            name: material.title,
            url: material.url,
            type: material.type,
            uploadedAt: material.createdAt,
            subjectCode: material.subjectCode
          }]);
        }
      } catch (err) {
        // ignore
      }
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: { ...authService.getAuthHeaders() }
      });
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== materialId));
      }
    } catch {}
  };

  // Check if user is admin
  // REMOVE: const isAdmin = localStorage.getItem('userRole') === 'admin';

  // Remove the isAdmin check and login modal logic
  // Just render the dashboard for everyone

  // Add state for modal
  const [materialModal, setMaterialModal] = useState<{ open: boolean, subject: any | null }>({ open: false, subject: null });
  // Add state for add subject modal in Materials panel
  const [addSubjectModal, setAddSubjectModal] = useState(false);
  const [newMaterialSubjectName, setNewMaterialSubjectName] = useState('');
  const [newMaterialSubjectCode, setNewMaterialSubjectCode] = useState('');
  // Add state for selected subject in dropdown
  const [selectedSubjectDropdown, setSelectedSubjectDropdown] = useState<any | null>(null);
  // Fetch materials for selected subject from backend
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedSubjectDropdown?.code) { setMaterials([]); return; }
      try {
        const res = await fetch(`/api/materials/subject/${encodeURIComponent(selectedSubjectDropdown.code)}`, {
          headers: { ...authService.getAuthHeaders() }
        });
        if (!res.ok) throw new Error('Failed to fetch materials');
        const data = await res.json();
        const mapped: MaterialItem[] = data.map((m: any) => ({
          id: m._id,
          name: m.title,
          url: m.url,
          type: m.type,
          uploadedAt: m.createdAt,
          subjectCode: m.subjectCode
        }));
        setMaterials(mapped);
      } catch {
        setMaterials([]);
      }
    };
    fetchMaterials();
  }, [selectedSubjectDropdown?.code]);
  // Add state for course launches
  const [courseLaunches, setCourseLaunches] = useState<{title: string, description: string, date: string, branch: string, subject: string}[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  // Add state for selected student
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  // Add state for course launch branch/subject
  const [newCourseBranch, setNewCourseBranch] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  // Add state for editing course
  const [editingCourseIdx, setEditingCourseIdx] = useState<number | null>(null);
  const [editCourseData, setEditCourseData] = useState<{title: string, description: string, branch: string, subject: string} | null>(null);
  // Add state for lectures per course
  const [courseLectures, setCourseLectures] = useState<{[idx: number]: {name: string, url: string}[]}>({});
  // Add state for course posters
  const [coursePosters, setCoursePosters] = useState<{[idx: number]: string}>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  // Live user updates via WebSocket notifications (admin side)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (!message?.type) return;
        switch (message.type) {
          // Users
          case 'user_created':
            setUsers(prev => [{
              _id: message.user.id,
              name: message.user.name,
              email: message.user.email,
              studentId: message.user.studentId,
              college: message.user.college,
              branch: message.user.branch,
              semester: message.user.semester,
              userType: message.user.userType,
              createdAt: message.user.createdAt
            }, ...prev]);
            break;
          case 'user_updated':
            setUsers(prev => prev.map(u => u._id === message.user.id ? {
              ...u,
              name: message.user.name ?? u.name,
              email: message.user.email ?? u.email,
              branch: message.user.branch ?? u.branch,
              semester: message.user.semester ?? u.semester,
              userType: message.user.userType ?? u.userType
            } : u));
            break;
          case 'user_deleted':
            setUsers(prev => prev.filter(u => u._id !== message.userId));
            break;

          // Subjects
          case 'subject_created':
            setSubjects(prev => [message.subject, ...prev]);
            if (message.subject?.branch && !backendBranches.includes(message.subject.branch)) {
              setBackendBranches(prev => [...new Set([message.subject.branch, ...prev])]);
            }
            break;
          case 'subject_updated':
            setSubjects(prev => prev.map(s => s._id === message.subject._id ? message.subject : s));
            break;
          case 'subject_deleted':
            setSubjects(prev => prev.filter(s => s._id !== message.subjectId));
            break;
        }
      } catch {}
    };

    // Attach to existing WS if available
    const anyWindow: any = window as any;
    if (anyWindow?.webSocketInstance) {
      anyWindow.webSocketInstance.addEventListener('message', handler);
    }
    return () => {
      if (anyWindow?.webSocketInstance) {
        anyWindow.webSocketInstance.removeEventListener('message', handler);
      }
    };
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users", { headers: { ...authService.getAuthHeaders() } });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      toast("Failed to fetch users from database");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Material helpers
  const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const averageRating = materials.length > 0
    ? (materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length)
    : 0;

  const handleRateMaterial = async (materialId: string, rating: number) => {
    try {
      const res = await fetch(`/api/materials/${materialId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ rating })
      });
      if (res.ok) {
        setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, rating } : m));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 text-sm">Manage your educational platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('userRole');
                  window.location.href = '/';
                }}
                className="border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className="w-72 bg-white/70 backdrop-blur-sm border-r border-white/20 p-6 flex flex-col gap-2">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Admin Panel</h2>
            <p className="text-sm text-slate-600">Manage your platform</p>
          </div>
          <div className="flex flex-col gap-2">
            {/* Card-style menu for all options */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('dashboard')}
            >
              <Star className={`w-5 h-5 ${activePanel === 'dashboard' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Dashboard</span>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'notice' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('notice')}
            >
              <Bell className={`w-5 h-5 ${activePanel === 'notice' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Notice Management</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'users' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('users')}
            >
              <Users className={`w-5 h-5 ${activePanel === 'users' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">User Management</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'portal' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('portal')}
            >
              <Settings className={`w-5 h-5 ${activePanel === 'portal' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Portal Control</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'materials' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('materials')}
            >
              <Layers className={`w-5 h-5 ${activePanel === 'materials' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Materials</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'quizzes' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('quizzes')}
            >
              <Star className={`w-5 h-5 ${activePanel === 'quizzes' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Quizzes</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'students' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('students')}
            >
              <GraduationCap className={`w-5 h-5 ${activePanel === 'students' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Students</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'subjects' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('subjects')}
            >
              <BookOpen className={`w-5 h-5 ${activePanel === 'subjects' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Subjects</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'subscriptions' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('subscriptions')}
            >
              <UserCog className={`w-5 h-5 ${activePanel === 'subscriptions' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Subscriptions</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'courses' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('courses')}
            >
              <BookOpen className={`w-5 h-5 ${activePanel === 'courses' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Courses</span>
            </div>
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activePanel === 'admin' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActivePanel('admin')}
            >
              <Settings className={`w-5 h-5 ${activePanel === 'admin' ? 'text-white' : 'text-slate-600'}`} />
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
        {/* Only render the selected panel's content */}
        {activePanel === 'dashboard' && (
          <ModernAdminDashboard 
            users={users}
            materials={materials}
            notices={[]}
            maintenanceMode={maintenanceMode}
          />
        )}
        {activePanel === 'materials' && (
            <div>
            <h3 className="text-xl font-bold mb-6">Subjects List</h3>
            <div className="mb-4 flex gap-4">
              <div>
                <label className="block mb-1 font-medium">Branch</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedBranch}
                  onChange={e => { setSelectedBranch(e.target.value); setSelectedSubjectDropdown(null); }}
                >
                  {backendBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Semester</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedSemester}
                  onChange={e => { setSelectedSemester(e.target.value); setSelectedSubjectDropdown(null); }}
                >
                  {backendSemesters.map(sem => (
                    <option key={sem} value={String(sem)}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Subject</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedSubjectDropdown ? selectedSubjectDropdown.code : ''}
                  onChange={e => {
                    const subj = (backendSubjects || []).find((s: any) => s.code === e.target.value);
                    setSelectedSubjectDropdown(subj || null);
                  }}
                >
                  <option value="">Select subject</option>
                  {(backendSubjects || []).map((subject: any) => (
                    <option key={subject.code} value={subject.code}>{subject.name} ({subject.code})</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Subject Card with upload/manage options */}
            {selectedSubjectDropdown && (
              <div className="bg-white p-8 rounded-2xl shadow-card max-w-xl mx-auto mt-10 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-2xl text-primary">{selectedSubjectDropdown.name}</span>
                  <span className="text-sm text-muted-foreground font-mono">{selectedSubjectDropdown.code}</span>
                </div>
                <ul className="space-y-4">
                {(() => {
                    const materialTypes = [
                      { key: 'syllabus', label: 'Syllabus' },
                      { key: 'manual', label: 'Manual Answer' },
                      { key: 'guessing', label: 'Guessing Papers' },
                      { key: 'model', label: 'Model Answer Papers' },
                      { key: 'imp', label: 'MSBTE IMP' },
                      { key: 'micro', label: 'Micro Project Topics' },
                      { key: 'notes', label: 'Notes' },
                    ];
                    const subjectMaterials = materials.filter(m => m.subjectCode === selectedSubjectDropdown.code);
                    return materialTypes.map(type => {
                      const mats = subjectMaterials.filter(m => m.name.startsWith(type.label + ' - '));
                      const notesStyle = type.key === 'notes' ? 'bg-yellow-50 border-l-4 border-yellow-400' : '';
                          return (
                        <li key={type.key} className={`flex flex-col gap-2 p-4 rounded-lg ${notesStyle} bg-muted/40 border border-gray-100`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-base flex-1">{type.label}</span>
                            <label className="cursor-pointer bg-primary text-white px-3 py-1 rounded-lg text-xs ml-2 shadow-sm hover:bg-indigo-700 transition">
                              Upload
                              <input type="file" className="hidden" multiple onChange={e => handleMaterialUpload(selectedSubjectDropdown.code, e, type.label)} />
                            </label>
                              </div>
                          {mats.length > 0 ? (
                            <ul className="space-y-1">
                              {mats.map(mat => (
                                <li key={mat.id} className="flex items-center justify-between bg-white dark:bg-card rounded px-3 py-1 border border-gray-200">
                                  <span className="text-xs text-muted-foreground font-mono">{mat.name.replace(type.label + ' - ', '')}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">⬇ {mat.downloads ?? 0}</span>
                                    <div className="flex items-center gap-1">
                                      {[1,2,3,4,5].map(n => (
                                        <button
                                          key={n}
                                          className={`text-[12px] ${((mat.rating || 0) >= n) ? 'text-yellow-500' : 'text-gray-300'}`}
                                          title={`Rate ${n}`}
                                          onClick={() => handleRateMaterial(mat.id, n)}
                                        >★</button>
                                      ))}
                                    </div>
                                    <a href={mat.url} download className="text-blue-600 hover:underline text-xs font-semibold" onClick={async (e) => {
                                      try { await fetch(`/api/materials/${mat.id}/download`, { method: 'POST', headers: { ...authService.getAuthHeaders() } }); } catch {}
                                    }}>Download</a>
                                    <button className="text-red-500 text-xs font-semibold" onClick={() => handleDeleteMaterial(mat.id)}>Delete</button>
                                  </div>
                                </li>
                              ))}
                          </ul>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not uploaded yet</span>
                          )}
                        </li>
                      );
                    });
                  })()}
                </ul>
              </div>
            )}
            {/* Add Subject Modal */}
            {addSubjectModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <form
                  className="bg-background rounded-xl shadow-xl p-8 max-w-md w-full relative animate-scale-in"
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newMaterialSubjectName || !newMaterialSubjectCode) return;
                    setSubjects(prev => [...prev, { name: newMaterialSubjectName, code: newMaterialSubjectCode }]);
                    setNewMaterialSubjectName('');
                    setNewMaterialSubjectCode('');
                    setAddSubjectModal(false);
                  }}
                >
                  <button type="button" className="absolute top-2 right-2 text-xl text-muted-foreground" onClick={() => setAddSubjectModal(false)}>&times;</button>
                  <h2 className="text-lg font-semibold mb-4">Add Subject</h2>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Subject Name</label>
                    <input className="w-full p-2 border rounded" value={newMaterialSubjectName} onChange={e => setNewMaterialSubjectName(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Subject Code</label>
                    <input className="w-full p-2 border rounded" value={newMaterialSubjectCode} onChange={e => setNewMaterialSubjectCode(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-hero w-full mt-4">Add Subject</button>
                </form>
              </div>
            )}
          </div>
        )}

        {activePanel === 'notice' && (
          <div>
            <AdminNoticeManager />
          </div>
        )}
        {activePanel === 'users' && (
                  <div>
            <h3 className="text-2xl font-bold mb-6 text-primary">User Management</h3>
            
            {/* Add User Form */}
            <div className="bg-white rounded-xl shadow-card p-6 mb-8">
              <h4 className="text-lg font-semibold mb-4">Add New User</h4>
              <form className="space-y-4" onSubmit={handleAddUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Name *</label>
                    <input 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      value={newUser.name} 
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })} 
                      required 
                    />
                </div>
                  <div>
                    <label className="block mb-1 font-medium">Email *</label>
                    <input 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      type="email" 
                      value={newUser.email} 
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                      required 
                    />
                </div>
              </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Student ID *</label>
                    <input 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      value={newUser.studentId} 
                      onChange={e => setNewUser({ ...newUser, studentId: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Branch *</label>
                <select
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      value={newUser.branch} 
                      onChange={e => setNewUser({ ...newUser, branch: e.target.value })} 
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Automobile Engineering">Automobile Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                <select
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      value={newUser.semester} 
                      onChange={e => setNewUser({ ...newUser, semester: e.target.value })}
                    >
                      <option value="">Select Semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                      <option value="3">3rd Semester</option>
                      <option value="4">4th Semester</option>
                      <option value="5">5th Semester</option>
                      <option value="6">6th Semester</option>
                </select>
              </div>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block mb-1 font-medium">College *</label>
                    <input 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      value={newUser.college} 
                      onChange={e => setNewUser({ ...newUser, college: e.target.value })} 
                      placeholder="Enter college name"
                      required 
                    />
              </div>
              <div>
                    <label className="block mb-1 font-medium">Password *</label>
                    <input 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-primary" 
                      type="password" 
                      value={newUser.password} 
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                      required 
                    />
              </div>
          </div>

                <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/80 transition">
                  Add User
                </button>
              </form>
                      </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold">All Students</h4>
                <p className="text-sm text-muted-foreground">Manage student accounts</p>
              </div>
              
              {loadingUsers ? (
                <div className="p-8 text-center">
                  <div className="text-muted-foreground">Loading users...</div>
            </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr key={user._id || user.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                </div>
                </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </div>
                </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.branch || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.semester ? `Sem ${user.semester}` : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{user.studentId || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-red-600 hover:text-red-900 transition"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                  handleDeleteUser(user._id || user.id);
                                }
                              }}
                            >
                              Delete
                            </button>
                    </td>
                  </tr>
                ))}
                      {users.length === 0 && !loadingUsers && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No users found. Add some users to get started.
                          </td>
                        </tr>
                )}
              </tbody>
            </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activePanel === 'portal' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Portal Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background p-6 rounded-xl shadow-card">
                <h4 className="text-lg font-semibold mb-4 text-primary">Maintenance Mode</h4>
                <p className="text-muted-foreground">Current Status: {maintenanceMode ? 'On' : 'Off'}</p>
                <button className="btn-hero w-full mt-4" onClick={() => setGlobalMaintenance(!maintenanceMode)}>
                  Toggle Maintenance Mode
                </button>
              </div>
              <div className="bg-background p-6 rounded-xl shadow-card">
                <h4 className="text-lg font-semibold mb-4 text-primary">Broadcast Message</h4>
                <p className="text-muted-foreground">Current Message: {broadcastMessage || 'No message set'}</p>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={4}
                  placeholder="Enter broadcast message"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                />
                <button className="btn-hero w-full mt-4" onClick={handleBroadcast}>Send Broadcast</button>
              </div>
            </div>
            <div className="mt-10">
              <h4 className="font-semibold mb-4">Broadcast History</h4>
              <ul className="space-y-2">
                {broadcastHistory.map((msg, index) => (
                  <li key={index} className="bg-muted/60 rounded-lg p-3 text-sm text-foreground">
                    {msg}
                  </li>
                ))}
                {broadcastHistory.length === 0 && <li className="text-muted-foreground">No broadcast history yet.</li>}
              </ul>
            </div>
          </div>
        )}

        {activePanel === 'quizzes' && (
            <div className="p-6">Quizzes management coming soon...</div>
        )}
        {activePanel === 'students' && (
          <div className="p-8 max-w-7xl mx-auto">
            <StudentPanel
              students={users.filter(u => u.userType === 'student')}
              subjects={subjects}
              onAddStudent={(student) => handleAddUser(student)}
              onDeleteStudent={handleDeleteUser}
              onUpdateStudent={(id, updates) => {
                // Handle student updates
                console.log('Update student:', id, updates);
              }}
              />
            </div>
        )}
        {activePanel === 'subjects' && (
          <div className="p-8 max-w-7xl mx-auto">
            <AdminSubjectManager />
          </div>
        )}
        {activePanel === 'subscriptions' && (
            <div className="p-6">Subscriptions management coming soon...</div>
        )}
        {activePanel === 'courses' && (
          <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-10 text-primary tracking-tight flex items-center gap-2">
              <span>Course Manager</span>
            </h2>
            <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-200 mb-12">
              <h3 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">Launch New Course</h3>
              <form
                className="flex flex-col md:flex-row gap-4 items-center mb-6"
                onSubmit={e => {
                  e.preventDefault();
                  if (!newCourseTitle.trim() || !newCourseDescription.trim() || !newCourseBranch || !newCourseSubject) return;
                  setCourseLaunches([{title: newCourseTitle, description: newCourseDescription, date: new Date().toLocaleDateString(), branch: newCourseBranch, subject: newCourseSubject}, ...courseLaunches]);
                  setNewCourseTitle('');
                  setNewCourseDescription('');
                  setNewCourseBranch('');
                  setNewCourseSubject('');
                }}
              >
                <select
                  className="flex-1 p-2 border rounded text-base"
                  value={newCourseBranch}
                  onChange={e => {
                    setNewCourseBranch(e.target.value);
                    setNewCourseSubject('');
                  }}
                  required
                >
                  <option value="">Select Branch</option>
                  {backendBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  className="flex-1 p-2 border rounded text-base"
                  value={newCourseSubject}
                  onChange={e => setNewCourseSubject(e.target.value)}
                  required
                  disabled={!newCourseBranch}
                >
                  <option value="">Select Subject</option>
                  {((backendSubjects && selectedBranch === newCourseBranch) ? backendSubjects : []).map((subject: any) => (
                    <option key={subject.code} value={subject.name}>{subject.name} ({subject.code})</option>
                  ))}
                </select>
                <input
                  className="flex-1 p-2 border rounded text-base"
                  type="text"
                  placeholder="Course Title"
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  required
                />
                <input
                  className="flex-1 p-2 border rounded text-base"
                  type="text"
                  placeholder="Course Description"
                  value={newCourseDescription}
                  onChange={e => setNewCourseDescription(e.target.value)}
                  required
                />
                <button type="submit" className="btn-hero px-6 py-2 text-base">Launch</button>
              </form>
            </div>
            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courseLaunches.length === 0 && <div className="text-muted-foreground col-span-full">No courses launched yet.</div>}
              {courseLaunches.map((course, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-card border border-indigo-200 p-6 flex flex-col gap-4 relative">
                  {/* Poster Upload & Display */}
                  <div className="flex flex-col items-center mb-2">
                    {coursePosters[idx] ? (
                      <div className="relative w-full flex flex-col items-center">
                        <img src={coursePosters[idx]} alt="Course Poster" className="w-full h-40 object-cover rounded-xl mb-2 border border-indigo-200" />
                        <button className="text-xs text-red-500 font-semibold absolute top-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1" onClick={() => setCoursePosters(prev => { const copy = {...prev}; delete copy[idx]; return copy; })}>Remove</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs shadow-sm hover:bg-indigo-200 transition mb-2 inline-block border border-indigo-200">
                        Upload Poster
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => {
                              setCoursePosters(prev => ({...prev, [idx]: ev.target?.result as string}));
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {editingCourseIdx === idx ? (
                    <form
                      className="flex flex-col gap-3"
                      onSubmit={e => {
                        e.preventDefault();
                        if (!editCourseData) return;
                        const updated = [...courseLaunches];
                        updated[idx] = {
                          ...updated[idx],
                          ...editCourseData
                        };
                        setCourseLaunches(updated);
                        setEditingCourseIdx(null);
                        setEditCourseData(null);
                      }}
                    >
                      <input
                        className="p-2 border rounded text-base"
                        type="text"
                        placeholder="Course Title"
                        value={editCourseData?.title || ''}
                        onChange={e => setEditCourseData(d => ({...d!, title: e.target.value}))}
                        required
                      />
                      <input
                        className="p-2 border rounded text-base"
                        type="text"
                        placeholder="Course Description"
                        value={editCourseData?.description || ''}
                        onChange={e => setEditCourseData(d => ({...d!, description: e.target.value}))}
                        required
                      />
                      <select
                        className="p-2 border rounded text-base"
                        value={editCourseData?.branch || ''}
                        onChange={e => setEditCourseData(d => ({...d!, branch: e.target.value, subject: ''}))}
                        required
                      >
                        <option value="">Select Branch</option>
                        {backendBranches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      <select
                        className="p-2 border rounded text-base"
                        value={editCourseData?.subject || ''}
                        onChange={e => setEditCourseData(d => ({...d!, subject: e.target.value}))}
                        required
                        disabled={!editCourseData?.branch}
                      >
                        <option value="">Select Subject</option>
                        {((backendSubjects && selectedBranch === editCourseData?.branch) ? backendSubjects : []).map((subject: any) => (
                          <option key={subject.code} value={subject.name}>{subject.name} ({subject.code})</option>
                        ))}
                      </select>
                      <div className="flex gap-2 mt-2">
                        <button type="submit" className="btn-hero px-4 py-1 text-xs">Save</button>
                        <button type="button" className="px-4 py-1 rounded bg-muted text-xs" onClick={() => {setEditingCourseIdx(null); setEditCourseData(null);}}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="font-bold text-xl text-indigo-900 flex items-center gap-2">{course.title}</div>
                        <div className="text-sm text-muted-foreground mb-1">{course.description}</div>
                        <div className="text-xs text-indigo-700 mb-1">Launched on: {course.date}</div>
                        <div className="text-xs text-indigo-700">Branch: {course.branch} | Subject: {course.subject}</div>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button className="text-blue-600 text-xs font-semibold hover:underline" onClick={() => {setEditingCourseIdx(idx); setEditCourseData({title: course.title, description: course.description, branch: course.branch, subject: course.subject});}}>Edit</button>
                        <button className="text-red-600 text-xs font-semibold hover:underline" onClick={() => setCourseLaunches(courseLaunches.filter((_, i) => i !== idx))}>Delete</button>
                      </div>
                      {/* Upload Lectures Section */}
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="font-semibold text-indigo-800 mb-2">Recorded Lectures</div>
                        <label className="cursor-pointer bg-primary text-white px-3 py-1 rounded text-xs shadow-sm hover:bg-indigo-700 transition mb-2 inline-block">
                          Upload Lecture
                          <input
                            type="file"
                            className="hidden"
                            accept="video/*"
                            multiple
                            onChange={e => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;
                              setCourseLectures(prev => {
                                const prevLectures = prev[idx] || [];
                                const newLectures = [
                                  ...prevLectures,
                                  ...Array.from(files).map(file => ({name: file.name, url: URL.createObjectURL(file)}))
                                ];
                                return {...prev, [idx]: newLectures};
                              });
                            }}
                          />
                        </label>
                        <ul className="space-y-2 mt-2">
                          {(courseLectures[idx] || []).length === 0 && <li className="text-xs text-muted-foreground">No lectures uploaded yet.</li>}
                          {(courseLectures[idx] || []).map((lecture, lidx) => (
                            <li key={lidx} className="flex items-center gap-2 bg-white border border-indigo-100 rounded px-2 py-1">
                              <span className="text-xs font-mono flex-1">{lecture.name}</span>
                              <a href={lecture.url} download className="text-blue-600 hover:underline text-xs font-semibold">Download</a>
                              <button className="text-red-500 text-xs font-semibold" onClick={() => setCourseLectures(prev => ({...prev, [idx]: prev[idx].filter((_, i) => i !== lidx)}))}>Delete</button>
                              <video src={lecture.url} controls className="w-20 h-10 rounded ml-2" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activePanel === 'admin' && (
          <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-primary">Admin Dashboard Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* User Stats */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{users.filter(u => u.userType === 'student').length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Students</div>
              </div>
              {/* Material Stats */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{users.filter(u => u.userType === 'admin').length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Admins</div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{materials.length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Materials</div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-1">{totalDownloads}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Downloads</div>
                <div className="text-sm text-muted-foreground">Avg ★ {averageRating.toFixed(1)}</div>
              </div>
              {/* Notice Stats */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">-</div>
                <div className="text-lg font-semibold text-muted-foreground">Notice Management</div>
              </div>
              {/* Maintenance Mode */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className={`text-4xl font-bold mb-2 ${maintenanceMode ? 'text-red-500' : 'text-green-500'}`}>{maintenanceMode ? 'ON' : 'OFF'}</div>
                <div className="text-lg font-semibold text-muted-foreground mb-4">Maintenance Mode</div>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold ${maintenanceMode ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white transition`}
                  onClick={() => setMaintenanceMode(m => !m)}
                >
                  {maintenanceMode ? 'Turn OFF' : 'Turn ON'}
                </button>
              </div>
            </div>
            {/* Course Launch Card */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 mb-8">
              <h3 className="text-xl font-bold mb-4 text-primary">Broadcast Message</h3>
              <form
                className="flex flex-col md:flex-row gap-4 items-center"
                onSubmit={e => {
                  e.preventDefault();
                  if (broadcastMessage.trim()) {
                    setLastBroadcast(broadcastMessage);
                    setBroadcastMessage('');
                  }
                }}
              >
                <input
                  className="flex-1 p-2 border rounded text-base"
                  type="text"
                  placeholder="Enter message to broadcast..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  required
                />
                <button type="submit" className="btn-hero px-6 py-2 text-base">Send</button>
              </form>
              {lastBroadcast && (
                <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded text-indigo-900">
                  <span className="font-semibold">Current Broadcast:</span> {lastBroadcast}
                </div>
              )}
            </div>
            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 mt-8">
              <h3 className="text-xl font-bold mb-4 text-primary">Recent Activity</h3>
              <ul className="space-y-3">
                {/* Show up to 5 most recent materials */}
                {materials.slice(-5).reverse().map(mat => (
                  <li key={mat.id} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-primary">Material Upload</span>
                    <span className="text-muted-foreground">{mat.name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(mat.uploadedAt).toLocaleString()}</span>
                  </li>
                ))}
                {/* Notice activity will be managed through Notice Management panel */}
                {/* Show up to 3 most recent users */}
                {users.slice(-3).reverse().map(user => (
                  <li key={user._id || user.email} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-green-600">User</span>
                    <span className="text-muted-foreground">{user.name} ({user.email})</span>
                  </li>
                ))}
                {/* If no activity */}
                {materials.length === 0 && users.length === 0 && (
                  <li className="text-muted-foreground">No recent activity yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
        {/* Edit Subject Modal */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (editModal.index !== null && editModal.subject && editModal.subject._id) {
                  try {
                    await axios.put(`/api/subjects/${editModal.subject._id}`, editForm);
                    toast.success("Subject updated successfully");
                    setEditModal({ open: false, subject: null, index: null });
                    // Refresh subjects (assume fetchSubjects is available)
                    // fetchSubjects(); // This function is not defined in the original file
                  } catch (err) {
                    toast.error("Failed to update subject");
                  }
                }
              }}
              className="bg-white dark:bg-card p-6 rounded shadow-lg w-full max-w-md"
            >
              <h2 className="text-lg font-semibold mb-4">Edit Subject</h2>
              <input
                className="w-full p-2 border rounded mb-2"
                placeholder="Subject Name"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="w-full p-2 border rounded mb-4"
                placeholder="Subject Code"
                value={editForm.code}
                onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded bg-muted" onClick={() => setEditModal({ open: false, subject: null, index: null })}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Save</button>
              </div>
            </form>
          </div>
        )}
        {/* Delete Subject Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Delete Subject</h2>
              <p>Are you sure you want to delete this subject?</p>
              <div className="flex gap-2 justify-end mt-4">
                <button className="px-4 py-2 rounded bg-muted" onClick={() => setDeleteModal({ open: false, index: null })}>Cancel</button>
                <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={async () => {
                  if (deleteModal.index !== null && subjects[deleteModal.index]?._id) {
                    try {
                      await axios.delete(`/api/subjects/${subjects[deleteModal.index]._id}`);
                      toast.success("Subject deleted successfully");
                      setDeleteModal({ open: false, index: null });
                      // Refresh subjects
                      // fetchSubjects(); // This function is not defined in the original file
                    } catch (err) {
                      toast.error("Failed to delete subject");
                    }
                  }
                }}>Delete</button>
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 
import React, { useState, useEffect } from "react";
import { userManagement } from "@/lib/userManagement";
import { noticeManagement, Notice } from "@/lib/noticeManagement";
import { materialManagement, Material } from "@/lib/materialManagement";
import { SUBJECTS } from "@/lib/subjectData";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Code, Cpu, Layers, Globe, Star, Pencil, Trash2, Users, Settings, Bell, ClipboardList, GraduationCap, UserCog } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/LoginForm";

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

// Merge all subject lists for easy access
const ALL_SUBJECTS = {
  ...ENTC_SUBJECTS,
  ...ELECTRICAL_SUBJECTS
};

const AdminDashboard: React.FC = () => {
  // Replace section and tab with a single activePanel state
  const [activePanel, setActivePanel] = useState('subject'); // default to 'subject'
  const [selectedBranch, setSelectedBranch] = useState<string>('Electronics & Telecommunication');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  // Portal control state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [lastBroadcast, setLastBroadcast] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [notices, setNotices] = useState<Notice[]>(noticeManagement.getAllNotices());
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editModal, setEditModal] = useState<{ open: boolean, subject: any, index: number | null }>({ open: false, subject: null, index: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [editForm, setEditForm] = useState({ name: "", code: "" });
  const [tab, setTab] = useState("announcements");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    branch: '',
    semester: '',
    userType: 'student',
  });
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  // Add subject handler
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode) return;
    // Add to SUBJECTS in memory (for demo; in real app, update backend)
    if (!SUBJECTS[selectedBranch][selectedSemester]) {
      SUBJECTS[selectedBranch][selectedSemester] = [];
    }
    SUBJECTS[selectedBranch][selectedSemester].push({ name: newSubjectName, code: newSubjectCode });
    setNewSubjectName('');
    setNewSubjectCode('');
    // Optionally, force a re-render
    setSubjects([...SUBJECTS[selectedBranch][selectedSemester]]);
  };
  // REMOVE: const [showLogin, setShowLogin] = useState(false);
  // REMOVE: const isAdmin = localStorage.getItem('userRole') === 'admin';
  // REMOVE: if (!isAdmin) { ... }
  // Just render the dashboard for everyone

  // Refresh users when section changes to 'users'
  useEffect(() => {
    if (activePanel === 'users') {
      setUsers(userManagement.getAllUsers());
    }
  }, [activePanel]);

  useEffect(() => {
    // Load all materials for the selected branch/semester
    setMaterials(materialManagement.getMaterials(selectedBranch, selectedSemester));
  }, [selectedBranch, selectedSemester]);

  const handleAddBranchSubjects = () => {
    const branchSubjects = ALL_SUBJECTS[selectedBranch as keyof typeof ALL_SUBJECTS];
    if (branchSubjects && branchSubjects[parseInt(selectedSemester) as keyof typeof branchSubjects]) {
      const semesterSubjects = branchSubjects[parseInt(selectedSemester) as keyof typeof branchSubjects];
      setSubjects(prev => [...prev, ...semesterSubjects]);
    }
  };

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      setBroadcastHistory(prev => [broadcastMessage, ...prev]);
      setBroadcastMessage('');
      // Here you would also send the broadcast to the backend or global state
    }
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent || !noticeDate) return;
    noticeManagement.addNotice({ title: noticeTitle, content: noticeContent, date: noticeDate });
    setNotices(noticeManagement.getAllNotices());
    setNoticeTitle("");
    setNoticeContent("");
    setNoticeDate("");
  };

  const handleDeleteNotice = (id: string) => {
    noticeManagement.deleteNotice(id);
    setNotices(noticeManagement.getAllNotices());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.userType === 'student') {
      if (userManagement.userExists(newUser.email, 'student')) {
        toast("Student already exists");
        return;
      }
      userManagement.createUser(newUser);
    } else {
      if (userManagement.userExists(newUser.email, 'admin')) {
        toast("Admin already exists");
        return;
      }
      // Manually add admin user with password
      const adminUser = {
        id: `admin_${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        userType: 'admin' as 'admin', // fix type
        createdAt: new Date(),
        lastLogin: new Date(),
        password: newUser.password, // <-- store password
      };
      const usersArr = userManagement.getAllUsers();
      usersArr.push(adminUser);
      localStorage.setItem('digi-gurukul-users', JSON.stringify(usersArr));
    }
    setUsers(userManagement.getAllUsers());
    setNewUser({ name: '', email: '', studentId: '', password: '', branch: '', semester: '', userType: 'student' });
    toast("User added successfully");
  };

  const handleDeleteUser = (userId: string) => {
    userManagement.deleteUser(userId);
    setUsers(userManagement.getAllUsers());
    toast("User deleted");
  };

  // Material upload handler
  const handleMaterialUpload = (subjectCode: string, e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
    materialManagement.addMaterial({
      branch: selectedBranch,
      semester: selectedSemester,
      subjectCode,
        name: `${type} - ${file.name}`,
      url: URL.createObjectURL(file),
      type: file.type,
      uploadedAt: new Date().toISOString(),
      });
    });
    setMaterials(materialManagement.getMaterials(selectedBranch, selectedSemester));
  };

  const handleDeleteMaterial = (materialId: string) => {
    materialManagement.deleteMaterial(materialId);
    setMaterials(materialManagement.getMaterials(selectedBranch, selectedSemester));
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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-8 text-primary">Admin Panel</h2>
        <div className="flex flex-col gap-4">
          {/* Card-style menu for all options */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'subject' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('subject')}
          >
            <BookOpen className={`w-6 h-6 ${activePanel === 'subject' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Add Subject</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'notice' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('notice')}
          >
            <Bell className={`w-6 h-6 ${activePanel === 'notice' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Add Notice</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'users' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('users')}
          >
            <Users className={`w-6 h-6 ${activePanel === 'users' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">User Management</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'portal' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('portal')}
          >
            <Settings className={`w-6 h-6 ${activePanel === 'portal' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Portal Control</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'announcements' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('announcements')}
          >
            <ClipboardList className={`w-6 h-6 ${activePanel === 'announcements' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Announcements</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'materials' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('materials')}
          >
            <Layers className={`w-6 h-6 ${activePanel === 'materials' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Materials</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'notices' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('notices')}
          >
            <FileText className={`w-6 h-6 ${activePanel === 'notices' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Notices</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'quizzes' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('quizzes')}
          >
            <Star className={`w-6 h-6 ${activePanel === 'quizzes' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Quizzes</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'students' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('students')}
          >
            <GraduationCap className={`w-6 h-6 ${activePanel === 'students' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Students</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'subscriptions' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('subscriptions')}
          >
            <UserCog className={`w-6 h-6 ${activePanel === 'subscriptions' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Subscriptions</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'courses' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('courses')}
          >
            <BookOpen className={`w-6 h-6 ${activePanel === 'courses' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Courses</span>
          </div>
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-card cursor-pointer transition-all duration-200 border-2 ${activePanel === 'admin' ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/40'}`}
            onClick={() => setActivePanel('admin')}
          >
            <Settings className={`w-6 h-6 ${activePanel === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-end mb-6">
          <button
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium"
            onClick={() => {
              localStorage.removeItem('userRole');
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
        {/* Only render the selected panel's content */}
        {activePanel === 'materials' && (
            <div>
            <h3 className="text-xl font-bold mb-6">Subjects List</h3>
            <div className="mb-4 flex gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Branch</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                >
                  {Object.keys(SUBJECTS).map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                >
                  {Object.keys(SUBJECTS[selectedBranch] || {}).map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Subject</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedSubjectDropdown ? selectedSubjectDropdown.code : ''}
                  onChange={e => {
                    const subj = (SUBJECTS[selectedBranch]?.[selectedSemester] || []).find((s: any) => s.code === e.target.value);
                    setSelectedSubjectDropdown(subj);
                  }}
                >
                  <option value="">Select subject</option>
                  {(SUBJECTS[selectedBranch]?.[selectedSemester] || []).map((subject: any) => (
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
                                  <div className="flex items-center gap-2">
                                    <a href={mat.url} download className="text-blue-600 hover:underline text-xs font-semibold">Download</a>
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
                    if (!SUBJECTS[selectedBranch][selectedSemester]) {
                      SUBJECTS[selectedBranch][selectedSemester] = [];
                    }
                    SUBJECTS[selectedBranch][selectedSemester].push({ name: newMaterialSubjectName, code: newMaterialSubjectCode });
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
        {activePanel === 'subject' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Add Subject</h3>
            <div className="mb-4 flex gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Branch</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                >
                  {Object.keys(SUBJECTS).map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                >
                  {Object.keys(SUBJECTS[selectedBranch] || {}).map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>
            <form className="max-w-lg space-y-4 bg-background p-6 rounded-xl shadow-card mb-8" onSubmit={handleAddSubject}>
              <div>
                <label className="block mb-1 font-medium">Subject Name</label>
                <input className="w-full p-2 border rounded" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Subject Code</label>
                <input className="w-full p-2 border rounded" value={newSubjectCode} onChange={e => setNewSubjectCode(e.target.value)} required />
              </div>
                  <button type="submit" className="btn-hero w-full mt-4">Add Subject</button>
                </form>
          </div>
              )}
        {activePanel === 'notice' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Add Notice</h3>
              <form className="max-w-lg space-y-4 bg-background p-6 rounded-xl shadow-card" onSubmit={handleAddNotice}>
                <div>
                  <label className="block mb-1 font-medium">Notice Title</label>
                  <input className="w-full p-2 border rounded" placeholder="Enter notice title" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Content</label>
                  <textarea className="w-full p-2 border rounded" rows={4} placeholder="Enter notice content" value={noticeContent} onChange={e => setNoticeContent(e.target.value)} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Date</label>
                  <input type="date" className="w-full p-2 border rounded" value={noticeDate} onChange={e => setNoticeDate(e.target.value)} />
                </div>
                <button type="submit" className="btn-hero w-full mt-4">Add Notice</button>
              </form>
              <div className="mt-10">
                <h4 className="font-semibold mb-4">All Notices</h4>
                <ul className="space-y-3">
                  {notices.map(notice => (
                    <li key={notice.id} className="bg-muted/60 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{notice.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{notice.date}</div>
                        <div className="text-muted-foreground text-sm">{notice.content}</div>
                      </div>
                      <button className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-xs" onClick={() => handleDeleteNotice(notice.id)}>Delete</button>
                    </li>
                  ))}
                  {notices.length === 0 && <li className="text-muted-foreground">No notices yet.</li>}
                </ul>
              </div>
            </div>
        )}
        {activePanel === 'users' && (
          <div>
            <h3 className="text-xl font-bold mb-6">User Management</h3>
            <form className="max-w-lg space-y-4 bg-background p-6 rounded-xl shadow-card mb-8" onSubmit={handleAddUser}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Name</label>
                  <input className="w-full p-2 border rounded" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Email</label>
                  <input className="w-full p-2 border rounded" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">User Type</label>
                  <select className="w-full p-2 border rounded" value={newUser.userType} onChange={e => setNewUser({ ...newUser, userType: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {newUser.userType === 'student' && (
                  <>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium">Student ID</label>
                      <input className="w-full p-2 border rounded" value={newUser.studentId} onChange={e => setNewUser({ ...newUser, studentId: e.target.value })} />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium">Branch</label>
                      <input className="w-full p-2 border rounded" value={newUser.branch} onChange={e => setNewUser({ ...newUser, branch: e.target.value })} />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium">Semester</label>
                      <input className="w-full p-2 border rounded" value={newUser.semester} onChange={e => setNewUser({ ...newUser, semester: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <input className="w-full p-2 border rounded" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn-hero w-full mt-4">Add User</button>
            </form>
            <h4 className="font-semibold mb-4">All Users</h4>
            <table className="min-w-full bg-background rounded-xl shadow-card">
              <thead>
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Branch</th>
                  <th className="p-2">Semester</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.userType}</td>
                    <td className="p-2">{user.selectedBranch || '-'}</td>
                    <td className="p-2">{user.selectedSemester || '-'}</td>
                    <td className="p-2">
                      <button className="text-red-500" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-4">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {activePanel === 'portal' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Portal Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background p-6 rounded-xl shadow-card">
                <h4 className="text-lg font-semibold mb-4 text-primary">Maintenance Mode</h4>
                <p className="text-muted-foreground">Current Status: {maintenanceMode ? 'On' : 'Off'}</p>
                <button className="btn-hero w-full mt-4" onClick={() => setMaintenanceMode(!maintenanceMode)}>
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
        {activePanel === 'announcements' && (
          <div className="p-6">Announcements management coming soon...</div>
        )}
        {activePanel === 'notices' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Notices Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ALL_SUBJECTS).map(([branch, branchData]) => (
                <div key={branch} className="bg-background p-6 rounded-xl shadow-card">
                  <h4 className="text-lg font-semibold mb-4 text-primary">{branch}</h4>
                  {Object.entries(branchData).map(([semester, semesterSubjects]) => (
                    <div key={semester} className="mb-4">
                      <h5 className="font-semibold mb-2 text-primary">{semester} Semester</h5>
                      <ul className="space-y-2">
                        {semesterSubjects.map((subject: any) => (
                          <li key={subject.code} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                            <span>{subject.name}</span>
                            <span className="text-xs text-muted-foreground">{subject.code}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {activePanel === 'quizzes' && (
            <div className="p-6">Quizzes management coming soon...</div>
        )}
        {activePanel === 'students' && (
          <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-primary">Students</h2>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
              <input
                className="flex-1 p-2 border rounded text-base"
                type="text"
                placeholder="Search by name, email, or branch..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white rounded-xl shadow-card border border-gray-200">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Branch</th>
                    <th className="px-4 py-2">Semester</th>
                    <th className="px-4 py-2">Student ID</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.userType === 'student' && (
                    u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    (u.selectedBranch || '').toLowerCase().includes(studentSearch.toLowerCase())
                  )).map(student => (
                    <tr key={student.email} className={`border-b ${selectedStudent && selectedStudent.email === student.email ? 'bg-primary/10' : ''}`}> 
                      <td className="px-4 py-2 font-medium">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">{student.selectedBranch || 'N/A'}</td>
                      <td className="px-4 py-2">{student.selectedSemester || 'N/A'}</td>
                      <td className="px-4 py-2">{student.studentId || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <button className="btn-hero px-3 py-1 text-xs" onClick={() => setSelectedStudent(student)}>View</button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.userType === 'student').length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Student Details Card */}
            {selectedStudent && (
              <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-200 max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-2xl text-primary">{selectedStudent.name}</span>
                  <span className="text-sm text-muted-foreground font-mono">{selectedStudent.email}</span>
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Branch:</span> {selectedStudent.selectedBranch || 'N/A'}<br/>
                  <span className="font-semibold">Semester:</span> {selectedStudent.selectedSemester || 'N/A'}<br/>
                  <span className="font-semibold">Student ID:</span> {selectedStudent.studentId || 'N/A'}
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-primary">Downloaded Materials</h4>
                  <div className="text-muted-foreground text-sm">(Download tracking coming soon...)</div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Recent Activity</h4>
                  <div className="text-muted-foreground text-sm">(Activity tracking coming soon...)</div>
                </div>
              </div>
            )}
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
                  {Object.keys(SUBJECTS).map(branch => (
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
                  {(SUBJECTS[newCourseBranch] ? Object.values(SUBJECTS[newCourseBranch]).flat() : []).map((subject: any) => (
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
                        {Object.keys(SUBJECTS).map(branch => (
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
                        {(SUBJECTS[editCourseData?.branch || ''] ? Object.values(SUBJECTS[editCourseData?.branch || '']).flat() : []).map((subject: any) => (
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
                <div className="text-4xl font-bold text-primary mb-2">{users.length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Users</div>
              </div>
              {/* Material Stats */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{materials.length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Materials</div>
              </div>
              {/* Notice Stats */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-200 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{notices.length}</div>
                <div className="text-lg font-semibold text-muted-foreground">Total Notices</div>
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
                {/* Show up to 3 most recent notices */}
                {notices.slice(-3).reverse().map(notice => (
                  <li key={notice.id} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-blue-600">Notice</span>
                    <span className="text-muted-foreground">{notice.title}</span>
                    <span className="text-xs text-muted-foreground">{notice.date}</span>
                  </li>
                ))}
                {/* Show up to 3 most recent users */}
                {users.slice(-3).reverse().map(user => (
                  <li key={user.email} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-green-600">User</span>
                    <span className="text-muted-foreground">{user.name} ({user.email})</span>
                  </li>
                ))}
                {/* If no activity */}
                {materials.length === 0 && notices.length === 0 && users.length === 0 && (
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
      </main>
    </div>
  );
};

export default AdminDashboard; 
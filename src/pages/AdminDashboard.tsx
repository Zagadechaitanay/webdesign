import React, { useState, useEffect } from "react";
import { userManagement } from "@/lib/userManagement";
import { noticeManagement, Notice } from "@/lib/noticeManagement";
import { materialManagement, Material } from "@/lib/materialManagement";
import { SUBJECTS } from "@/lib/subjectData";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Code, Cpu, Layers, Globe, Star, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [section, setSection] = useState<'subject' | 'notice' | 'users' | 'portal'>('subject');
  const [selectedBranch, setSelectedBranch] = useState<string>('Electronics & Telecommunication');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [subjects, setSubjects] = useState<any[]>([]);
  // Portal control state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
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

  // Material upload handler
  const handleMaterialUpload = (subjectCode: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    materialManagement.addMaterial({
      branch: selectedBranch,
      semester: selectedSemester,
      subjectCode,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
    setMaterials(materialManagement.getMaterials(selectedBranch, selectedSemester));
  };

  const handleDeleteMaterial = (materialId: string) => {
    materialManagement.deleteMaterial(materialId);
    setMaterials(materialManagement.getMaterials(selectedBranch, selectedSemester));
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-8 text-primary">Admin Panel</h2>
        <button
          className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${section === 'subject' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setSection('subject')}
        >
          Add Subject
        </button>
        <button
          className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${section === 'notice' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setSection('notice')}
        >
          Add Notice
        </button>
        <button
          className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${section === 'users' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setSection('users')}
        >
          User Management
        </button>
        <button
          className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${section === 'portal' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
          onClick={() => setSection('portal')}
        >
          Portal Control
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="announcements">
            {/* Announcements management UI goes here */}
            <div className="p-6">Announcements management coming soon...</div>
          </TabsContent>
          <TabsContent value="materials">
            {/* Materials management UI goes here */}
            <div>
              <h3 className="text-xl font-bold mb-6">Add Subject</h3>
              
              {/* ENTC Subject Management */}
              <div className="mb-8 bg-background p-6 rounded-xl shadow-card">
                <h4 className="text-lg font-semibold mb-4 text-primary">Branch Subject Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block mb-1 font-medium">Branch</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option>Electronics & Telecommunication</option>
                      <option>Computer Engineering</option>
                      <option>Electrical Engineering</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Automobile Engineering</option>
                      <option>Instrumentation Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                    </select>
                  </div>
                </div>
                {/* Always show current subjects for selected branch/semester */}
                {(() => {
                  const subjects = SUBJECTS[selectedBranch]?.[selectedSemester] || [];
                  return subjects.length > 0 ? (
                    <div className="mt-6">
                      <h5 className="font-semibold mb-3">Current Subjects:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subjects.map((subject: any, index: number) => {
                          const Icon = subjectIcons[index % subjectIcons.length];
                          return (
                            <Card key={index} className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/10 to-accent/10 border-0 relative">
                              <div className="absolute top-2 right-2 flex gap-2 z-10">
                                <button onClick={() => setEditModal({ open: true, subject, index })} className="p-1 rounded hover:bg-muted">
                                  <Pencil className="w-4 h-4 text-blue-600" />
                                </button>
                                <button onClick={() => setDeleteModal({ open: true, index })} className="p-1 rounded hover:bg-muted">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              <CardContent className="flex flex-col items-center py-6">
                                <div className="mb-3">
                                  <Icon className="w-10 h-10 text-primary animate-float-slow" />
                                </div>
                                <div className="font-bold text-lg text-center mb-1 text-gradient-primary">{subject.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">{subject.code}</div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-muted-foreground">No subjects found for this branch and semester.</div>
                  );
                })()}
                {(SUBJECTS[selectedBranch]?.[selectedSemester] || []).length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold mb-3">Upload Materials for Subjects:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(SUBJECTS[selectedBranch]?.[selectedSemester] || []).map((subject: any, index: number) => (
                        <div key={index} className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-sm text-muted-foreground">{subject.code}</div>
                          <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.zip" onChange={e => handleMaterialUpload(subject.code, e)} className="mt-2" />
                          <ul className="mt-2 space-y-1">
                            {materials.filter(m => m.subjectCode === subject.code).map(m => (
                              <li key={m.id} className="flex items-center justify-between bg-background p-2 rounded">
                                <a href={m.url} download className="text-primary underline">{m.name}</a>
                                <button className="ml-2 text-red-500" onClick={() => handleDeleteMaterial(m.id)}>Delete</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Subject Button */}
              <div className="flex justify-end mb-4">
                {!showAddSubject && (
                  <button className="btn-hero px-4 py-2 rounded" onClick={() => setShowAddSubject(true)}>
                    + Add Subject
                  </button>
                )}
              </div>
              {/* Manual Subject Addition Panel */}
              {showAddSubject && (
                <form className="max-w-lg space-y-4 bg-background p-6 rounded-xl shadow-card mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Manual Subject Addition</h4>
                    <button type="button" className="text-red-600 font-bold" onClick={() => setShowAddSubject(false)}>
                      Close
                    </button>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Subject Name</label>
                    <input className="w-full p-2 border rounded" placeholder="Enter subject name" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Subject Code</label>
                    <input className="w-full p-2 border rounded" placeholder="Enter subject code" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Branch</label>
                    <select className="w-full p-2 border rounded">
                      <option>Computer Engineering</option>
                      <option>Electronics & Telecommunication</option>
                      <option>Electrical Engineering</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Automobile Engineering</option>
                      <option>Instrumentation Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Semester</label>
                    <select className="w-full p-2 border rounded">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-hero w-full mt-4">Add Subject</button>
                </form>
              )}
            </div>
          </TabsContent>
          <TabsContent value="notices">
            {/* Notices management UI goes here */}
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
          </TabsContent>
          <TabsContent value="quizzes">
            {/* Quizzes management UI goes here */}
            <div className="p-6">Quizzes management coming soon...</div>
          </TabsContent>
          <TabsContent value="students">
            {/* Students management UI goes here */}
            <div className="p-6">Students management coming soon...</div>
          </TabsContent>
          <TabsContent value="subscriptions">
            {/* Subscriptions management UI goes here */}
            <div className="p-6">Subscriptions management coming soon...</div>
          </TabsContent>
          <TabsContent value="admin">
            {/* Admin controls UI goes here */}
            <div className="p-6">Admin controls coming soon...</div>
          </TabsContent>
        </Tabs>
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
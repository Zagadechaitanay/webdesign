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
  FileText,
  Video,
  Download,
  Edit,
  Cpu,
  FlaskConical,
  Atom,
  Code2,
  FileCode2,
  FileText as FileTextIcon,
  Book,
  FileBarChart2,
  FileSpreadsheet,
  FilePieChart,
  FileSignature,
  FileQuestion,
  FileCheck2,
  FileArchive,
  ScrollText,
  Pencil,
  HelpCircle,
  CheckCircle,
  Sparkles,
  Microscope,
  NotebookPen
} from "lucide-react";
import { SUBJECTS } from "@/lib/subjectData";
import { materialManagement, Material } from "@/lib/materialManagement";
import React, { useState } from "react";

interface SemesterPageProps {
  semester: number;
  branch: string;
}

const SemesterPage = ({ semester, branch }: SemesterPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/");
  };

  const handleBack = () => {
    navigate("/semester-selection", {
      state: { selectedBranch: branch }
    });
  };

  const handleChangeSemester = (newSemester: number) => {
    navigate(`/semester/${newSemester}`, {
      state: {
        selectedBranch: branch,
        selectedSemester: newSemester,
        userType: "student"
      }
    });
  };

  // Get subjects for this branch and semester
  const branchSubjects = SUBJECTS[branch];
  const semesterSubjects = branchSubjects && branchSubjects[semester];

  // Fallback header info
  const semesterTitle = `Semester ${semester}`;
  const semesterDescription = `Subjects and resources for ${branch}, semester ${semester}.`;

  // Icon set for subjects
  const subjectIcons = [
    BookOpen, FileTextIcon, Cpu, FlaskConical, Atom, Code2, FileCode2, Book, FileBarChart2, FileSpreadsheet, FilePieChart, FileSignature, FileQuestion, FileCheck2
  ];

  const [selectedSubject, setSelectedSubject] = useState<null | { name: string; code: string }>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const resourceTypes = [
    { key: 'syllabus', label: 'Syllabus', icon: ScrollText },
    { key: 'manual', label: 'Manual Answer', icon: Pencil },
    { key: 'guessing', label: 'Guessing Papers', icon: HelpCircle },
    { key: 'model', label: 'Model Answer Papers', icon: CheckCircle },
    { key: 'imp', label: 'MSBTE IMP', icon: Sparkles },
    { key: 'micro', label: 'Micro Project Topics', icon: Microscope },
    { key: 'notes', label: 'Notes', icon: NotebookPen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {semesterTitle}
                </h1>
                <p className="text-primary-foreground/80">
                  {semesterDescription}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 p-6 glass-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                Welcome to {semesterTitle}
              </h2>
              <p className="text-muted-foreground">
                {semesterDescription}
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <Button
                  key={sem}
                  variant={sem === semester ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChangeSemester(sem)}
                  className="w-10 h-10 p-0"
                >
                  {sem}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{semesterSubjects ? semesterSubjects.length : 0}</h3>
                <p className="text-muted-foreground">Active Subjects</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">85%</h3>
                <p className="text-muted-foreground">Attendance</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">8.5</h3>
                <p className="text-muted-foreground">CGPA</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{semesterSubjects ? semesterSubjects.length : 0}</h3>
                <p className="text-muted-foreground">Materials</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesterSubjects && semesterSubjects.length > 0 ? (
            semesterSubjects.map((subject, index) => {
              const materials = materialManagement.getMaterials(branch, String(semester)).filter(m => m.subjectCode === subject.code);
              const Icon = subjectIcons[index % subjectIcons.length];
              return (
                <Card key={index} className="p-6 glass-card hover-lift cursor-pointer" onClick={() => { setSelectedSubject(subject); setModalOpen(true); }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                    </div>
                  </div>
                  {/* Downloadable materials */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Materials</h4>
                    <ul className="space-y-2">
                      {materials.length > 0 ? (
                        materials.map((m) => (
                          <li key={m.id} className="flex items-center justify-between bg-muted p-2 rounded">
                            <span>{m.name}</span>
                            <Button size="sm" variant="outline">
                              <a href={m.url} download>
                                Download
                              </a>
                            </Button>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground">No materials uploaded yet.</li>
                      )}
                    </ul>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-muted-foreground">No subjects found for this branch and semester.</div>
          )}
        </div>
        {/* Material Modal */}
        {modalOpen && selectedSubject && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-background rounded-xl shadow-xl p-8 max-w-lg w-full relative animate-scale-in">
              <button className="absolute top-2 right-2 text-xl text-muted-foreground" onClick={() => setModalOpen(false)}>&times;</button>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-bold text-lg text-primary">{selectedSubject.name}</span>
                <span className="text-xs text-muted-foreground">{selectedSubject.code}</span>
              </div>
              <h4 className="font-semibold mb-2">Materials</h4>
              <ul className="space-y-2 mb-6">
                {resourceTypes.map(({ key, label, icon: Icon }) => {
                  // Find a material for this resource type (by name or metadata, here by name includes label)
                  const mat = materialManagement.getMaterials(branch, String(semester)).filter(m => m.subjectCode === selectedSubject.code && m.name.toLowerCase().includes(label.toLowerCase()))[0];
                  return (
                    <li key={key} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span>{label}</span>
                      </div>
                      {mat ? (
                        <Button size="sm" variant="outline">
                          <a href={mat.url} download>
                            Download
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">Not uploaded yet</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <h4 className="font-semibold mb-2">All Materials</h4>
              <ul className="space-y-2">
                {materialManagement.getMaterials(branch, String(semester)).filter(m => m.subjectCode === selectedSubject.code).length > 0 ? (
                  materialManagement.getMaterials(branch, String(semester)).filter(m => m.subjectCode === selectedSubject.code).map((m) => {
                    // Determine icon and extension
                    const ext = m.name.split('.').pop()?.toLowerCase() || '';
                    let Icon = FileText;
                    if (["ppt", "pptx"].includes(ext)) Icon = FileBarChart2;
                    else if (["xls", "xlsx", "csv"].includes(ext)) Icon = FileSpreadsheet;
                    else if (["doc", "docx"].includes(ext)) Icon = FileCode2;
                    else if (["mp4", "avi", "mov", "wmv"].includes(ext)) Icon = Video;
                    else if (["zip", "rar", "7z"].includes(ext)) Icon = FileArchive;
                    else if (["pdf"].includes(ext)) Icon = FileText;
                    else Icon = FileQuestion;
                    return (
                      <li key={m.id} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <span>{m.name}</span>
                          <span className="text-xs text-muted-foreground">.{ext}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <a href={m.url} download>
                            Download
                          </a>
                        </Button>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-muted-foreground">No materials uploaded yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterPage; 
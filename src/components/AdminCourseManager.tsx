import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth";
import { ALL_BRANCHES } from "@/constants/branches";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Layers, PlusCircle, RefreshCcw } from "lucide-react";

type CourseRecord = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  branch: string;
  semester: number | string;
  subject: string;
  poster?: string;
  createdAt?: string;
};

const DEFAULT_BRANCHES = [...ALL_BRANCHES];

const DEFAULT_SEMESTERS = [1, 2, 3, 4, 5, 6];

const AdminCourseManager: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [branches, setBranches] = useState<string[]>(DEFAULT_BRANCHES);
  const [semesters, setSemesters] = useState<number[]>(DEFAULT_SEMESTERS);
  const [subjects, setSubjects] = useState<{ name: string; code: string }[]>([]);
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    branch: "",
    semester: "",
    subject: "",
  });

  const authenticatedFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
        ...authService.getAuthHeaders(),
      };
      let response = await fetch(input, { ...init, headers });
      if (response.status === 401) {
        try {
          await authService.refreshToken();
          response = await fetch(input, { ...init, headers: { ...headers, ...authService.getAuthHeaders() } });
        } catch (err) {
          console.error("Failed to refresh token", err);
        }
      }
      return response;
    },
    []
  );

  const normalizeCourse = (course: any): CourseRecord => {
    const id = course?._id || course?.id;
    return {
      _id: id,
      id,
      title: course?.title || "Untitled",
      description: course?.description || "",
      branch: course?.branch || "Unknown",
      semester: course?.semester ?? "-",
      subject: course?.subject || "-",
      poster: course?.poster,
      createdAt: course?.createdAt || new Date().toISOString(),
    };
  };

  const fetchBranches = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/subjects/branches");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
          if (!filterBranch) {
            setFilterBranch(data[0]);
            setFormData((prev) => ({ ...prev, branch: data[0] }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, [authenticatedFetch, filterBranch]);

  const fetchSemesters = useCallback(
    async (branch: string) => {
      if (!branch) {
        setSemesters(DEFAULT_SEMESTERS);
        return;
      }
      try {
        const res = await authenticatedFetch(`/api/subjects/branches/${encodeURIComponent(branch)}/semesters`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSemesters(data);
            setFilterSemester(String(data[0]));
            setFormData((prev) => ({ ...prev, semester: String(data[0]) }));
          } else {
            setSemesters(DEFAULT_SEMESTERS);
          }
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
        setSemesters(DEFAULT_SEMESTERS);
      }
    },
    [authenticatedFetch]
  );

  const fetchSubjects = useCallback(
    async (branch: string, semester: string) => {
      if (!branch || !semester) {
        setSubjects([]);
        return;
      }
      try {
        const res = await authenticatedFetch(`/api/subjects?branch=${encodeURIComponent(branch)}&semester=${encodeURIComponent(semester)}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    },
    [authenticatedFetch]
  );

  const fetchCourses = useCallback(async () => {
    if (!filterBranch) return;
    setLoadingCourses(true);
    try {
      const params = new URLSearchParams();
      if (filterBranch) params.append("branch", filterBranch);
      if (filterSemester) params.append("semester", filterSemester);
      const res = await authenticatedFetch(`/api/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.courses || [];
      const normalized = list
        .map(normalizeCourse)
        .filter((course) => !filterSubject || course.subject === filterSubject);
      setCourses(normalized);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [authenticatedFetch, filterBranch, filterSemester, filterSubject]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (filterBranch) {
      fetchSemesters(filterBranch);
    }
  }, [filterBranch, fetchSemesters]);

  useEffect(() => {
    if (filterBranch && filterSemester) {
      fetchSubjects(filterBranch, filterSemester);
      fetchCourses();
    }
  }, [filterBranch, filterSemester, fetchSubjects, fetchCourses]);

  useWebSocket({
    userId: user?.id || "",
    token: authService.getToken() || undefined,
    onMessage: (message) => {
      if (message.type === "course_launched" && message.course) {
        const normalized = normalizeCourse(message.course);
        const matchesBranch = !filterBranch || normalized.branch === filterBranch;
        const matchesSemester = !filterSemester || String(normalized.semester) === String(filterSemester);
        if (matchesBranch && matchesSemester) {
          setCourses((prev) => {
            const exists = prev.some((c) => c.id === normalized.id);
            if (exists) {
              return prev.map((course) => (course.id === normalized.id ? { ...course, ...normalized } : course));
            }
            return [normalized, ...prev];
          });
        }
      }
    },
  });

  const handleCreateCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.branch || !formData.semester || !formData.subject) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await authenticatedFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          branch: formData.branch,
          semester: Number(formData.semester),
          subject: formData.subject,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create course");
      }
      toast.success("Course launched successfully");
      setFormData((prev) => ({ ...prev, title: "", description: "" }));
      fetchCourses();
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create course");
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Course Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Branch</Label>
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Semester</Label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={String(sem)}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.code} value={subject.name}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing courses for <strong>{filterBranch || "select a branch"}</strong>
              {filterSemester && ` • Semester ${filterSemester}`}
              {filterSubject && ` • ${filterSubject}`}
            </p>
            <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loadingCourses}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <ScrollArea className="h-[360px] border border-dashed rounded-xl p-4">
            {loadingCourses ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No courses found for this selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-2xl bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{course.title}</h4>
                      <Badge variant="secondary">Sem {course.semester}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      {course.subject}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" />
                      {course.branch}
                    </div>
                    <div className="text-[10px] text-right text-muted-foreground">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Launch New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateCourse}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Branch</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData((prev) => ({ ...prev, branch: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData((prev) => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.code} value={subject.name}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Course Title</Label>
                <Input
                  className="mt-2"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Input
                  className="mt-2"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Launch Course
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourseManager;


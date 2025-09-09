import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Upload, 
  Save,
  X,
  CheckCircle,
  GraduationCap,
  Award
} from 'lucide-react';
// Minimal branch list (subjects are fetched from API now)
const AVAILABLE_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering'
];

interface Subject {
  _id?: string;
  name: string;
  code: string;
  branch: string;
  semester: number;
  credits: number;
  hours: number;
  type: 'Theory' | 'Practical' | 'Project' | 'Elective';
  description?: string;
  isActive: boolean;
}

const AdminSubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Engineering');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    code: '',
    branch: 'Computer Engineering',
    semester: 1,
    credits: 4,
    hours: 60,
    type: 'Theory',
    description: ''
  });

  const availableBranches = AVAILABLE_BRANCHES;
  const semesters = [1, 2, 3, 4, 5, 6];

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const query = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : '';
      const response = await fetch(`/api/subjects${query}`, { headers: { ...authService.getAuthHeaders() } });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedBranch]);

  const filteredSubjects = subjects.filter(subject => 
    subject.branch === selectedBranch &&
    (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify(newSubject)
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewSubject({
          name: '',
          code: '',
          branch: 'Computer Engineering',
          semester: 1,
          credits: 4,
          hours: 60,
          type: 'Theory',
          description: ''
        });
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { ...authService.getAuthHeaders() }
      });

      if (response.ok) {
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleBulkImport = async () => {
    alert('Bulk import is disabled in this build. Subjects are managed via API.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subject Management</h2>
          <p className="text-gray-600">Manage MSBTE K-Scheme subjects</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBulkImport} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import K-Scheme
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches.map(branch => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSubjects} variant="outline" className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subjects...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{subject.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">Semester {subject.semester}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{subject.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {subject.credits} credits
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSubject(subject)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject._id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name *</label>
                <Input
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject Code *</label>
                <Input
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Branch *</label>
                  <Select value={newSubject.branch} onValueChange={(value) => setNewSubject({...newSubject, branch: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester *</label>
                  <Select value={newSubject.semester?.toString()} onValueChange={(value) => setNewSubject({...newSubject, semester: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Subject</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingSubject?._id) return;
                try {
                  const response = await fetch(`/api/subjects/${editingSubject._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
                    body: JSON.stringify({
                      name: editingSubject.name,
                      code: editingSubject.code,
                      branch: editingSubject.branch,
                      semester: editingSubject.semester,
                      credits: editingSubject.credits,
                      hours: editingSubject.hours,
                      type: editingSubject.type,
                      description: editingSubject.description || ''
                    })
                  });
                  if (response.ok) {
                    setEditingSubject(null);
                    fetchSubjects();
                  }
                } catch (error) {
                  console.error('Error updating subject:', error);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name *</label>
                <Input
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject Code *</label>
                <Input
                  value={editingSubject.code}
                  onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Branch *</label>
                  <Select value={editingSubject.branch} onValueChange={(value) => setEditingSubject({ ...editingSubject, branch: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester *</label>
                  <Select value={editingSubject.semester?.toString()} onValueChange={(value) => setEditingSubject({ ...editingSubject, semester: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Credits</label>
                  <Input type="number" value={editingSubject.credits} onChange={(e) => setEditingSubject({ ...editingSubject, credits: parseInt(e.target.value || '0') })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hours</label>
                  <Input type="number" value={editingSubject.hours} onChange={(e) => setEditingSubject({ ...editingSubject, hours: parseInt(e.target.value || '0') })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select value={editingSubject.type} onValueChange={(value) => setEditingSubject({ ...editingSubject, type: value as Subject['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">Theory</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectManager;

import React, { useState } from "react";

const BRANCHES = [
  { label: "Computer Engineering (CO)", value: "CO" },
  { label: "Information Technology (IF)", value: "IF" },
  { label: "Mechanical Engineering (ME)", value: "ME" },
  { label: "Civil Engineering (CE)", value: "CE" },
  { label: "Electrical Engineering (EE)", value: "EE" },
  { label: "Electronics & Telecommunication (EJ)", value: "EJ" },
];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

// Dummy data for UI demo
const DUMMY_SUBJECTS = [
  { subjectName: "Object Oriented Programming Using C++", subjectCode: "313304" },
  { subjectName: "Data Structure Using C", subjectCode: "313301" },
];

export default function AdminSubjectManager() {
  const [branch, setBranch] = useState("CO");
  const [semester, setSemester] = useState(1);
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState(DUMMY_SUBJECTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Filtered subjects by search
  const filteredSubjects = subjects.filter(
    (s) =>
      s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectCode.includes(search)
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subject Management</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="border rounded px-3 py-2"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          {BRANCHES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
        >
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[180px]"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          onClick={() => setShowAddModal(true)}
        >
          + Add Subject
        </button>
      </div>
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white dark:bg-card">
          <thead>
            <tr className="bg-muted text-left">
              <th className="px-4 py-2">Subject Name</th>
              <th className="px-4 py-2">Subject Code</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-muted-foreground">
                  No subjects found.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((subj, idx) => (
                <tr key={subj.subjectCode} className="border-b">
                  <td className="px-4 py-2">{subj.subjectName}</td>
                  <td className="px-4 py-2">{subj.subjectCode}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setEditIndex(idx)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => alert("Delete not implemented in demo")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add Subject Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Subject</h2>
            {/* Form fields here */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-muted"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-primary text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Subject Modal (placeholder) */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Subject</h2>
            {/* Form fields here */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-muted"
                onClick={() => setEditIndex(null)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-primary text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
import { useParams } from "react-router-dom";
import { SUBJECTS } from "@/lib/subjectData";

const BranchSubjectsPage = () => {
  const { branchName } = useParams<{ branchName: string }>();
  const decodedBranch = decodeURIComponent(branchName || "");
  const branchSubjects = SUBJECTS[decodedBranch];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      <h1 className="text-3xl font-bold mb-6">Subjects for {decodedBranch} Branch</h1>
      {branchSubjects ? (
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
          {Object.entries(branchSubjects).map(([semester, subjects]) => (
            <div key={semester} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Semester {semester}</h2>
              <ul className="list-disc pl-6">
                {(subjects as any[]).map((subject) => (
                  <li key={subject.code} className="mb-1">
                    <span className="font-medium">{subject.name}</span> <span className="text-gray-500">({subject.code})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-lg text-gray-700">No subjects found for <span className="font-semibold">{decodedBranch}</span>.</p>
        </div>
      )}
    </div>
  );
};

export default BranchSubjectsPage; 
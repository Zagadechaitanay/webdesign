import { useNavigate, useLocation } from "react-router-dom";
import SemesterSelection from "@/components/SemesterSelection";
import { userManagement } from "@/lib/userManagement";

const SemesterSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedBranch = location.state?.selectedBranch || "Computer Engineering";

  const handleSemesterSelect = (semester: number) => {
    // Update user's selected semester
    userManagement.updateUserSemester(semester);
    
    // Navigate directly to the semester page
    navigate(`/semester/${semester}`, {
      state: {
        selectedBranch,
        selectedSemester: semester,
        userType: "student"
      }
    });
  };

  const handleBack = () => {
    // Go back to the main page
    navigate("/");
  };

  return (
    <SemesterSelection
      selectedBranch={selectedBranch}
      onSemesterSelect={handleSemesterSelect}
      onBack={handleBack}
    />
  );
};

export default SemesterSelectionPage; 
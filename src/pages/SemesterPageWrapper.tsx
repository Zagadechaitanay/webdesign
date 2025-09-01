import { useParams, useLocation } from "react-router-dom";
import SemesterPage from "./SemesterPage";

const SemesterPageWrapper = () => {
  const { semester } = useParams();
  const location = useLocation();
  const selectedBranch = location.state?.selectedBranch || "Computer Engineering";

  const semesterNumber = parseInt(semester || "1");

  return (
    <SemesterPage 
      semester={semesterNumber} 
      branch={selectedBranch}
    />
  );
};

export default SemesterPageWrapper; 
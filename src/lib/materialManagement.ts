// Material Management System
export interface Material {
  id: string;
  branch: string;
  semester: string;
  subjectCode: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

class MaterialManagement {
  private materials: Material[] = [];

  constructor() {
    this.loadMaterials();
  }

  private loadMaterials() {
    const stored = localStorage.getItem('digi-gurukul-materials');
    if (stored) {
      this.materials = JSON.parse(stored);
    } else {
      this.materials = [];
      this.saveMaterials();
    }
  }

  private saveMaterials() {
    localStorage.setItem('digi-gurukul-materials', JSON.stringify(this.materials));
  }

  getMaterials(branch: string, semester: string): Material[] {
    return this.materials.filter(m => m.branch === branch && m.semester === semester);
  }

  addMaterial(material: Omit<Material, 'id'>) {
    const newMaterial: Material = { ...material, id: crypto.randomUUID() };
    this.materials.push(newMaterial);
    this.saveMaterials();
  }

  deleteMaterial(id: string) {
    this.materials = this.materials.filter(m => m.id !== id);
    this.saveMaterials();
  }
}

export const materialManagement = new MaterialManagement();

// Activity log system for student actions
export interface ActivityLog {
  studentEmail: string;
  action: string;
  materialName?: string;
  timestamp: string;
}

const ACTIVITY_LOG_KEY = 'digi-gurukul-activity-log';

export function logStudentActivity(log: ActivityLog) {
  const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  logs.push(log);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
}

export function getStudentActivityLogs(email: string): ActivityLog[] {
  const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  return logs.filter((l: ActivityLog) => l.studentEmail === email);
} 
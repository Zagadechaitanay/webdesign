// Notice Management System
export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
}

class NoticeManagement {
  private notices: Notice[] = [];

  constructor() {
    this.loadNotices();
  }

  private loadNotices() {
    const stored = localStorage.getItem('digi-gurukul-notices');
    if (stored) {
      this.notices = JSON.parse(stored);
    } else {
      this.notices = [];
      this.saveNotices();
    }
  }

  private saveNotices() {
    localStorage.setItem('digi-gurukul-notices', JSON.stringify(this.notices));
  }

  getAllNotices(): Notice[] {
    // Return sorted by date descending
    return [...this.notices].sort((a, b) => b.date.localeCompare(a.date));
  }

  addNotice(notice: Omit<Notice, 'id'>): Notice {
    const newNotice: Notice = {
      ...notice,
      id: `notice_${Date.now()}`
    };
    this.notices.push(newNotice);
    this.saveNotices();
    return newNotice;
  }

  deleteNotice(id: string): boolean {
    const idx = this.notices.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.notices.splice(idx, 1);
      this.saveNotices();
      return true;
    }
    return false;
  }
}

export const noticeManagement = new NoticeManagement(); 
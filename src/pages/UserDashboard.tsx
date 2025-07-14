import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, Moon } from "lucide-react";

export default function UserDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // Simulate user name from localStorage or context
  const userName = localStorage.getItem("userName") || "Student";

  useEffect(() => {
    fetchAnnouncements();
    fetchNotices();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      setNotices([]);
    }
  };

  // Theme switcher
  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      <div className="max-w-3xl mx-auto p-6">
        {/* Theme Switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1 rounded bg-muted hover:bg-accent transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Hero Welcome Section */}
        <div className="flex flex-col items-center justify-center py-10 mb-8">
          <div className="bg-gradient-to-tr from-primary to-primary-glow rounded-full p-4 shadow-glow animate-glow-slow mb-4">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gradient-primary text-center mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-xl">
            Your personalized digital education portal for announcements, notices, and resources. Stay updated and make the most of your learning journey!
          </p>
        </div>

        {/* College Announcements */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">College Announcement</Badge>
          </h2>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : announcements.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-6 text-center text-muted-foreground">
                No announcements at this time.
              </CardContent>
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a._id} className="mb-3 glass-card">
                <CardContent>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{a.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">{a.message}</div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* Notice Board (Always Visible) */}
        <section>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Badge variant="outline">Notice Board</Badge>
          </h2>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : notices.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-6 text-center text-muted-foreground">
                No notices at this time.
              </CardContent>
            </Card>
          ) : (
            notices.map((n) => (
              <Card key={n._id} className="mb-3 glass-card">
                <CardContent>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">{n.message}</div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </div>
  );
} 
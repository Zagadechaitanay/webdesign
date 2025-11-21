import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

const AdminMessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/messages', { headers: { ...authService.getAuthHeaders() } });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { setMessages([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sendReply = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/contact/messages/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ replySubject, replyBody })
      });
      if (res.ok) {
        setReplySubject(''); setReplyBody(''); setSelected(null); load();
      }
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-0 shadow lg:col-span-1">
        <CardContent className="p-0">
          <div className="p-4 border-b font-semibold">Contact Messages</div>
          <div className="max-h-[520px] overflow-auto">
            {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
            {!loading && messages.length === 0 && <div className="p-4 text-sm text-slate-500">No messages</div>}
            {messages.map(m => (
              <div key={m.id} className={`p-4 border-b cursor-pointer ${selected?.id === m.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`} onClick={() => { setSelected(m); setReplySubject(`Re: ${m.subject}`); }}>
                <div className="text-sm font-semibold text-slate-900">{m.subject}</div>
                <div className="text-xs text-slate-600">From: {m.name} &lt;{m.email}&gt;</div>
                <div className="text-xs mt-1 text-slate-500">{new Date(m.createdAt?._seconds ? m.createdAt._seconds*1000 : m.createdAt).toLocaleString?.() || ''}</div>
                <div className="mt-1 text-sm line-clamp-2 text-slate-700">{m.message}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">Status: {m.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow lg:col-span-2">
        <CardContent className="p-6">
          {!selected ? (
            <div className="text-slate-500 text-sm">Select a message to view and reply.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500">From</div>
                <div className="font-semibold">{selected.name} &lt;{selected.email}&gt;</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Subject</div>
                <div className="font-semibold">{selected.subject}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Message</div>
                <div className="text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>

              <hr className="my-4" />

              <div className="text-lg font-semibold">Reply</div>
              <Input placeholder="Subject" value={replySubject} onChange={e => setReplySubject(e.target.value)} />
              <Textarea rows={6} placeholder="Write your reply..." value={replyBody} onChange={e => setReplyBody(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={sendReply} disabled={!replySubject || !replyBody}>Send Reply</Button>
                <Button variant="outline" onClick={() => { setSelected(null); setReplySubject(''); setReplyBody(''); }}>Cancel</Button>
              </div>

              {!!(selected.replies || []).length && (
                <div className="mt-6">
                  <div className="font-semibold mb-2">Previous Replies</div>
                  <ul className="space-y-2">
                    {(selected.replies || []).map((r: any, i: number) => (
                      <li key={i} className="text-sm text-slate-700">
                        <div className="text-xs text-slate-500">{new Date(r.at?._seconds ? r.at._seconds*1000 : r.at).toLocaleString?.() || ''}</div>
                        <div className="font-semibold">{r.subject}</div>
                        <div className="whitespace-pre-wrap">{r.body}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessageCenter;

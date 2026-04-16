import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select, Typography, Tag, Spin, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { topicsApi } from '../api/topics';
import { Note, Topic } from '../types';

const { Text } = Typography;
const { Search } = Input;

const LEVEL_COLORS: Record<number, string> = { 0: 'default', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'gold' };
const LEVEL_LABELS: Record<number, string> = { 0: 'New', 1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4' };

function formatNextReview(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff}d`;
}

export default function NotesList() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([notesApi.getAll(), topicsApi.getAll()])
      .then(([n, t]) => { setNotes(n); setTopics(t); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    const matchTopic = !topicFilter || n.topicId === topicFilter;
    return matchSearch && matchTopic;
  });

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text strong style={{ fontSize: 22 }}>Notes</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>{notes.length} total</Text>
        </div>
        <Button type="primary" onClick={() => navigate('/add')}>+ Add Note</Button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Search
          placeholder="Search notes..."
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
          allowClear
        />
        <Select
          placeholder="Filter by topic"
          allowClear
          style={{ width: 180 }}
          options={topics.map((t) => ({ value: t.id, label: t.name }))}
          onChange={(v) => setTopicFilter(v)}
        />
      </div>

      {filtered.length === 0 ? (
        <Empty description={notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}>
          {notes.length === 0 && (
            <Button type="primary" onClick={() => navigate('/add')}>
              Create your first note
            </Button>
          )}
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              style={{
                background: '#fff',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d9d9d9')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f0f0f0')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ fontSize: 14 }}>{note.title}</Text>
                  {note.topic && <Tag style={{ margin: 0 }}>{note.topic.name}</Tag>}
                </div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                  {note.coreIdea.length > 80 ? note.coreIdea.slice(0, 80) + '…' : note.coreIdea}
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <Tag color={LEVEL_COLORS[note.reviewLevel]} style={{ margin: 0 }}>
                      {LEVEL_LABELS[note.reviewLevel] ?? `Lv.${note.reviewLevel}`}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 3 }}>
                    {formatNextReview(note.nextReviewAt)}
                  </Text>
                </div>
                <RightOutlined style={{ color: '#ccc', fontSize: 12 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, List, Typography, Alert, Spin, Tag, Space } from 'antd';
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { Note, TodayResponse } from '../types';

const { Title, Text } = Typography;

const LEVEL_COLORS: Record<number, string> = { 0: 'default', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'gold' };
const LEVEL_LABELS: Record<number, string> = { 0: 'New', 1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4' };

interface TopicGroup {
  id: string;
  name: string;
  count: number;
}

function groupByTopic(notes: Note[]): TopicGroup[] {
  const map = new Map<string, TopicGroup>();
  for (const note of notes) {
    if (!note.topicId || !note.topic) continue;
    if (!map.has(note.topicId)) {
      map.set(note.topicId, { id: note.topicId, name: note.topic.name, count: 0 });
    }
    map.get(note.topicId)!.count++;
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notesApi
      .getToday()
      .then(setData)
      .catch(() => setError('Cannot connect to backend. Make sure the server is running on port 3000.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (error) return <Alert type="error" message={error} />;

  const count = data?.count ?? 0;
  const topicGroups = groupByTopic(data?.notes ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Your daily review queue</Text>
      </div>

      {/* Main review card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            {count > 0 ? (
              <>
                <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
                  <FireOutlined style={{ color: '#fa541c' }} /> {count}
                </div>
                <Text type="secondary">note{count === 1 ? '' : 's'} to review today</Text>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> All done
                </div>
                <Text type="secondary">No reviews due — you're on top of it!</Text>
              </>
            )}
          </div>
          {count > 0 && (
            <Button type="primary" size="large" onClick={() => navigate('/review')}>
              Review All
            </Button>
          )}
        </div>

        {/* Review by topic */}
        {topicGroups.length > 0 && (
          <div style={{ marginTop: 20, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              Review by topic
            </Text>
            <Space wrap style={{ marginTop: 10 }}>
              {topicGroups.map((g) => (
                <Button
                  key={g.id}
                  onClick={() => navigate(`/review?topicId=${g.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {g.name}
                  <Tag color="volcano" style={{ margin: 0, fontSize: 11 }}>{g.count}</Tag>
                </Button>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {count === 0 && (
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Keep the streak alive — add something new.</Text>
            <br />
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/add')}>
              Add a note
            </Button>
          </div>
        </Card>
      )}

      {count > 0 && (
        <>
          <Text strong style={{ color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            Due today
          </Text>
          <List
            dataSource={data?.notes}
            renderItem={(note) => (
              <List.Item
                style={{ background: '#fff', padding: '12px 16px', marginBottom: 4, borderRadius: 8, border: '1px solid #f0f0f0' }}
                extra={
                  <Tag color={LEVEL_COLORS[note.reviewLevel]}>
                    {LEVEL_LABELS[note.reviewLevel] ?? `Lv.${note.reviewLevel}`}
                  </Tag>
                }
              >
                <Text style={{ fontWeight: 500 }}>{note.title}</Text>
                {note.topic && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>— {note.topic.name}</Text>
                )}
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
}

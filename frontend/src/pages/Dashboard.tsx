import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Alert, Tag, Skeleton } from 'antd';
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { statsApi } from '../api/stats';
import type { StreakResponse, HeatmapEntry } from '../api/stats';
import { Note, TodayResponse } from '../types';
import Heatmap from '../components/Heatmap';

const { Title, Text } = Typography;

// ── Flicker animation (injected once) ─────────────────────

const FLICKER_CSS = `
@keyframes flicker {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50%       { transform: scale(1.18); opacity: 1; }
}
.streak-fire {
  display: inline-block;
  animation: flicker 1.5s ease-in-out infinite;
  transform-origin: bottom center;
}
`;

function injectFlickerCSS() {
  if (document.getElementById('streak-flicker-css')) return;
  const style = document.createElement('style');
  style.id = 'streak-flicker-css';
  style.textContent = FLICKER_CSS;
  document.head.appendChild(style);
}

// ── Constants ─────────────────────────────────────────────

const LEVEL_COLORS: Record<number, string> = {
  0: 'default', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'gold',
};
const LEVEL_LABELS: Record<number, string> = {
  0: 'New', 1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4',
};

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
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

// ── Topic Review Card ──────────────────────────────────────

function TopicReviewCard({ group, onReview }: { group: TopicGroup; onReview: () => void }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 10,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = '#d9d9d9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      <div>
        <Text style={{ fontSize: 16 }}>📘</Text>
        <Text strong style={{ fontSize: 14, marginLeft: 6 }}>{group.name}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <FireOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
            {group.count} note{group.count !== 1 ? 's' : ''} due
          </Text>
        </div>
        <Button size="small" type="primary" onClick={onReview}>
          Review
        </Button>
      </div>
    </div>
  );
}

// ── Streak Banner ──────────────────────────────────────────

function StreakBanner({ streak }: { streak: StreakResponse }) {
  if (streak.streakCount === 0) return null;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: '#fff7e6',
      border: '1px solid #ffd591',
      borderRadius: 20,
      padding: '4px 14px',
      fontSize: 14,
      fontWeight: 600,
      color: '#d46b08',
    }}>
      <span className="streak-fire">🔥</span>
      {streak.streakCount} day{streak.streakCount !== 1 ? 's' : ''} streak
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function Dashboard() {
  injectFlickerCSS();

  const navigate = useNavigate();
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);

  useEffect(() => {
    notesApi
      .getToday()
      .then(setData)
      .catch(() => setError('Cannot connect to backend. Make sure the server is running on port 3000.'))
      .finally(() => setLoading(false));

    statsApi.getStreak().then(setStreak).catch(() => {});
    statsApi.getHeatmap(90).then(setHeatmap).catch(() => {});
  }, []);

  if (error) return <Alert type="error" message={error} />;

  const count = data?.count ?? 0;
  const topicGroups = groupByTopic(data?.notes ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header row with streak ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Your daily review queue</Text>
        </div>
        {streak && <StreakBanner streak={streak} />}
      </div>

      {/* ── Activity heatmap ── */}
      {heatmap.length > 0 && (
        <Card size="small" style={{ borderRadius: 10 }}>
          <Text style={{
            fontSize: 11, fontWeight: 600, color: '#999',
            textTransform: 'uppercase', letterSpacing: 1,
            display: 'block', marginBottom: 12,
          }}>
            Activity
          </Text>
          <Heatmap data={heatmap} />
        </Card>
      )}

      {/* ── Main review card ── */}
      {loading ? (
        <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
      ) : (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              {count > 0 ? (
                <>
                  <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
                    <FireOutlined style={{ color: '#fa541c' }} /> {count}
                  </div>
                  <Text type="secondary">note{count !== 1 ? 's' : ''} to review today</Text>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> All done
                  </div>
                  <Text type="secondary">Nothing to review — great work! 🎉</Text>
                </>
              )}
            </div>
            {count > 0 && (
              <Button type="primary" size="large" onClick={() => navigate('/review')}>
                Review All
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ── Review by topic (card grid) ── */}
      {!loading && topicGroups.length > 0 && (
        <div>
          <Text style={{
            fontSize: 11, fontWeight: 600, color: '#999',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Review by topic
          </Text>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
            marginTop: 12,
          }}>
            {topicGroups.map((g) => (
              <TopicReviewCard
                key={g.id}
                group={g}
                onReview={() => navigate(`/review?topicId=${g.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── No review state ── */}
      {!loading && count === 0 && (
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Keep the momentum — add something new.</Text>
            <br />
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/add')}>
              Add a note
            </Button>
          </div>
        </Card>
      )}

      {/* ── Due notes list ── */}
      {!loading && count > 0 && (
        <div>
          <Text style={{
            fontSize: 11, fontWeight: 600, color: '#999',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Due today
          </Text>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data?.notes.map((note) => (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                style={{
                  background: '#fff',
                  padding: '11px 16px',
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
                <div>
                  <Text style={{ fontWeight: 500 }}>{note.title}</Text>
                  {note.topic && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      {note.topic.name}
                    </Text>
                  )}
                </div>
                <Tag color={LEVEL_COLORS[note.reviewLevel]}>
                  {LEVEL_LABELS[note.reviewLevel] ?? `Lv.${note.reviewLevel}`}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

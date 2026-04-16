import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Typography, Tag, Spin, Popconfirm, message, Divider, Grid, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { Note } from '../types';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const LEVEL_COLORS: Record<number, string> = { 0: 'default', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'gold' };
const LEVEL_LABELS: Record<number, string> = { 0: 'New', 1: 'Lv.1', 2: 'Lv.2', 3: 'Lv.3', 4: 'Lv.4' };

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    notesApi.getById(id).then(setNote).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await notesApi.remove(id);
      message.success('Note deleted');
      navigate('/notes');
    } catch {
      message.error('Failed to delete note');
      setDeleting(false);
    }
  }

  function handleConvertToBlog() {
    if (!note) return;
    navigate('/blog/new', {
      state: {
        title: note.title,
        content: `## ${note.title}\n\n${note.coreIdea}`,
        topicId: note.topicId,
      },
    });
  }

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;
  if (!note) return <Text type="secondary">Note not found.</Text>;

  const deleteButton = (
    <Popconfirm
      title="Delete this note?"
      description="This cannot be undone."
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
      onConfirm={handleDelete}
    >
      <Button danger icon={<DeleteOutlined />} loading={deleting}>Delete</Button>
    </Popconfirm>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/notes')} style={{ color: '#999', flexShrink: 0 }}>
          {!isMobile && 'Notes'}
        </Button>

        {isMobile ? (
          // Mobile: primary Edit button + overflow menu
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/notes/${id}/edit`)}>
              Edit
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'blog', label: 'Convert to Blog', icon: <FileTextOutlined /> },
                  { key: 'delete', label: <Text type="danger">Delete</Text>, icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />, danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'blog') handleConvertToBlog();
                  if (key === 'delete') handleDelete();
                },
              }}
              trigger={['click']}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        ) : (
          // Desktop: all buttons visible
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<FileTextOutlined />} onClick={handleConvertToBlog}>Convert to Blog</Button>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/notes/${id}/edit`)}>Edit</Button>
            {deleteButton}
          </div>
        )}
      </div>

      {/* ── Content card ── */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>{note.title}</Title>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {note.topic && <Tag>{note.topic.name}</Tag>}
              <Tag color={LEVEL_COLORS[note.reviewLevel]}>
                {LEVEL_LABELS[note.reviewLevel] ?? `Lv.${note.reviewLevel}`}
              </Tag>
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              Recall Questions
            </Text>
            <ol style={{ marginTop: 8, paddingLeft: 20 }}>
              {note.questions.map((q, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#333', fontSize: 15 }}>{q}</li>
              ))}
            </ol>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              Core Idea
            </Text>
            <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 15 }}>{note.coreIdea}</Paragraph>
          </div>

          <div>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#faad14', textTransform: 'uppercase', letterSpacing: 1 }}>
              Common Mistake
            </Text>
            <div style={{ marginTop: 8, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
              {note.mistake}
            </div>
          </div>

          <div>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              Example
            </Text>
            <pre style={{ marginTop: 8, background: '#1d1d1d', color: '#7ec8a0', borderRadius: 8, padding: '14px 16px', fontSize: 13, overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
              {note.example}
            </pre>
          </div>

          <Divider style={{ margin: 0 }} />

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <Text style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Last reviewed</Text>
              <div style={{ fontSize: 13, marginTop: 2 }}>{formatDate(note.lastReviewedAt)}</div>
            </div>
            <div>
              <Text style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Next review</Text>
              <div style={{ fontSize: 13, marginTop: 2 }}>{formatDate(note.nextReviewAt)}</div>
            </div>
            <div>
              <Text style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Created</Text>
              <div style={{ fontSize: 13, marginTop: 2 }}>{formatDate(note.createdAt)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

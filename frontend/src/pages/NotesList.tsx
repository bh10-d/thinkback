import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Typography, Tag, Button, Skeleton, Empty, Popconfirm, message, Dropdown, Modal, Radio } from 'antd';
import type { InputRef } from 'antd';
import { FireOutlined, CaretRightOutlined, CaretDownOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, TagsOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { topicsApi } from '../api/topics';
import { Note, Topic } from '../types';

const { Text } = Typography;
const { Search } = Input;

// ── Utilities ────────────────────────────────────────────

interface TopicGroup {
  key: string;
  topicId: string | null;
  topicName: string;
  notes: Note[];
}

function isDueToday(note: Note): boolean {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return new Date(note.nextReviewAt) <= end;
}

function formatNextReview(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff}d`;
}

function buildGroups(notes: Note[]): TopicGroup[] {
  const map = new Map<string, TopicGroup>();
  for (const note of notes) {
    const key = note.topicId ?? '__none__';
    if (!map.has(key)) {
      map.set(key, {
        key,
        topicId: note.topicId,
        topicName: note.topic?.name ?? 'No Topic',
        notes: [],
      });
    }
    map.get(key)!.notes.push(note);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.key === '__none__') return 1;
    if (b.key === '__none__') return -1;
    return a.topicName.localeCompare(b.topicName);
  });
}

// ── Skeleton ─────────────────────────────────────────────

function NoteCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: '14px 16px', marginBottom: 8 }}>
      <Skeleton active paragraph={{ rows: 2 }} title={{ width: '60%' }} />
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────

interface NoteCardProps {
  note: Note;
  onDeleted: (id: string) => void;
}

function NoteCard({ note, onDeleted }: NoteCardProps) {
  const navigate = useNavigate();
  const due = isDueToday(note);

  async function handleDelete(e?: React.MouseEvent) {
    e?.stopPropagation();
    try {
      await notesApi.remove(note.id);
      onDeleted(note.id);
      message.success('Note deleted');
    } catch {
      message.error('Failed to delete');
    }
  }

  const LEVEL_W = ['10%', '30%', '50%', '70%', '100%'];

  return (
    <div
      className="note-card"
      onClick={() => navigate(`/notes/${note.id}`)}
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${due ? '#ffa940' : '#f0f0f0'}`,
        borderLeft: `3px solid ${due ? '#fa8c16' : '#e8e8e8'}`,
        padding: '14px 16px',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = due ? '#ffa940' : '#d9d9d9';
        const actions = e.currentTarget.querySelector<HTMLElement>('.nc-actions');
        if (actions) actions.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = due ? '#ffa940' : '#f0f0f0';
        const actions = e.currentTarget.querySelector<HTMLElement>('.nc-actions');
        if (actions) actions.style.opacity = '0';
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 14, display: 'block' }}>{note.title}</Text>
          {note.topic && (
            <Tag style={{ marginTop: 4, fontSize: 11 }}>{note.topic.name}</Tag>
          )}
          {due && (
            <Tag color="orange" icon={<FireOutlined />} style={{ marginTop: 4, fontSize: 11 }}>
              Due today
            </Tag>
          )}
        </div>

        {/* Hover actions */}
        <div
          className="nc-actions"
          style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="small" type="text" icon={<EyeOutlined />}
            onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note.id}`); }}
          />
          <Button
            size="small" type="text" icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note.id}/edit`); }}
          />
          <Popconfirm
            title="Delete this note?"
            okText="Delete" okType="danger" cancelText="Cancel"
            onConfirm={(e) => handleDelete(e as React.MouseEvent)}
          >
            <Button
              size="small" type="text" danger icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      </div>

      {/* Review info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Next review</Text>
          <Text style={{ fontSize: 12, display: 'block', color: due ? '#fa8c16' : '#555' }}>
            {formatNextReview(note.nextReviewAt)}
          </Text>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Level {note.reviewLevel}</Text>
          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginTop: 3 }}>
            <div style={{
              height: '100%',
              borderRadius: 2,
              background: due ? '#fa8c16' : '#1d1d1d',
              width: LEVEL_W[note.reviewLevel] ?? '100%',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Topic Section ─────────────────────────────────────────

interface TopicSectionProps {
  group: TopicGroup;
  expanded: boolean;
  onToggle: () => void;
  onDeleted: (id: string) => void;
}

function TopicSection({ group, expanded, onToggle, onDeleted }: TopicSectionProps) {
  const dueCount = group.notes.filter(isDueToday).length;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 4px', cursor: 'pointer',
          borderBottom: '1px solid #f0f0f0', marginBottom: 8,
          userSelect: 'none',
        }}
      >
        {expanded
          ? <CaretDownOutlined style={{ fontSize: 11, color: '#999' }} />
          : <CaretRightOutlined style={{ fontSize: 11, color: '#999' }} />
        }
        <Text strong style={{ fontSize: 13 }}>{group.topicName}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>({group.notes.length})</Text>
        {dueCount > 0 && (
          <Tag color="orange" icon={<FireOutlined />} style={{ fontSize: 11, margin: 0 }}>
            {dueCount} due
          </Tag>
        )}
      </div>

      {/* Notes */}
      {expanded && group.notes.map((note) => (
        <NoteCard key={note.id} note={note} onDeleted={onDeleted} />
      ))}
    </div>
  );
}

// ── Topic Management Row ──────────────────────────────────

interface TopicRowProps {
  topic: Topic;
  noteCount: number;
  onRenamed: (id: string, name: string) => void;
  onDeleted: (id: string) => void;
}

function TopicRow({ topic, noteCount, onRenamed, onDeleted }: TopicRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(topic.name);
  const inputRef = useRef<InputRef>(null);

  function startRename() {
    setRenameVal(topic.name);
    setRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function commitRename() {
    const trimmed = renameVal.trim();
    if (!trimmed || trimmed === topic.name) {
      setRenaming(false);
      return;
    }
    try {
      await topicsApi.rename(topic.id, trimmed);
      onRenamed(topic.id, trimmed);
      message.success('Topic renamed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to rename';
      message.error(msg);
    } finally {
      setRenaming(false);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenaming(false);
  }

  function confirmDelete() {
    let mode: 'move' | 'delete' = 'move';
    Modal.confirm({
      title: `Delete topic "${topic.name}"`,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
            This topic has {noteCount} note{noteCount !== 1 ? 's' : ''}. What should happen to them?
          </Text>
          <Radio.Group
            defaultValue="move"
            onChange={(e) => { mode = e.target.value; }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Radio value="move">Move notes to "No Topic"</Radio>
            <Radio value="delete">
              <Text type="danger">Delete all notes in this topic</Text>
            </Radio>
          </Radio.Group>
        </div>
      ),
      okText: 'Delete Topic',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await topicsApi.remove(topic.id, mode);
          onDeleted(topic.id);
          message.success('Topic deleted');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to delete topic';
          message.error(msg);
        }
      },
    });
  }

  const menuItems = [
    { key: 'rename', label: 'Rename', icon: <EditOutlined /> },
    { key: 'delete', label: <Text type="danger">Delete</Text>, icon: <DeleteOutlined style={{ color: '#ff4d4f' }} /> },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid #f0f0f0',
      background: '#fff',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d9d9d9')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f0f0f0')}
    >
      <TagsOutlined style={{ color: '#aaa', fontSize: 13 }} />

      {renaming ? (
        <Input
          ref={inputRef}
          size="small"
          value={renameVal}
          onChange={(e) => setRenameVal(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
          style={{ flex: 1, fontSize: 13, height: 24 }}
        />
      ) : (
        <Text style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{topic.name}</Text>
      )}

      <Text type="secondary" style={{ fontSize: 12 }}>
        {noteCount} note{noteCount !== 1 ? 's' : ''}
      </Text>

      <Dropdown
        menu={{
          items: menuItems,
          onClick: ({ key }) => {
            if (key === 'rename') startRename();
            if (key === 'delete') confirmDelete();
          },
        }}
        trigger={['click']}
      >
        <Button
          size="small"
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => e.stopPropagation()}
          style={{ color: '#aaa' }}
        />
      </Dropdown>
    </div>
  );
}

// ── Topics Panel ──────────────────────────────────────────

interface TopicsPanelProps {
  topics: Topic[];
  noteCounts: Map<string, number>;
  onTopicRenamed: (id: string, name: string) => void;
  onTopicDeleted: (id: string) => void;
}

function TopicsPanel({ topics, noteCounts, onTopicRenamed, onTopicDeleted }: TopicsPanelProps) {
  const [open, setOpen] = useState(false);

  if (topics.length === 0) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          cursor: 'pointer', userSelect: 'none',
          marginBottom: open ? 10 : 0,
        }}
      >
        {open
          ? <CaretDownOutlined style={{ fontSize: 11, color: '#999' }} />
          : <CaretRightOutlined style={{ fontSize: 11, color: '#999' }} />
        }
        <Text style={{
          fontSize: 11, fontWeight: 600, color: '#999',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Manage Topics ({topics.length})
        </Text>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topics.map((t) => (
            <TopicRow
              key={t.id}
              topic={t}
              noteCount={noteCounts.get(t.id) ?? 0}
              onRenamed={onTopicRenamed}
              onDeleted={onTopicDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────

export default function NotesList() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load ──────────────────────────────────────

  const loadNotes = useCallback(async (
    opts: { search?: string; topicId?: string; reset?: boolean } = {},
  ) => {
    const { search: s, topicId: t, reset = true } = opts;
    if (reset) setLoading(true);
    try {
      const res = await notesApi.getAll({ limit: 20, search: s, topicId: t });
      setNotes(res.data);
      setNextCursor(res.nextCursor);

      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const dueKeys = new Set(
        res.data
          .filter((n) => new Date(n.nextReviewAt) <= todayEnd)
          .map((n) => n.topicId ?? '__none__'),
      );
      setExpanded(dueKeys.size > 0 ? dueKeys : new Set(
        res.data.map((n) => n.topicId ?? '__none__'),
      ));
    } finally {
      if (reset) setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      topicsApi.getAll(),
      notesApi.getToday(),
    ]).then(([t, today]) => {
      setTopics(t);
      setDueCount(today.count);
    });
    loadNotes();
  }, [loadNotes]);

  // ── Infinite scroll ───────────────────────────────────

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await notesApi.getAll({
        limit: 20, cursor: nextCursor, search, topicId: topicFilter,
      });
      setNotes((prev) => [...prev, ...res.data]);
      setNextCursor(res.nextCursor);

      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      res.data.forEach((n) => {
        if (new Date(n.nextReviewAt) <= todayEnd) {
          setExpanded((prev) => new Set([...prev, n.topicId ?? '__none__']));
        }
      });
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, search, topicFilter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Search debounce ───────────────────────────────────

  function handleSearch(val: string) {
    setSearch(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      loadNotes({ search: val, topicId: topicFilter });
    }, 350);
  }

  function handleTopicFilter(val: string | undefined) {
    setTopicFilter(val);
    loadNotes({ search, topicId: val });
  }

  // ── Topic management callbacks ────────────────────────

  function handleTopicRenamed(id: string, name: string) {
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, name } : t));
    // Update names in note groups
    setNotes((prev) => prev.map((n) =>
      n.topicId === id && n.topic ? { ...n, topic: { ...n.topic, name } } : n,
    ));
  }

  function handleTopicDeleted(id: string) {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    // Remove from filter if active
    if (topicFilter === id) {
      setTopicFilter(undefined);
      loadNotes({ search });
    } else {
      // Reload to reflect note reassignments
      loadNotes({ search, topicId: topicFilter });
    }
  }

  // ── Delete note ───────────────────────────────────────

  function handleDeleted(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  // ── Note counts per topic ─────────────────────────────

  const noteCounts = new Map<string, number>();
  for (const note of notes) {
    if (note.topicId) {
      noteCounts.set(note.topicId, (noteCounts.get(note.topicId) ?? 0) + 1);
    }
  }

  // ── Derived ───────────────────────────────────────────

  const groups = buildGroups(notes);

  // ── Render ────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text strong style={{ fontSize: 22 }}>Notes</Text>
        </div>
        <Button type="primary" onClick={() => navigate('/add')}>+ Add Note</Button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Search
          placeholder="Search title or idea..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Select
          placeholder="All topics"
          allowClear
          style={{ width: 180 }}
          value={topicFilter}
          options={topics.map((t) => ({ value: t.id, label: t.name }))}
          onChange={handleTopicFilter}
        />
      </div>

      {/* Topic management panel */}
      {!loading && topics.length > 0 && (
        <TopicsPanel
          topics={topics}
          noteCounts={noteCounts}
          onTopicRenamed={handleTopicRenamed}
          onTopicDeleted={handleTopicDeleted}
        />
      )}

      {/* Today Review Block */}
      {dueCount > 0 && !search && !topicFilter && (
        <div style={{
          background: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#d46b08' }}>
              <FireOutlined /> {dueCount} note{dueCount !== 1 ? 's' : ''} to review today
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Keep your streak — review now
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/review')}
            style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Review Now →
          </Button>
        </div>
      )}

      {/* Notes grouped by topic */}
      {loading ? (
        <div>
          {[1, 2, 3, 4].map((i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <Empty
          description={search || topicFilter ? 'No notes match your filters' : 'No notes yet'}
        >
          {!search && !topicFilter && (
            <Button type="primary" onClick={() => navigate('/add')}>
              Create your first note
            </Button>
          )}
        </Empty>
      ) : (
        <>
          <div>
            <Text style={{
              fontSize: 11, fontWeight: 600, color: '#999',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              All Notes
            </Text>
            <div style={{ marginTop: 12 }}>
              {groups.map((group) => (
                <TopicSection
                  key={group.key}
                  group={group}
                  expanded={expanded.has(group.key)}
                  onToggle={() => setExpanded((prev) => {
                    const next = new Set(prev);
                    next.has(group.key) ? next.delete(group.key) : next.add(group.key);
                    return next;
                  })}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {loadingMore && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2].map((i) => <NoteCardSkeleton key={i} />)}
            </div>
          )}

          {!nextCursor && notes.length > 0 && (
            <Text type="secondary" style={{ textAlign: 'center', fontSize: 12, paddingBottom: 8 }}>
              All {notes.length} notes loaded
            </Text>
          )}
        </>
      )}
    </div>
  );
}

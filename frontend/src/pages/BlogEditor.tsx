import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Input, Select, Typography, Tag, Spin, Switch, Tooltip, message, Grid } from 'antd';
import { ArrowLeftOutlined, FullscreenOutlined, FullscreenExitOutlined, LinkOutlined, GlobalOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { blogsApi } from '../api/blogs';
import { topicsApi } from '../api/topics';
import { Topic } from '../types';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const EDITOR_FONT_SIZE = 14;
const EDITOR_LINE_HEIGHT = 1.75;
const EDITOR_PADDING = 20;
const EDITOR_FONT = "'JetBrains Mono', 'Fira Code', monospace";

type SaveStatus = 'saved' | 'unsaved' | 'saving';

interface LocationState {
  title?: string;
  content?: string;
  topicId?: string;
}

function autoFormat(text: string): string {
  return text.replace(/^(#{1,6})\s*(.*)/gm, (_, hashes, rest) => {
    if (!rest.trim()) return `${hashes} `;
    return `${hashes} ${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
  });
}

function getCaretLine(value: string, selStart: number): number {
  return value.substring(0, selStart).split('\n').length - 1;
}

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const isNew = !id;
  const fromNote = location.state as LocationState | null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState<string | undefined>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(isNew ? 'unsaved' : 'saved');
  const [focusMode, setFocusMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(!isNew);
  const [currentLine, setCurrentLine] = useState(0);

  const blogIdRef = useRef<string | null>(id ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ── Load ─────────────────────────────────────────────

  useEffect(() => {
    topicsApi.getAll().then(setTopics).catch(() => {});

    if (isNew) {
      if (fromNote) {
        setTitle(fromNote.title ?? '');
        setContent(fromNote.content ?? '');
        setTopicId(fromNote.topicId ?? undefined);
      }
      setSaveStatus('unsaved');
      setLoading(false);
      return;
    }

    blogsApi.getById(id!)
      .then((b) => {
        setTitle(b.title);
        setContent(b.content);
        setTopicId(b.topicId ?? undefined);
        setIsPublic(b.isPublic);
        setSlug(b.slug);
        setSaveStatus('saved');
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // ── Save ─────────────────────────────────────────────

  const save = useCallback(async (t: string, c: string, tid: string | undefined, pub?: boolean) => {
    if (!t.trim()) return;
    setSaveStatus('saving');
    try {
      if (blogIdRef.current) {
        const updated = await blogsApi.update(blogIdRef.current, {
          title: t, content: c, topicId: tid,
          ...(pub !== undefined ? { isPublic: pub } : {}),
        });
        setSlug(updated.slug);
        setIsPublic(updated.isPublic);
      } else {
        const created = await blogsApi.create({ title: t, content: c, topicId: tid });
        blogIdRef.current = created.id;
        setSlug(created.slug);
        setIsPublic(created.isPublic);
        window.history.replaceState(null, '', `/blog/${created.id}`);
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
      message.error('Failed to save');
    }
  }, []);

  const scheduleAutoSave = useCallback((t: string, c: string, tid: string | undefined) => {
    setSaveStatus('unsaved');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(t, c, tid), 3000);
  }, [save]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const formatted = autoFormat(content);
        setContent(formatted);
        save(title, formatted, topicId);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [title, content, topicId, save]);

  // ── Scroll sync ──────────────────────────────────────

  function syncScroll() {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  // ── Handlers ─────────────────────────────────────────

  function handleTitleChange(val: string) {
    setTitle(val);
    scheduleAutoSave(val, content, topicId);
  }

  function handleContentChange(val: string) {
    setContent(val);
    const ta = textareaRef.current;
    if (ta) setCurrentLine(getCaretLine(val, ta.selectionStart));
    scheduleAutoSave(title, val, topicId);
  }

  function handleBlur() {
    const formatted = autoFormat(content);
    if (formatted !== content) {
      setContent(formatted);
      scheduleAutoSave(title, formatted, topicId);
    }
  }

  function handleCaretMove() {
    const ta = textareaRef.current;
    if (ta) setCurrentLine(getCaretLine(ta.value, ta.selectionStart));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return;
    const ta = e.currentTarget;
    const { selectionStart, selectionEnd, value } = ta;
    if (selectionStart !== selectionEnd) return;

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineText = value.substring(lineStart, selectionStart);
    const listMatch = lineText.match(/^(\s*)-\s+(.*)/);
    if (!listMatch) return;

    e.preventDefault();
    const [, indent, itemContent] = listMatch;
    let newValue: string;
    let newCursor: number;

    if (!itemContent.trim()) {
      newValue = value.substring(0, lineStart) + value.substring(selectionStart);
      newCursor = lineStart;
    } else {
      const insertion = `\n${indent}- `;
      newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionStart);
      newCursor = selectionStart + insertion.length;
    }

    setContent(newValue);
    scheduleAutoSave(title, newValue, topicId);
    requestAnimationFrame(() => {
      ta.setSelectionRange(newCursor, newCursor);
      setCurrentLine(getCaretLine(newValue, newCursor));
    });
  }

  async function handlePublicToggle(checked: boolean) {
    setIsPublic(checked);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await save(title, content, topicId, checked);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)
      .then(() => message.success('Link copied!'));
  }

  // ── Derived ──────────────────────────────────────────

  const lineHeightPx = EDITOR_FONT_SIZE * EDITOR_LINE_HEIGHT;
  const lines = content.split('\n');
  const statusBadge = {
    saved:   { color: 'success',  text: 'Saved' },
    saving:  { color: 'warning',  text: 'Saving…' },
    unsaved: { color: 'default',  text: 'Unsaved' },
  }[saveStatus];

  // Responsive offset: undo the Content padding so editor fills the viewport
  const contentPadH = isMobile ? 16 : 24;
  const contentPadTop = isMobile ? 20 : 40;
  // Header 52px + bottom nav on mobile 60px
  const reservedHeight = isMobile ? 52 + 60 : 52;

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: `calc(100vh - ${reservedHeight}px)`,
      margin: `-${contentPadTop}px -${contentPadH}px`,
    }}>
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        flexShrink: 0,
        flexWrap: 'wrap',
        minHeight: 48,
      }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')} style={{ color: '#999', flexShrink: 0 }} />

        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title..."
          variant="borderless"
          style={{ flex: 1, minWidth: 80, fontSize: 15, fontWeight: 600, padding: '0 4px' }}
        />

        <Tag color={statusBadge.color as 'success' | 'warning' | 'default'} style={{ flexShrink: 0 }}>
          {statusBadge.text}
        </Tag>

        {!isMobile && (
          <Select
            placeholder="Topic"
            allowClear
            value={topicId}
            onChange={(v) => { setTopicId(v); scheduleAutoSave(title, content, v); }}
            options={topics.map((t) => ({ value: t.id, label: t.name }))}
            style={{ width: 130 }}
            size="small"
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <GlobalOutlined style={{ color: isPublic ? '#52c41a' : '#ccc', fontSize: 13 }} />
          <Tooltip title={isPublic ? 'Public' : 'Private'}>
            <Switch size="small" checked={isPublic} onChange={handlePublicToggle} />
          </Tooltip>
        </div>

        {isPublic && slug && (
          <Tooltip title={`${window.location.origin}/p/${slug}`}>
            <Button size="small" icon={<LinkOutlined />} onClick={handleCopyLink} style={{ flexShrink: 0 }}>
              {!isMobile && 'Copy Link'}
            </Button>
          </Tooltip>
        )}

        {/* Desktop: focus mode toggle */}
        {!isMobile && (
          <Tooltip title={focusMode ? 'Show preview' : 'Focus mode'}>
            <Button
              type="text"
              icon={focusMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setFocusMode((f) => !f)}
              style={{ color: '#999' }}
            />
          </Tooltip>
        )}

        {/* Mobile: write / preview tab */}
        {isMobile && (
          <Button
            type="text"
            icon={mobileTab === 'write' ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => setMobileTab((t) => t === 'write' ? 'preview' : 'write')}
            style={{ color: '#999', flexShrink: 0 }}
          />
        )}
      </div>

      {/* ── Editor + Preview ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Editor pane — hidden on mobile when previewing */}
        {(!isMobile || mobileTab === 'write') && (
          <div style={{
            flex: (!isMobile && !focusMode) ? '0 0 50%' : 1,
            borderRight: (!isMobile && !focusMode) ? '1px solid #f0f0f0' : 'none',
            position: 'relative',
            background: '#fff',
            overflow: 'hidden',
          }}>
            {/* Line highlight backdrop */}
            <div
              ref={backdropRef}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                padding: EDITOR_PADDING,
                overflow: 'hidden',
                pointerEvents: 'none',
                fontFamily: EDITOR_FONT,
                fontSize: EDITOR_FONT_SIZE,
                lineHeight: EDITOR_LINE_HEIGHT,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {lines.map((_, i) => (
                <div
                  key={i}
                  style={{
                    minHeight: lineHeightPx,
                    borderRadius: 3,
                    background: i === currentLine ? 'rgba(0,0,0,0.04)' : 'transparent',
                    marginLeft: -4,
                    marginRight: -4,
                    paddingLeft: 4,
                    paddingRight: 4,
                  }}
                >
                  {'\u00a0'}
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={handleCaretMove}
              onKeyUp={handleCaretMove}
              onScroll={syncScroll}
              placeholder={`Write in markdown...\n\n## Heading\n\n- list item`}
              autoFocus={isNew}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: EDITOR_PADDING,
                fontSize: EDITOR_FONT_SIZE,
                fontFamily: EDITOR_FONT,
                lineHeight: EDITOR_LINE_HEIGHT,
                color: '#333',
                background: 'transparent',
                caretColor: '#1d1d1d',
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(!isMobile && !focusMode) || (isMobile && mobileTab === 'preview') ? (
          <div style={{
            flex: isMobile ? 1 : '0 0 50%',
            overflow: 'auto',
            padding: isMobile ? '16px' : '24px 32px',
            background: '#fafafa',
          }}>
            {content.trim() ? (
              <div className="md-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code style={{
                          background: '#f0f0f0',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: '0.88em',
                          fontFamily: EDITOR_FONT,
                        }}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 14 }}>Preview will appear here...</Text>
            )}
          </div>
        ) : null}
      </div>

      <style>{`
        .md-preview { font-size: 16px; line-height: 1.7; color: #1d1d1d; }
        .md-preview h1 { font-size: 1.8em; font-weight: 700; margin: 1.5em 0 0.5em; color: #111; }
        .md-preview h2 { font-size: 1.35em; font-weight: 600; margin: 1.5em 0 0.4em; color: #111; }
        .md-preview h3 { font-size: 1.1em; font-weight: 600; margin: 1.2em 0 0.4em; color: #111; }
        .md-preview p { margin-bottom: 1em; }
        .md-preview ul, .md-preview ol { padding-left: 1.6em; margin-bottom: 1em; }
        .md-preview li { margin-bottom: 0.3em; }
        .md-preview pre { background: #f5f5f5 !important; padding: 12px 16px !important; border-radius: 8px !important; overflow: auto; margin-bottom: 1em; }
        .md-preview blockquote { border-left: 3px solid #d9d9d9; margin: 0 0 1em; padding: 4px 0 4px 1em; color: #666; }
        .md-preview table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .md-preview th, .md-preview td { border: 1px solid #e8e8e8; padding: 7px 12px; }
        .md-preview th { background: #fafafa; font-weight: 600; }
        .md-preview a { color: #1d1d1d; text-decoration: underline; }
        .md-preview hr { border: none; border-top: 1px solid #f0f0f0; margin: 1.5em 0; }
        .md-preview img { max-width: 100%; border-radius: 6px; }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Tag, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { blogsApi } from '../api/blogs';
import { Blog } from '../types';

const { Title, Text } = Typography;

const EDITOR_FONT = "'JetBrains Mono', 'Fira Code', monospace";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function PublicBlog() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    blogsApi.getBySlug(slug)
      .then(setBlog)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spin />
    </div>
  );

  if (notFound || !blog) return (
    <div style={{ maxWidth: 680, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <Title level={3} style={{ color: '#999' }}>404</Title>
      <Text type="secondary">This post is not available or has been made private.</Text>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Title level={1} style={{ margin: '0 0 12px', lineHeight: 1.3 }}>
          {blog.title}
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#999' }}>
          {blog.topic && <Tag>{blog.topic.name}</Tag>}
          <Text type="secondary" style={{ fontSize: 13 }}>{formatDate(blog.updatedAt)}</Text>
        </div>
      </div>

      {/* Content */}
      {blog.content.trim() ? (
        <div className="public-md">
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
            {blog.content}
          </ReactMarkdown>
        </div>
      ) : (
        <Text type="secondary">No content yet.</Text>
      )}

      {/* Footer */}
      <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Written with{' '}
          <a href="/" style={{ color: '#1d1d1d' }}>ThinkBack</a>
        </Text>
      </div>

      <style>{`
        .public-md {
          font-size: 17px;
          line-height: 1.75;
          color: #1d1d1d;
        }
        .public-md h1 { font-size: 1.8em; font-weight: 700; margin: 1.5em 0 0.5em; }
        .public-md h2 { font-size: 1.35em; font-weight: 600; margin: 1.5em 0 0.4em; }
        .public-md h3 { font-size: 1.1em; font-weight: 600; margin: 1.2em 0 0.4em; }
        .public-md p { margin-bottom: 1.1em; }
        .public-md ul, .public-md ol { padding-left: 1.6em; margin-bottom: 1.1em; }
        .public-md li { margin-bottom: 0.4em; }
        .public-md pre {
          background: #f5f5f5 !important;
          padding: 14px 18px !important;
          border-radius: 8px !important;
          overflow: auto;
          margin-bottom: 1.2em;
        }
        .public-md blockquote {
          border-left: 3px solid #d9d9d9;
          margin: 0 0 1em;
          padding: 6px 0 6px 1.2em;
          color: #666;
        }
        .public-md table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .public-md th, .public-md td { border: 1px solid #e8e8e8; padding: 8px 14px; }
        .public-md th { background: #fafafa; font-weight: 600; }
        .public-md a { color: #1d1d1d; text-decoration: underline; }
        .public-md hr { border: none; border-top: 1px solid #f0f0f0; margin: 2em 0; }
        .public-md img { max-width: 100%; border-radius: 8px; }
      `}</style>
    </div>
  );
}

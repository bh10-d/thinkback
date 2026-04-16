import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Typography, Tag, Spin, Empty, Popconfirm, message } from 'antd';
import { RightOutlined, DeleteOutlined } from '@ant-design/icons';
import { blogsApi } from '../api/blogs';
import { Blog } from '../types';

const { Text } = Typography;
const { Search } = Input;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function excerpt(content: string, len = 100) {
  const plain = content.replace(/#+\s/g, '').replace(/[*`_]/g, '');
  return plain.length > len ? plain.slice(0, len) + '…' : plain;
}

export default function BlogsList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogsApi.getAll().then(setBlogs).finally(() => setLoading(false));
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await blogsApi.remove(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      message.success('Post deleted');
    } catch {
      message.error('Failed to delete post');
    }
  }

  const filtered = blogs.filter(
    (b) => !search || b.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text strong style={{ fontSize: 22 }}>Blog</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>{blogs.length} post{blogs.length !== 1 ? 's' : ''}</Text>
        </div>
        <Button type="primary" onClick={() => navigate('/blog/new')}>+ New Post</Button>
      </div>

      <Search
        placeholder="Search posts..."
        onChange={(e) => setSearch(e.target.value)}
        allowClear
      />

      {filtered.length === 0 ? (
        <Empty description={blogs.length === 0 ? 'No posts yet' : 'No posts match your search'}>
          {blogs.length === 0 && (
            <Button type="primary" onClick={() => navigate('/blog/new')}>
              Write your first post
            </Button>
          )}
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((blog) => (
            <div
              key={blog.id}
              onClick={() => navigate(`/blog/${blog.id}`)}
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
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ fontSize: 14 }}>{blog.title}</Text>
                  {blog.topic && <Tag style={{ margin: 0 }}>{blog.topic.name}</Tag>}
                </div>
                {blog.content && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                    {excerpt(blog.content)}
                  </Text>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(blog.updatedAt)}</Text>
                <Popconfirm
                  title="Delete this post?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={(e) => handleDelete(e as React.MouseEvent, blog.id)}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
                <RightOutlined style={{ color: '#ccc', fontSize: 12 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

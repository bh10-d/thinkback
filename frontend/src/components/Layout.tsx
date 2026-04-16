import { Layout, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, ReadOutlined, PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const NAV_ITEMS = [
  { key: '/',      label: 'Home',  icon: <HomeOutlined /> },
  { key: '/notes', label: 'Notes', icon: <FileTextOutlined /> },
  { key: '/blog',  label: 'Blog',  icon: <ReadOutlined /> },
  { key: '/add',   label: 'Add',   icon: <PlusOutlined /> },
];

function activeKey(pathname: string): string {
  return NAV_ITEMS.map((i) => i.key)
    .filter((k) => k !== '/')
    .find((k) => pathname.startsWith(k)) ?? '/';
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const selected = activeKey(pathname);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ── Top header ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 32,
      }}>
        <span
          onClick={() => navigate('/')}
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ThinkBack
        </span>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = selected === item.key;
              return (
                <span
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#1d1d1d' : '#888',
                    background: isActive ? '#f0f0f0' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f7f7f7'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </span>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── Page content ── */}
      <Content style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: isMobile ? '20px 16px 88px' : '40px 24px',
        width: '100%',
      }}>
        {children}
      </Content>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          zIndex: 200,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = selected === item.key;
            return (
              <span
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  cursor: 'pointer',
                  color: isActive ? '#1d1d1d' : '#bbb',
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 0.15s',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 19, lineHeight: 1 }}>{item.icon}</span>
                {item.label}
              </span>
            );
          })}
        </nav>
      )}
    </Layout>
  );
}

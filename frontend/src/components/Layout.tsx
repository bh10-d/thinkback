import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: '/', label: 'Dashboard' },
  { key: '/notes', label: 'Notes' },
  { key: '/blog', label: 'Blog' },
  { key: '/add', label: '+ Add Note' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Highlight the correct nav item for nested routes
  const selectedKey = NAV_ITEMS.map((i) => i.key)
    .filter((k) => k !== '/')
    .find((k) => pathname.startsWith(k)) ?? '/';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Text strong style={{ fontSize: 16, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
          ThinkBack
        </Text>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        {children}
      </Content>
    </Layout>
  );
}

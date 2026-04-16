import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import AppLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Review from './pages/Review';
import AddNote from './pages/AddNote';
import NotesList from './pages/NotesList';
import NoteDetail from './pages/NoteDetail';
import EditNote from './pages/EditNote';
import BlogsList from './pages/BlogsList';
import BlogEditor from './pages/BlogEditor';
import PublicBlog from './pages/PublicBlog';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1d1d1d',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            {/* Public read-only — no app shell */}
            <Route path="/p/:slug" element={<PublicBlog />} />

            {/* App shell routes */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/review" element={<Review />} />
                  <Route path="/add" element={<AddNote />} />
                  <Route path="/notes" element={<NotesList />} />
                  <Route path="/notes/:id" element={<NoteDetail />} />
                  <Route path="/notes/:id/edit" element={<EditNote />} />
                  <Route path="/blog" element={<BlogsList />} />
                  <Route path="/blog/new" element={<BlogEditor />} />
                  <Route path="/blog/:id" element={<BlogEditor />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Button, Select, Card, Typography,
  Space, Alert, Divider, message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { topicsApi } from '../api/topics';
import { Topic } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AddNote() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Inline topic creation state
  const [newTopicName, setNewTopicName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const newTopicInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    topicsApi.getAll().then(setTopics).catch(() => {});
  }, []);

  async function handleAddTopic() {
    const name = newTopicName.trim();
    if (!name) return;
    setCreatingTopic(true);
    try {
      const created = await topicsApi.create(name);
      setTopics((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      form.setFieldValue('topicId', created.id);
      setNewTopicName('');
      message.success(`Topic "${created.name}" created`);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to create topic');
    } finally {
      setCreatingTopic(false);
    }
  }

  async function handleSubmit(values: {
    title: string;
    questions: string[];
    coreIdea: string;
    mistake: string;
    example: string;
    topicId?: string;
  }) {
    setError('');
    const filled = (values.questions || []).filter((q) => q?.trim());
    if (!filled.length) { setError('Add at least one question.'); return; }
    setSubmitting(true);
    try {
      await notesApi.create({ ...values, questions: filled });
      navigate('/notes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save note.');
    } finally {
      setSubmitting(false);
    }
  }

  const topicDropdownRender = (menu: React.ReactNode) => (
    <>
      {topics.length === 0 && (
        <div style={{ padding: '8px 12px', color: '#999', fontSize: 13 }}>
          No topics yet — create one below
        </div>
      )}
      {menu}
      <Divider style={{ margin: '6px 0' }} />
      <div style={{ display: 'flex', gap: 8, padding: '4px 8px 8px' }}>
        <input
          ref={newTopicInputRef}
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(); } }}
          placeholder="New topic name..."
          style={{
            flex: 1,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTopic}
          loading={creatingTopic}
          disabled={!newTopicName.trim()}
        >
          Add
        </Button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>Add Note</Title>
        <Text type="secondary">Create a recall-driven learning card</Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ questions: [''] }}
        >
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Closure in JavaScript" size="large" />
          </Form.Item>

          <Form.Item label="Topic" name="topicId">
            <Select
              placeholder={topics.length === 0 ? 'No topics yet — create one below' : 'Select or create a topic'}
              allowClear
              showSearch
              filterOption={(input, opt) =>
                (opt?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={topics.map((t) => ({ value: t.id, label: t.name }))}
              dropdownRender={topicDropdownRender}
              onDropdownVisibleChange={(open) => {
                if (open) setTimeout(() => newTopicInputRef.current?.focus(), 100);
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Recall Questions{' '}
                <span style={{ color: '#faad14' }}>⭐</span>
              </span>
            }
            required
          >
            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {fields.map((field, idx) => (
                    <div key={field.key} style={{ display: 'flex', gap: 8 }}>
                      <Form.Item {...field} style={{ flex: 1, margin: 0 }}>
                        <Input placeholder={`Question ${idx + 1}`} />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    Add question
                  </Button>
                </Space>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            label="Core Idea (1–3 lines)"
            name="coreIdea"
            rules={[{ required: true, message: 'Required' }]}
          >
            <TextArea rows={3} placeholder="The essence of what you need to remember" />
          </Form.Item>

          <Form.Item
            label="Common Mistake"
            name="mistake"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="What do people get wrong about this?" />
          </Form.Item>

          <Form.Item
            label="Example"
            name="example"
            rules={[{ required: true, message: 'Required' }]}
          >
            <TextArea
              rows={5}
              placeholder="Code snippet or concrete example"
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </Form.Item>

          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" htmlType="submit" loading={submitting} size="large">
              Save Note
            </Button>
            <Button onClick={() => navigate(-1)} size="large">
              Cancel
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

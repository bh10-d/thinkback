import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Typography, Input, Progress, Alert, Spin, Space, Tag } from 'antd';
import { CheckCircleOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { notesApi } from '../api/notes';
import { reviewApi } from '../api/review';
import { Note, ReviewResult } from '../types';
import { evaluate } from '../utils/matcher';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type Phase = 'question' | 'evaluated' | 'revealed';

const RESULT_CONFIG = {
  remembered: { label: 'Remembered', color: '#52c41a', icon: <CheckCircleOutlined />, emoji: '😎' },
  partially:  { label: 'Partially',  color: '#faad14', icon: <QuestionCircleOutlined />, emoji: '🤔' },
  forgot:     { label: 'Forgot',     color: '#ff4d4f', icon: <CloseCircleOutlined />, emoji: '❌' },
};

export default function Review() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topicId') ?? undefined;

  const [notes, setNotes] = useState<Note[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [score, setScore] = useState(0);
  const [suggestion, setSuggestion] = useState<ReviewResult>('forgot');
  const [chosenResult, setChosenResult] = useState<ReviewResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [topicName, setTopicName] = useState<string | undefined>();

  useEffect(() => {
    notesApi.getToday(topicId).then((d) => {
      setNotes(d.notes);
      if (topicId && d.notes[0]?.topic) setTopicName(d.notes[0].topic.name);
    }).finally(() => setLoading(false));
  }, [topicId]);

  if (loading) return <Spin style={{ display: 'block', marginTop: 80 }} />;

  if (notes.length === 0) {
    return (
      <Card style={{ textAlign: 'center' }}>
        <Paragraph type="secondary">No notes to review{topicName ? ` in "${topicName}"` : ''} today.</Paragraph>
        <Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </Card>
    );
  }

  if (sessionDone) {
    return (
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <Title level={3}>Session complete!</Title>
        <Paragraph type="secondary">
          You reviewed {notes.length} note{notes.length === 1 ? '' : 's'}
          {topicName ? ` in "${topicName}"` : ''}.
        </Paragraph>
        <Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </Card>
    );
  }

  const note = notes[index];
  const progressPct = Math.round((index / notes.length) * 100);

  function handleCheckAnswer() {
    if (answer.trim().length < 5) {
      setAnswerError('Please write at least 5 characters before checking.');
      return;
    }
    setAnswerError('');
    const { result, score: s } = evaluate(answer, note.coreIdea);
    setScore(Math.round(s * 100));
    setSuggestion(result);
    setChosenResult(result);
    setPhase('evaluated');
  }

  async function handleNext() {
    if (!chosenResult) return;
    setSubmitting(true);
    try {
      await reviewApi.submit(note.id, chosenResult);
      if (index + 1 >= notes.length) {
        setSessionDone(true);
      } else {
        setIndex((i) => i + 1);
        setPhase('question');
        setAnswer('');
        setChosenResult(null);
        setScore(0);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{index + 1} / {notes.length}</Text>
        <Space size={4}>
          {topicName && <Tag>{topicName}</Tag>}
          <Tag color={note.reviewLevel === 0 ? 'default' : 'blue'}>Level {note.reviewLevel}</Tag>
        </Space>
      </div>
      <Progress percent={progressPct} showInfo={false} strokeColor="#1d1d1d" size="small" />

      <Card>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>{note.title}</Title>

          <div>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
              Recall Questions
            </Text>
            <ol style={{ marginTop: 8, paddingLeft: 20 }}>
              {note.questions.map((q, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#333' }}>{q}</li>
              ))}
            </ol>
          </div>

          {/* Phase: question */}
          {phase === 'question' && (
            <div>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                Your Answer
              </Text>
              <TextArea
                style={{ marginTop: 8, fontFamily: 'inherit', resize: 'none' }}
                rows={4}
                placeholder="Type your answer before checking... (min 5 characters)"
                value={answer}
                onChange={(e) => { setAnswer(e.target.value); setAnswerError(''); }}
                autoFocus
              />
              {answerError && <Alert type="warning" message={answerError} style={{ marginTop: 8 }} showIcon />}
              <Button type="primary" block size="large" style={{ marginTop: 12 }} onClick={handleCheckAnswer}>
                Check Answer
              </Button>
            </div>
          )}

          {/* Phase: evaluated */}
          {phase === 'evaluated' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Your Answer
                </Text>
                <div style={{ marginTop: 6, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                  {answer}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Match Score
                  </Text>
                  <Progress
                    type="circle"
                    percent={score}
                    size={72}
                    strokeColor={score > 60 ? '#52c41a' : score > 30 ? '#faad14' : '#ff4d4f'}
                    style={{ display: 'block', marginTop: 8 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Suggested
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Tag color={RESULT_CONFIG[suggestion].color} style={{ fontSize: 14, padding: '4px 10px' }}>
                      {RESULT_CONFIG[suggestion].emoji} {RESULT_CONFIG[suggestion].label}
                    </Tag>
                  </div>
                </div>
              </div>

              <div>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Confirm Result
                </Text>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {(['remembered', 'partially', 'forgot'] as ReviewResult[]).map((r) => (
                    <Button
                      key={r}
                      block
                      onClick={() => setChosenResult(r)}
                      style={{
                        borderColor: chosenResult === r ? RESULT_CONFIG[r].color : undefined,
                        color: chosenResult === r ? RESULT_CONFIG[r].color : undefined,
                        fontWeight: chosenResult === r ? 600 : 400,
                        background: chosenResult === r ? `${RESULT_CONFIG[r].color}10` : undefined,
                      }}
                    >
                      {RESULT_CONFIG[r].emoji} {RESULT_CONFIG[r].label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="default" block size="large" onClick={() => setPhase('revealed')} disabled={!chosenResult}>
                Reveal Answer
              </Button>
            </div>
          )}

          {/* Phase: revealed */}
          {phase === 'revealed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Core Idea
                </Text>
                <Paragraph style={{ marginTop: 6, marginBottom: 0, fontSize: 15 }}>{note.coreIdea}</Paragraph>
              </div>

              <div>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#faad14', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Common Mistake
                </Text>
                <div style={{ marginTop: 6, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}>
                  {note.mistake}
                </div>
              </div>

              <div>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Example
                </Text>
                <pre style={{ marginTop: 6, background: '#1d1d1d', color: '#7ec8a0', borderRadius: 8, padding: '12px 16px', fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                  {note.example}
                </pre>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text type="secondary">
                  Rated: <Tag color={RESULT_CONFIG[chosenResult!].color}>
                    {RESULT_CONFIG[chosenResult!].emoji} {RESULT_CONFIG[chosenResult!].label}
                  </Tag>
                </Text>
                <Button type="primary" size="large" onClick={handleNext} loading={submitting}>
                  {index + 1 >= notes.length ? 'Finish' : 'Next →'}
                </Button>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}

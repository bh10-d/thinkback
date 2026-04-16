import { Tooltip, Typography } from 'antd';
import { HeatmapEntry } from '../api/stats';

const { Text } = Typography;

const COLORS = ['#f0f0f0', '#ffd591', '#ffa940', '#fa541c', '#ad2102'];

function getColor(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 2) return COLORS[1];
  if (count <= 5) return COLORS[2];
  if (count <= 9) return COLORS[3];
  return COLORS[4];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

interface Props {
  data: HeatmapEntry[];
}

interface Week {
  days: (HeatmapEntry | null)[];
  monthLabel?: string;
}

function buildWeeks(data: HeatmapEntry[]): Week[] {
  if (data.length === 0) return [];

  // Pad start so first day aligns to its weekday (0=Sun)
  const firstDate = new Date(data[0].date + 'T12:00:00');
  const startPad = firstDate.getDay(); // 0=Sun
  const padded: (HeatmapEntry | null)[] = [
    ...Array(startPad).fill(null),
    ...data,
  ];

  const weeks: Week[] = [];
  let prevMonth = '';

  for (let i = 0; i < padded.length; i += 7) {
    const days = padded.slice(i, i + 7);
    while (days.length < 7) days.push(null);

    // Month label: first real day in the week
    const firstReal = days.find((d) => d !== null);
    let monthLabel: string | undefined;
    if (firstReal) {
      const month = new Date(firstReal.date + 'T12:00:00')
        .toLocaleString('en-US', { month: 'short' });
      if (month !== prevMonth) {
        monthLabel = month;
        prevMonth = month;
      }
    }

    weeks.push({ days, monthLabel });
  }

  return weeks;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL = 13;
const GAP = 2;

export default function Heatmap({ data }: Props) {
  const weeks = buildWeeks(data);

  const totalReviews = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'inline-flex', flexDirection: 'row', gap: 0 }}>
          {/* Day labels column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginTop: 18, marginRight: 4 }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: CELL,
                  fontSize: 9,
                  color: '#bbb',
                  textAlign: 'right',
                  lineHeight: `${CELL}px`,
                  display: i % 2 === 1 ? 'block' : 'block',
                  visibility: i % 2 === 0 ? 'hidden' : 'visible',
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', marginRight: GAP }}>
              {/* Month label */}
              <div style={{ height: 16, fontSize: 9, color: '#999', whiteSpace: 'nowrap', lineHeight: '16px' }}>
                {week.monthLabel ?? ''}
              </div>
              {/* Day cells */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.days.map((day, di) => (
                  <Tooltip
                    key={di}
                    title={day
                      ? `${formatDate(day.date)} — ${day.count} review${day.count !== 1 ? 's' : ''}`
                      : undefined
                    }
                    mouseEnterDelay={0.1}
                  >
                    <div
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        background: day ? getColor(day.count) : 'transparent',
                        cursor: day ? 'default' : 'default',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (day) e.currentTarget.style.transform = 'scale(1.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend + summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {totalReviews} reviews across {activeDays} day{activeDays !== 1 ? 's' : ''}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Text type="secondary" style={{ fontSize: 10, marginRight: 3 }}>Less</Text>
          {COLORS.map((c, i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />
          ))}
          <Text type="secondary" style={{ fontSize: 10, marginLeft: 3 }}>More</Text>
        </div>
      </div>
    </div>
  );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: { quarter: string; progress: number }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="quarter"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [`${value}%`, '진행률']}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="progress"
          stroke="#1E88E5"
          strokeWidth={2}
          dot={{ fill: '#1E88E5', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1E88E5' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

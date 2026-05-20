import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const STAGE_BAR_COLORS = {
  Applied: '#3b82f6',
  Screening: '#eab308',
  Interview: '#a855f7',
  Offer: '#f97316',
  Hired: '#22c55e',
  Rejected: '#ef4444',
}

export default function FunnelChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [value, 'Applications']}
          labelFormatter={(label) => label}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.stage}
              fill={STAGE_BAR_COLORS[entry.stage] || '#6b7280'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

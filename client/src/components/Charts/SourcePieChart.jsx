import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const COLORS = ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444']

export default function SourcePieChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="source"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ source, percentage }) =>
            `${source} (${percentage}%)`
          }
          labelLine
        >
          {data.map((entry, index) => (
            <Cell key={entry.source} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [
            `${value} applications`,
            props.payload.source,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const truncate = (text, max = 15) =>
  text?.length > max ? `${text.slice(0, max)}…` : text

export default function TimeToHireChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    shortTitle: truncate(item.jobTitle),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="shortTitle"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis allowDecimals={false} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value, _name, item) => [
            `${item.payload.jobTitle}: ${value} days avg`,
          ]}
        />
        <Bar dataKey="averageDays" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

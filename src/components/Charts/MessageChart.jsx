// src/components/Charts/MessageChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MessageChart({
  labels,
  sentData,
  responseData,
  reportedData,
}) {
  const chartData = labels.map((label, index) => ({
    date: label,
    sent: sentData[index] || 0,
    responses: responseData[index] || 0,
    reported: reportedData[index] || 0,
  }));

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
        <Line
          type="monotone"
          dataKey="sent"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6" }}
          activeDot={{ r: 6 }}
          name="Sent Messages"
        />
        <Line
          type="monotone"
          dataKey="responses"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 4, fill: "#f97316" }}
          activeDot={{ r: 6 }}
          name="Responses"
        />
        <Line
          type="monotone"
          dataKey="reported"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4, fill: "#ef4444" }}
          activeDot={{ r: 6 }}
          name="Reported"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

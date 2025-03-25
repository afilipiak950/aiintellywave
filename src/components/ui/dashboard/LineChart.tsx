
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKeys: string[];
  colors?: string[];
  title: string;
  subtitle?: string;
}

const LineChart = ({
  data,
  dataKeys,
  colors = ['#3b82f6', '#10b981', '#8b5cf6'],
  title,
  subtitle
}: LineChartProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{
                  stroke: colors[index % colors.length],
                  strokeWidth: 2,
                  r: 4,
                  fill: '#fff',
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;

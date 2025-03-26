
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  colors = ['#4069E5', '#10b981', '#8b5cf6'],
  title,
  subtitle
}: LineChartProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full animate-fade-in transition-all duration-300 hover:shadow-md">
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
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '10px 14px',
              }}
              itemStyle={{ padding: '4px 0' }}
              labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '8px' }}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{
                  stroke: colors[index % colors.length],
                  strokeWidth: 2,
                  r: 4,
                  fill: '#fff',
                }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 0
                }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;

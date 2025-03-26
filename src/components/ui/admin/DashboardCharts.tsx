
import LineChart from '../dashboard/LineChart';

const DashboardCharts = () => {
  // Mock data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 3000 },
    { name: 'Apr', revenue: 7000 },
    { name: 'May', revenue: 5000 },
    { name: 'Jun', revenue: 8000 },
    { name: 'Jul', revenue: 10000 },
    { name: 'Aug', revenue: 12000 },
    { name: 'Sep', revenue: 9000 },
    { name: 'Oct', revenue: 11000 },
    { name: 'Nov', revenue: 14000 },
    { name: 'Dec', revenue: 16000 },
  ];

  const campaignData = [
    { name: 'Jan', campaign1: 2400, campaign2: 1800, campaign3: 3200 },
    { name: 'Feb', campaign1: 1900, campaign2: 2700, campaign3: 2900 },
    { name: 'Mar', campaign1: 3000, campaign2: 2000, campaign3: 2400 },
    { name: 'Apr', campaign1: 2800, campaign2: 2300, campaign3: 3100 },
    { name: 'May', campaign1: 3500, campaign2: 2600, campaign3: 3300 },
    { name: 'Jun', campaign1: 3700, campaign2: 3100, campaign3: 3700 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineChart
        data={revenueData}
        dataKeys={['revenue']}
        colors={['#3b82f6']}
        title="Revenue Overview"
        subtitle="Monthly revenue for the current year"
      />
      <LineChart
        data={campaignData}
        dataKeys={['campaign1', 'campaign2', 'campaign3']}
        title="Campaign Performance"
        subtitle="Performance metrics for top 3 campaigns"
      />
    </div>
  );
};

export default DashboardCharts;


import { ReactNode } from 'react';
import StatCard from '../dashboard/StatCard';

interface KpiSimpleCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  bgColor: string;
  change?: { value: string, isPositive: boolean };
  loading?: boolean;
}

const KpiSimpleCard = ({
  title,
  value,
  icon,
  description,
  bgColor,
  change,
  loading = false
}: KpiSimpleCardProps) => {
  return (
    <StatCard
      title={title}
      value={loading ? "..." : value.toString()}
      icon={icon}
      description={description}
      change={change}
      bgColor={bgColor}
    />
  );
};

export default KpiSimpleCard;

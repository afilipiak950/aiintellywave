
import React from 'react';
import { formatDate } from '@/utils/date-utils';

interface FormattedDateProps {
  date: Date;
}

export const FormattedDate: React.FC<FormattedDateProps> = ({ date }) => {
  return <span>{formatDate(date)}</span>;
};

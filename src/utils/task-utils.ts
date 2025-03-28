
export const statusColors = {
  'pending': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-green-100 text-green-700',
};

export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100';
};

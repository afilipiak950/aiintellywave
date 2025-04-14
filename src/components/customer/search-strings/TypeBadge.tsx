
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchStringType } from '@/hooks/search-strings/search-string-types';

interface TypeBadgeProps {
  type: SearchStringType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  return (
    <Badge variant={type === 'recruiting' ? 'default' : 'secondary'}>
      {type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
    </Badge>
  );
};

export default TypeBadge;

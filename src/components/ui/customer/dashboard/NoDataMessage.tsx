
import React from 'react';

interface NoDataMessageProps {
  message?: string;
  height?: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ 
  message = "No data available", 
  height = "h-64" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${height} text-gray-500`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default NoDataMessage;

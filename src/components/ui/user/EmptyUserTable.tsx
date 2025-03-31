
import React from 'react';

const EmptyUserTable = () => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No users found</p>
      <p className="text-sm text-gray-400 mt-2">
        Users may have been deleted or there might be an issue with data retrieval.
      </p>
    </div>
  );
};

export default EmptyUserTable;


import React from 'react';

const ActivityTabContent = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <p className="text-muted-foreground mb-4">
        This section would display recent activities from users in your company.
        It requires implementing a separate data fetch for activities or events.
      </p>
      
      <div className="border rounded-md p-4 bg-amber-50 text-amber-800">
        <p className="font-medium">Implementation Note</p>
        <p className="text-sm mt-1">
          To display real activity data, create a function that queries recent events
          from projects, leads, and other relevant tables in your database.
        </p>
      </div>
    </div>
  );
};

export default ActivityTabContent;

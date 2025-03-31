
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserTable from '@/components/ui/user/UserTable';
import UserLoadingState from '@/components/ui/user/UserLoadingState';
import { Customer } from '@/hooks/customers/types';

interface UserTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loading: boolean;
  filteredUsers: Customer[];
  handleUserClick: (userId: string) => void;
  handleManageRole: (userId: string) => void;
  refreshUsers: () => void;
  getTabCount: (tabName: string) => number;
}

const UserTabs = ({
  activeTab,
  setActiveTab,
  loading,
  filteredUsers,
  handleUserClick,
  handleManageRole,
  refreshUsers,
  getTabCount
}: UserTabsProps) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="px-4 pt-2">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All Users ({getTabCount('all')})
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Admins ({getTabCount('admins')})
          </TabsTrigger>
          <TabsTrigger value="managers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Managers ({getTabCount('managers')})
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Customers ({getTabCount('customers')})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Active ({getTabCount('active')})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Inactive ({getTabCount('inactive')})
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all" className="p-0 mt-0">
        {loading ? (
          <UserLoadingState />
        ) : (
          <UserTable 
            users={filteredUsers} 
            onUserClick={handleUserClick}
            onManageRole={handleManageRole}
            onRefresh={refreshUsers}
          />
        )}
      </TabsContent>
      
      {/* All other tab content uses the same component with filtered data */}
      {['admins', 'managers', 'customers', 'active', 'inactive'].map((tab) => (
        <TabsContent key={tab} value={tab} className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
              onRefresh={refreshUsers}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default UserTabs;


import { useEffect, useState } from 'react';
import { RefreshCcw, UsersRound, Plus, Grid, Table, UserPlus } from 'lucide-react';
import InviteUserButton from './buttons/InviteUserButton';
import { Button } from '@/components/ui/button';
import AddUserDialog from '@/components/ui/user/AddUserDialog';

interface CustomerHeaderProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  onRefresh: () => void;
  loading: boolean;
  onInviteUser: () => void;
  companyId?: string;
}

const CustomerHeader = ({ 
  view, 
  onViewChange, 
  onRefresh,
  loading,
  onInviteUser,
  companyId
}: CustomerHeaderProps) => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Log when companyId changes to help with debugging
  useEffect(() => {
    console.log("[CustomerHeader] Received companyId:", companyId);
  }, [companyId]);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-semibold">Kunden</h1>
        <button 
          onClick={onRefresh} 
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          disabled={loading}
          aria-label="Refresh customer data"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 flex">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-1.5 rounded ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`p-1.5 rounded ${view === 'table' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
            aria-label="Table view"
          >
            <Table size={16} />
          </button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => setIsAddUserDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Benutzer hinzufügen
        </Button>
        
        <InviteUserButton 
          onInviteUser={onInviteUser} 
          companyId={companyId}
        />
      </div>
      
      {isAddUserDialogOpen && (
        <AddUserDialog 
          isOpen={isAddUserDialogOpen} 
          onClose={() => setIsAddUserDialogOpen(false)}
          onUserAdded={onRefresh}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default CustomerHeader;

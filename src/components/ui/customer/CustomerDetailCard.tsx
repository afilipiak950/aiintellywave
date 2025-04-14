
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getInitials } from '@/utils/customerUtils';
import GoogleJobsToggle from '@/components/ui/customer/GoogleJobsToggle';
import CompanySearchStringToggle from '@/components/admin/customers/CompanySearchStringToggle';

interface CustomerDetailCardProps {
  customer: any;
  isAdmin?: boolean;
}

const CustomerDetailCard: React.FC<CustomerDetailCardProps> = ({ customer, isAdmin }) => {
  if (!customer) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle>{customer.name || 'Customer'}</CardTitle>
            <CardDescription>
              {customer.email || 'No email available'}
            </CardDescription>
          </div>
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.avatar_url} alt={customer.name} />
            <AvatarFallback>{getInitials(customer.name || 'Customer')}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div>
              <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Role</div>
            <div className="font-medium">
              {customer.role?.charAt(0).toUpperCase() + customer.role?.slice(1) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="font-medium">
              {customer.created_at 
                ? formatDistanceToNow(new Date(customer.created_at), { addSuffix: true }) 
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Seen</div>
            <div className="font-medium">
              {customer.last_sign_in_at 
                ? formatDistanceToNow(new Date(customer.last_sign_in_at), { addSuffix: true }) 
                : 'Never'}
            </div>
          </div>
        </div>
        
        {isAdmin && customer.company_id && (
          <div className="pt-4 border-t">
            <h3 className="font-medium text-sm mb-2">Features</h3>
            <div className="space-y-2">
              <CompanySearchStringToggle companyId={customer.company_id} />
              <GoogleJobsToggle 
                companyId={customer.company_id}
                enabled={customer.google_jobs_enabled} 
                onStatusChange={() => {}} 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerDetailCard;

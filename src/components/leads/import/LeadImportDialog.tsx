
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CSVImportTab from './CSVImportTab';
import LinkedInImportTab from './LinkedInImportTab';

interface LeadImportDialogProps {
  open: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
  projectId?: string;
}

const LeadImportDialog = ({
  open,
  onClose,
  onLeadCreated,
  projectId
}: LeadImportDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('csv');

  const handleLeadCreated = () => {
    onLeadCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="csv" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            <CSVImportTab 
              onLeadCreated={handleLeadCreated}
              projectId={projectId}
            />
          </TabsContent>
          
          <TabsContent value="linkedin">
            <LinkedInImportTab 
              onLeadCreated={handleLeadCreated}
              projectId={projectId}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadImportDialog;

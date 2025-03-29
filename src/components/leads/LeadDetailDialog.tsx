
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreIndicator from './LeadScoreIndicator';
import { format } from 'date-fns';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Briefcase, 
  Tag, 
  FileText, 
  Edit,
  Save,
  X,
  Table
} from 'lucide-react';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [excelData, setExcelData] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        position: lead.position,
        status: lead.status,
        notes: lead.notes,
        score: lead.score
      });
      
      try {
        if (lead.notes && lead.notes.startsWith('{') && lead.notes.endsWith('}')) {
          const parsedData = JSON.parse(lead.notes);
          if (typeof parsedData === 'object' && parsedData !== null) {
            setExcelData(parsedData);
          } else {
            setExcelData(null);
          }
        } else {
          setExcelData(null);
        }
      } catch (e) {
        console.log('Notes is not valid JSON, not Excel data', e);
        setExcelData(null);
      }
    }
    setEditMode(false);
  }, [lead]);
  
  const handleChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = async () => {
    if (lead && formData) {
      await onUpdate(lead.id, formData);
      setEditMode(false);
    }
  };
  
  const handleCancel = () => {
    if (lead) {
      setFormData({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        position: lead.position,
        status: lead.status,
        notes: lead.notes,
        score: lead.score
      });
    }
    setEditMode(false);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  // Check for extra data fields
  const hasExtraData = lead && lead.extra_data && Object.keys(lead.extra_data).length > 0;
  const extraFields = lead?.extra_data ? Object.entries(lead.extra_data) : [];
  
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{lead.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {lead.company && (
                  <span className="font-medium">{lead.company}</span>
                )}
                {lead.position && lead.company && <span> • </span>}
                {lead.position && (
                  <span>{lead.position}</span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <LeadStatusBadge status={lead.status} size="lg" />
              <LeadScoreIndicator score={lead.score || 0} size="md" />
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-2">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            {hasExtraData && (
              <TabsTrigger value="extra-data">Additional Fields</TabsTrigger>
            )}
            {excelData && (
              <TabsTrigger value="excel-data">Excel Data</TabsTrigger>
            )}
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="info" className="mt-0 p-1">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User size={14} /> Name
                    </Label>
                    {editMode ? (
                      <Input 
                        id="name" 
                        value={formData.name || ''} 
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-2 border rounded-md bg-slate-50">
                        {lead.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail size={14} /> Email
                    </Label>
                    {editMode ? (
                      <Input 
                        id="email" 
                        value={formData.email || ''} 
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-2 border rounded-md bg-slate-50">
                        {lead.email || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building size={14} /> Company
                    </Label>
                    {editMode ? (
                      <Input 
                        id="company" 
                        value={formData.company || ''} 
                        onChange={(e) => handleChange('company', e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-2 border rounded-md bg-slate-50">
                        {lead.company || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone size={14} /> Phone
                    </Label>
                    {editMode ? (
                      <Input 
                        id="phone" 
                        value={formData.phone || ''} 
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-2 border rounded-md bg-slate-50">
                        {lead.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position" className="flex items-center gap-2">
                      <Briefcase size={14} /> Position
                    </Label>
                    {editMode ? (
                      <Input 
                        id="position" 
                        value={formData.position || ''} 
                        onChange={(e) => handleChange('position', e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-2 border rounded-md bg-slate-50">
                        {lead.position || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project" className="flex items-center gap-2">
                      <Tag size={14} /> Project
                    </Label>
                    <div className="text-sm p-2 border rounded-md bg-slate-50">
                      {lead.project_name || 'Unassigned'}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Calendar size={14} /> Lead Info
                    </Label>
                    {lead.last_contact && (
                      <span className="text-xs text-muted-foreground">
                        Last Contact: {formatDate(lead.last_contact)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm p-2 border rounded-md bg-slate-50">
                      Created: {formatDate(lead.created_at)}
                    </div>
                    <div className="text-sm p-2 border rounded-md bg-slate-50">
                      Updated: {formatDate(lead.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-0 p-1">
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText size={14} /> Notes
                </Label>
                {editMode ? (
                  <Textarea 
                    id="notes" 
                    value={formData.notes || ''} 
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={8}
                  />
                ) : (
                  <div className="text-sm p-2 border rounded-md bg-slate-50 min-h-[200px] whitespace-pre-wrap">
                    {excelData ? 'This lead was imported from Excel data' : lead.notes || 'No notes provided'}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {hasExtraData && (
              <TabsContent value="extra-data" className="mt-0 p-1">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Table size={14} /> Additional Fields
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {extraFields.map(([key, value]) => (
                          <tr key={key} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-xs font-medium">{key}</td>
                            <td className="px-4 py-2 text-xs">
                              {value !== null && value !== undefined ? String(value) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            )}
            
            {excelData && (
              <TabsContent value="excel-data" className="mt-0 p-1">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Table size={14} /> Original Excel Data
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(excelData).map(([key, value]) => (
                          <tr key={key} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-xs font-medium">{key}</td>
                            <td className="px-4 py-2 text-xs">
                              {value !== null && value !== undefined ? String(value) : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          {editMode ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button onClick={handleSave} className="ml-2">
                <Save size={14} className="mr-1" /> Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit size={14} className="mr-1" /> Edit
              </Button>
              <Button variant="outline" onClick={onClose} className="ml-2">
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;

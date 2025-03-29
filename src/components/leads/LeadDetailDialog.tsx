
import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import LeadStatusBadge from './LeadStatusBadge';
import LeadScoreIndicator from './LeadScoreIndicator';
import { Mail, Phone, Building, Calendar, User, File, Tag } from 'lucide-react';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

export const LeadDetailDialog = ({
  lead,
  open,
  onClose,
  onUpdate
}: LeadDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  
  // Reset form when lead changes
  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setEditMode(false);
    }
  }, [lead]);
  
  if (!lead) return null;
  
  const handleInputChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    if (!lead) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate(lead.id, formData);
      setEditMode(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{editMode ? 'Edit Lead' : lead.name}</span>
            {!editMode && <LeadStatusBadge status={lead.status} animate />}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange('status', value as LeadStatus)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="score">Lead Score (0-100)</Label>
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.score || 0}
                        onChange={(e) => handleInputChange('score', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{lead.name}</h3>
                    {lead.position && (
                      <p className="text-muted-foreground">
                        {lead.position}{lead.company ? ` at ${lead.company}` : ''}
                      </p>
                    )}
                  </div>
                  <LeadScoreIndicator score={lead.score} size="lg" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="space-y-3 p-4 rounded-lg bg-secondary/20"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                    
                    {lead.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-muted-foreground" />
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                          {lead.email}
                        </a>
                      </div>
                    )}
                    
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-muted-foreground" />
                        <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    
                    {lead.company && (
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-muted-foreground" />
                        <span>{lead.company}</span>
                      </div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3 p-4 rounded-lg bg-primary/10"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-medium text-sm text-muted-foreground">Project Information</h4>
                    
                    <div className="flex items-center gap-2">
                      <File size={16} className="text-muted-foreground" />
                      <span>{lead.project_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-muted-foreground" />
                      <span>{lead.company_name}</span>
                    </div>
                    
                    {lead.last_contact && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="text-sm">
                          Last contact: {formatDistanceToNow(new Date(lead.last_contact), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
                
                {lead.tags && lead.tags.length > 0 && (
                  <motion.div 
                    className="flex flex-wrap gap-2 mt-4"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Tag size={16} className="text-muted-foreground" />
                    {lead.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-secondary/20 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                )}
                
                <div className="text-sm text-muted-foreground mt-8 pt-2 border-t">
                  <p>Created: {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
                  {lead.created_at !== lead.updated_at && (
                    <p>Updated: {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={8}
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes about this lead..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {lead.notes ? (
                    <div className="rounded-lg border p-4 bg-card whitespace-pre-line">
                      {lead.notes}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      <User size={40} className="mx-auto mb-2 opacity-20" />
                      <p>No notes recorded for this lead.</p>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="text-center text-muted-foreground p-8">
              <Calendar size={40} className="mx-auto mb-2 opacity-20" />
              <p>Activity tracking will be available in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(lead);
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setEditMode(true)}>
                Edit Lead
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;

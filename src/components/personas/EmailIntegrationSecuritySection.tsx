
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, ShieldCheck, Mail, Key, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmailIntegration } from '@/types/persona';
import { useAuth } from '@/context/auth';
import SecurePasswordField from './SecurePasswordField';
import EmailEncryptionIndicator from './EmailEncryptionIndicator';
import AnimatedEncryptionBackground from './AnimatedEncryptionBackground';
import { toast } from '@/hooks/use-toast';

interface EmailIntegrationSecuritySectionProps {
  integration: EmailIntegration;
  onUpdate: (id: string, data: Partial<EmailIntegration>) => void;
  onDelete: (id: string) => void;
  isVisible: boolean;
  isDecrypting: boolean;
  onToggleVisibility: () => void;
}

const EmailIntegrationSecuritySection: React.FC<EmailIntegrationSecuritySectionProps> = ({
  integration,
  onUpdate,
  onDelete,
  isVisible,
  isDecrypting,
  onToggleVisibility
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    host: integration.host || '',
    port: integration.port || '',
    username: integration.username || '',
    password: integration.password || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handleInputChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChange = (value: string) => {
    setForm(prev => ({ ...prev, password: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate(integration.id, form);
      setIsEditing(false);
      toast({
        title: "Integration updated",
        description: "Your email integration has been securely updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update integration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form to current values
    if (!isEditing) {
      setForm({
        host: integration.host || '',
        port: integration.port || '',
        username: integration.username || '',
        password: integration.password || '',
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      await onDelete(integration.id);
      toast({
        title: "Integration disconnected",
        description: "Your email integration has been removed.",
      });
    }
  };

  return (
    <Card className="relative mb-6 overflow-hidden">
      <AnimatedEncryptionBackground active={true} type="email" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isDecrypting ? 360 : 0 }}
              transition={{ duration: 1, repeat: isDecrypting ? Infinity : 0 }}
            >
              <Mail className="h-5 w-5 text-primary" />
            </motion.div>
            <CardTitle>{integration.provider.toUpperCase()} Integration</CardTitle>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onToggleVisibility}
                  className="flex items-center gap-1 text-xs"
                >
                  {isVisible ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Key className="h-3 w-3" />
                  )}
                  {isDecrypting ? "Decrypting..." : isVisible ? "Hide Credentials" : "Reveal Credentials"}
                </Button>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleEdit}
                disabled={isSubmitting}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Disconnect
              </Button>
            </motion.div>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Credentials stored with enterprise-grade encryption</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {isDecrypting ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Securely decrypting credentials...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host Server</Label>
                <Input
                  id="host"
                  name="host"
                  value={form.host}
                  onChange={handleInputChange('host')}
                  disabled={!isEditing || isSubmitting}
                  placeholder="mail.example.com"
                  className="relative z-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  name="port"
                  value={form.port}
                  onChange={handleInputChange('port')}
                  disabled={!isEditing || isSubmitting}
                  placeholder="993"
                  className="relative z-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange('username')}
                  disabled={!isEditing || isSubmitting}
                  placeholder="user@example.com"
                  className="relative z-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <SecurePasswordField 
                  value={isVisible ? form.password : '••••••••'}
                  onChange={handlePasswordChange}
                  disabled={!isEditing || isSubmitting || (!isVisible && !isAdmin)}
                  className="relative z-10"
                />
              </div>
            </div>
            
            <motion.div
              className="security-indicator flex items-center gap-2 p-3 mb-4 bg-muted/50 rounded-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </motion.div>
              <p className="text-sm">
                <span className="font-medium">Enhanced Security:</span> Your credentials are encrypted on your device before
                transmission and stored using enterprise-grade security protocols.
              </p>
            </motion.div>
            
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="relative overflow-hidden group"
                >
                  {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  <span className="relative z-10">
                    {isSubmitting ? "Securely Updating..." : "Update Integration"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10"
                    animate={{
                      background: [
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                        "linear-gradient(90deg, transparent 100%, rgba(255,255,255,0.2) 150%, transparent 200%)"
                      ],
                      x: ["-100%", "100%"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailIntegrationSecuritySection;

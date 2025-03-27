import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, LogOut } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLanguage, getTranslation } from '../../utils/languageUtils';
import { TranslationDict } from '../../utils/languageTypes';

const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const language = getCurrentLanguage();
  
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    
    try {
      // This is a mock implementation
      // In a real app, you'd call an API to change the password
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      toast({
        title: "Password updated successfully",
      });
    } catch (error) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <h3 className="text-lg font-medium">{t('changePassword')}</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="current-password" className="text-sm font-medium mb-2 block">
            {t('currentPassword')}
          </label>
          <Input 
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="new-password" className="text-sm font-medium mb-2 block">
            {t('newPassword')}
          </label>
          <Input 
            id="new-password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="text-sm font-medium mb-2 block">
            {t('confirmPassword')}
          </label>
          <Input 
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : t('save')}
        </Button>
      </div>
    </form>
  );
};

const TwoFactorSection = () => {
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();
  const language = getCurrentLanguage();
  
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    
    toast({
      title: newState ? 
        "Two-factor authentication enabled" : 
        "Two-factor authentication disabled",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('twoFactorAuth')}</h3>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="two-factor" className="text-sm font-medium">
            {enabled ? t('enableTwoFactor') : t('disableTwoFactor')}
          </label>
          <Switch 
            id="two-factor" 
            checked={enabled} 
            onCheckedChange={handleToggle}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>
      </div>
    </div>
  );
};

const SessionsSection = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, session: currentSession } = useAuth();
  const language = getCurrentLanguage();
  
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleShowSessions = async () => {
    setLoading(true);
    
    try {
      const { data } = await supabase.auth.getSession();
      
      // For demonstration purposes, we'll create some mock sessions
      // since we can't access other sessions
      const mockCurrentSession = {
        id: data.session?.user.id || 'current',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_agent: navigator.userAgent || 'Unknown browser',
        is_current: true
      };
      
      // Create some mock sessions for demo
      const mockSessions = [
        mockCurrentSession,
        {
          id: 'prev1',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          is_current: false
        },
        {
          id: 'prev2',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          is_current: false
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    return 'Unknown Browser';
  };

  const getOSInfo = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('sessions')}</h3>
      
      <p className="text-sm text-muted-foreground">
        View all active sessions and sign out from devices you don't recognize.
      </p>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handleShowSessions}>
            {t('manageSessions')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              These are the devices that are currently signed into your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 space-y-3 max-h-[500px] overflow-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <span>Loading sessions...</span>
              </div>
            ) : (
              sessions.map(session => (
                <Card key={session.id} className={session.is_current ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex justify-between">
                      <span>
                        {getBrowserInfo(session.user_agent)} on {getOSInfo(session.user_agent)}
                      </span>
                      {session.is_current && (
                        <span className="text-xs bg-primary/20 text-primary py-1 px-2 rounded-full">
                          Current Session
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground pb-2">
                    <div className="flex justify-between">
                      <span>Last active: {formatDistanceToNow(new Date(session.updated_at))} ago</span>
                      
                      {!session.is_current && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive">
                          <LogOut size={16} className="mr-1" />
                          Sign Out
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="space-y-10">
      <PasswordSection />
      <TwoFactorSection />
      <SessionsSection />
    </div>
  );
};

export default SecuritySettings;

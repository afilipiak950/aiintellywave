
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { getCurrentLanguage, getTranslation } from '../../../utils/languageUtils';
import { TranslationDict } from '../../../utils/languageTypes';

export const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const language = getCurrentLanguage();
  
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError(t('passwordsMustMatch'));
      return;
    }
    
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    
    setLoading(true);
    
    try {
      // Attempt to reauthenticate user first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (authError) {
        setError(t('incorrectCurrentPassword'));
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      toast({
        title: t('passwordUpdated'),
        description: t('passwordUpdatedSuccessfully'),
      });
    } catch (error) {
      setError(t('passwordUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Lock className="w-5 h-5" /> {t('changePassword')}
      </h3>
      
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
          {loading ? t('updating') : t('save')}
        </Button>
      </div>
    </form>
  );
};

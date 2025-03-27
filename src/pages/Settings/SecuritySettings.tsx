
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, LogOut, Lock, ShieldCheck, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLanguage, getTranslation } from '../../utils/languageUtils';
import { TranslationDict } from '../../utils/languageTypes';
import { generateTOTPSecret, verifyTOTPCode } from '../../utils/twoFactorUtils';

const PasswordSection = () => {
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

const TwoFactorSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const language = getCurrentLanguage();
  
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleToggle = async () => {
    if (!enabled) {
      // Generate TOTP Secret
      const secret = generateTOTPSecret();
      setTotpSecret(secret);
      setError('');
    } else {
      // Disable 2FA
      try {
        await supabase
          .from('user_2fa')
          .update({ is_enabled: false, secret: null })
          .eq('user_id', user?.id);
        
        setEnabled(false);
        toast({
          title: t('twoFactorDisabled'),
          description: t('twoFactorDisabledDescription'),
        });
      } catch (error) {
        toast({
          title: t('error'),
          description: t('twoFactorDisableFailed'),
          variant: 'destructive'
        });
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!totpSecret) return;

    try {
      const isValid = verifyTOTPCode(totpSecret, verificationCode);
      
      if (isValid) {
        // Store 2FA secret and mark as enabled
        await supabase
          .from('user_2fa')
          .upsert({
            user_id: user?.id,
            is_enabled: true,
            secret: totpSecret
          });
        
        setEnabled(true);
        setTotpSecret('');
        setVerificationCode('');
        
        toast({
          title: t('twoFactorEnabled'),
          description: t('twoFactorEnabledDescription'),
        });
      } else {
        setError(t('invalidVerificationCode'));
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('twoFactorSetupFailed'),
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        {enabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />} 
        {t('twoFactorAuth')}
      </h3>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="two-factor" className="text-sm font-medium">
            {enabled ? t('disableTwoFactor') : t('enableTwoFactor')}
          </label>
          <Switch 
            id="two-factor" 
            checked={enabled} 
            onCheckedChange={handleToggle}
          />
        </div>
        
        {totpSecret && !enabled && (
          <div className="mt-4 space-y-2">
            <p className="text-sm">
              {t('scanQRCodeOrEnterManually')}
            </p>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="font-mono text-sm">{totpSecret}</p>
            </div>
            <Input 
              type="text" 
              placeholder={t('enterVerificationCode')}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-2"
            />
            {error && (
              <div className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <Button onClick={handleVerifyCode} className="mt-2">
              {t('verify')}
            </Button>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-2">
          {t('twoFactorDescription')}
        </p>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="space-y-10">
      <PasswordSection />
      <TwoFactorSection />
    </div>
  );
};

export default SecuritySettings;

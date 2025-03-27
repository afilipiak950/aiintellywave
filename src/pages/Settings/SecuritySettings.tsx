
import { PasswordSection } from '../../components/settings/security/PasswordSection';
import { TwoFactorSection } from '../../components/settings/security/TwoFactorSection';

const SecuritySettings = () => {
  return (
    <div className="space-y-10">
      <PasswordSection />
      <TwoFactorSection />
    </div>
  );
};

export default SecuritySettings;

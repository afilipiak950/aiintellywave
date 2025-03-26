
import { useState } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useTheme } from '../../hooks/use-theme';
import { useAuth } from '../../context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Sun, Moon, Laptop } from 'lucide-react';

const AppearanceSettings = () => {
  const { theme, updateTheme } = useTheme();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  const handleThemeChange = async (value: 'light' | 'dark' | 'system') => {
    setIsUpdating(true);
    await updateTheme(value);
    setIsUpdating(false);
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Appearance Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={theme} 
              onValueChange={handleThemeChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <RadioGroupItem 
                  value="light" 
                  id="theme-light" 
                  className="sr-only" 
                  disabled={isUpdating} 
                />
                <Label htmlFor="theme-light" className="cursor-pointer flex flex-col items-center gap-2">
                  <Sun className="h-10 w-10 text-orange-500" />
                  <div className="space-y-1 text-center">
                    <p className="font-medium">Light</p>
                    <p className="text-sm text-gray-500">Light mode for daytime</p>
                  </div>
                </Label>
              </div>
              
              <div className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <RadioGroupItem 
                  value="dark" 
                  id="theme-dark" 
                  className="sr-only" 
                  disabled={isUpdating} 
                />
                <Label htmlFor="theme-dark" className="cursor-pointer flex flex-col items-center gap-2">
                  <Moon className="h-10 w-10 text-blue-700" />
                  <div className="space-y-1 text-center">
                    <p className="font-medium">Dark</p>
                    <p className="text-sm text-gray-500">Dark mode for night</p>
                  </div>
                </Label>
              </div>
              
              <div className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <RadioGroupItem 
                  value="system" 
                  id="theme-system" 
                  className="sr-only" 
                  disabled={isUpdating} 
                />
                <Label htmlFor="theme-system" className="cursor-pointer flex flex-col items-center gap-2">
                  <Laptop className="h-10 w-10 text-gray-600" />
                  <div className="space-y-1 text-center">
                    <p className="font-medium">System</p>
                    <p className="text-sm text-gray-500">Follow system settings</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {isUpdating && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-gray-500">Updating theme...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default AppearanceSettings;


import { Search } from 'lucide-react';
import SearchBar from '../ui/header/SearchBar';
import NotificationButton from '../ui/header/NotificationButton';
import UserMenu from '../ui/header/UserMenu';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 w-full border-b border-border/40 shadow-sm">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <LanguageSwitcher 
            variant="ghost" 
            size="sm" 
            showLabel={false}
            className="text-muted-foreground hover:text-foreground transition-colors" 
          />
          <NotificationButton className="text-muted-foreground hover:text-foreground transition-colors" />
          <div className="h-5 w-[1px] bg-border/60" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

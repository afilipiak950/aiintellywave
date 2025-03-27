
import SearchBar from '../ui/header/SearchBar';
import NotificationButton from '../ui/header/NotificationButton';
import UserMenu from '../ui/header/UserMenu';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <SearchBar />
      </div>
      
      <div className="flex items-center space-x-4">
        <LanguageSwitcher variant="ghost" size="sm" showLabel={false} />
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;

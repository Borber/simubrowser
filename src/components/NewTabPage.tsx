import React, { useState, useEffect } from 'react';
import { ShortcutSite, Bookmark } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import BookmarkBar from './BookmarkBar';

const shortcuts: ShortcutSite[] = [
  {
    id: '1',
    title: 'HTML5 Test',
    url: 'https://html5test.com',
    icon: '🌐'
  },
  {
    id: '2',
    title: 'Bilibili',
    url: 'https://www.bilibili.com',
    icon: '📺'
  },
  {
    id: '3',
    title: 'Can I use',
    url: 'https://caniuse.com',
    icon: '🐱'
  },
  {
    id: '4',
    title: 'DeepSeek',
    url: 'https://www.deepseek.com',
    icon: '🔍'
  },
  {
    id: '5',
    title: 'Cengage',
    url: 'https://www.cengageasia.com',
    icon: '▶️'
  },
  {
    id: '6',
    title: 'AtomGit',
    url: 'https://atomgit.com',
    icon: '🤖'
  }
];

interface ShortcutCardProps {
  site: ShortcutSite;
  onClick: (url: string) => void;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({ site, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={() => onClick(site.url)}
      className={`
        w-full p-3 sm:p-4 rounded-lg transition-all duration-200
        ${theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-white hover:bg-gray-50'}
        hover:scale-105
        flex flex-col items-center justify-center gap-2
        border border-gray-200 dark:border-gray-700
      `}
    >
      <span className="text-2xl">{site.icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {site.title}
      </span>
    </button>
  );
};

interface NewTabPageProps {
  onNavigate?: (url: string) => void;
}

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const handleShortcutClick = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    }
  };

  useEffect(() => {
    const loadBookmarks = async () => {
      const data = JSON.parse(localStorage.getItem('bookmarks') || '[]') as Bookmark[];
      const sortedBookmarks = data.sort((a, b) => b.createdAt - a.createdAt);
      setBookmarks(sortedBookmarks);
    };
    loadBookmarks();
  }, []);

  return (
    <div className={`
      min-h-screen w-full p-4 sm:p-8 flex flex-col items-center justify-center
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <h1 className={`
          text-3xl font-bold text-center
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Quick Access
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {shortcuts.map((site) => (
            <ShortcutCard
              key={site.id}
              site={site}
              onClick={handleShortcutClick}
            />
          ))}
        </div>
        <h2 className={`
          text-2xl font-bold my-8 text-center
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Bookmarks
        </h2>
        <BookmarkBar
          bookmarks={bookmarks}
          onUpdateBookmarks={setBookmarks}
        />
        {bookmarks.length === 0 && (
          <p className={`text-center text-gray-500 dark:text-gray-400 mt-4`}>
            No bookmarks yet. Click the star icon in the address bar to add bookmarks.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewTabPage;
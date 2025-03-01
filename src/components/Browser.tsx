import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NavigationBar } from './NavigationBar';
import { TabBar } from './TabBar';
import { TabCardView } from './TabCardView';
import NewTabPage from './NewTabPage';
import { BrowserState, Tab, getDomainFromUrl, BookmarkType } from '../types';
import BookmarkBar from './BookmarkBar';
import { ShieldAlert } from 'lucide-react';

const createNewTab = (): Tab => ({
  id: uuidv4(),
  url: '',
  title: 'New Tab',
  history: [''],
  currentHistoryIndex: 0,
  error: null,
});

export function Browser() {
  const initialTab = createNewTab();
  const [browserState, setBrowserState] = useState<BrowserState>({
    tabs: [initialTab],
    activeTabId: initialTab.id,
  });
  const [isTabViewOpen, setIsTabViewOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

  useEffect(() => {
    // 从本地存储加载书签
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const activeTab = browserState.tabs.find(
    (tab) => tab.id === browserState.activeTabId
  )!;

  const updateActiveTab = (updates: Partial<Tab>) => {
    setBrowserState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === prev.activeTabId ? { ...tab, ...updates } : tab
      ),
    }));
  };

  const handleNavigate = (url: string) => {
    const newHistory = activeTab.history
      .slice(0, activeTab.currentHistoryIndex + 1)
      .concat(url);
    updateActiveTab({
      url,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
      error: null, // Clear any previous errors
    });
  };

  const handleNewTab = () => {
    const newTab = createNewTab();
    setBrowserState((prev) => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  };

  const handleCloseTab = (tabId: string) => {
    setBrowserState((prev) => {
      const newTabs = prev.tabs.filter((tab) => tab.id !== tabId);
      if (newTabs.length === 0) {
        const newTab = createNewTab();
        return {
          tabs: [newTab],
          activeTabId: newTab.id,
        };
      }
      return {
        tabs: newTabs,
        activeTabId:
          prev.activeTabId === tabId ? newTabs[0].id : prev.activeTabId,
      };
    });
  };

  const handleBack = () => {
    if (activeTab.currentHistoryIndex > 0) {
      updateActiveTab({
        currentHistoryIndex: activeTab.currentHistoryIndex - 1,
        url: activeTab.history[activeTab.currentHistoryIndex - 1],
        error: null,
      });
    }
  };

  const handleForward = () => {
    if (activeTab.currentHistoryIndex < activeTab.history.length - 1) {
      updateActiveTab({
        currentHistoryIndex: activeTab.currentHistoryIndex + 1,
        url: activeTab.history[activeTab.currentHistoryIndex + 1],
        error: null,
      });
    }
  };

  const handleRefresh = () => {
    updateActiveTab({ error: null }); // Clear any previous errors
    const iframe = document.querySelector(`iframe[data-tab-id="${activeTab.id}"]`) as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = 'about:blank';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 50);
    }
  };

  const handleIframeError = () => {
    updateActiveTab({
      error: "This website cannot be displayed in an iframe due to security restrictions.",
      title: "Cannot Display Content",
    });
  };

  const handleIframeLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = event.target as HTMLIFrameElement;
      const title = iframe.contentDocument?.title || getDomainFromUrl(activeTab.url);
      updateActiveTab({ title });
    } catch (error) {
      const title = getDomainFromUrl(activeTab.url);
      updateActiveTab({ title });
    }
  }, [activeTab.url]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-darkBg">
      <TabBar
        tabs={browserState.tabs}
        activeTabId={browserState.activeTabId}
        onTabSelect={(id) => setBrowserState((prev) => ({ ...prev, activeTabId: id }))}
        onTabClose={handleCloseTab}
      />
      <div className="flex-1 relative">
        <BookmarkBar
          bookmarks={bookmarks}
          onUpdateBookmarks={setBookmarks}
          onNavigate={handleNavigate}
        />
        {browserState.tabs.map((tab) => (
          <div
            key={`${tab.id}-${tab.url}`}
            className={`absolute inset-0 flex flex-col overflow-hidden ${
              tab.id === browserState.activeTabId ? 'visible' : 'hidden'
            }`}
          >
            <div className="flex items-center space-x-4 px-2 bg-gray-50 dark:bg-darkSecondary">
              <NavigationBar
                canGoBack={tab.currentHistoryIndex > 0}
                canGoForward={tab.currentHistoryIndex < tab.history.length - 1}
                onBack={handleBack}
                onForward={handleForward}
                onRefresh={handleRefresh}
                tabs={browserState.tabs}
                onTabViewOpen={() => setIsTabViewOpen(true)}
                onNewTab={handleNewTab}
                onNavigate={handleNavigate}
                currentUrl={tab.url}
              />
            </div>
            {tab.error ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-darkSecondary">
                <div className="bg-white dark:bg-darkBg p-8 rounded-lg shadow-md max-w-md text-center dark:shadow-darkSecondary">
                  <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-darkText mb-2">Security Notice</h2>
                  <p className="text-gray-600 dark:text-gray-400">{tab.error}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Try opening <a href={tab.url} target="_blank" rel="noopener noreferrer" className="text-primary-light dark:text-primary-dark hover:underline">
                      {tab.url}
                    </a> in a new window instead.
                  </p>
                </div>
              </div>
            ) : !tab.url ? (
              <NewTabPage onNavigate={handleNavigate} />
            ) : (
              <iframe
                src={tab.url}
                className="w-full h-full border-0 flex-1 min-w-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={tab.title}
                data-tab-id={tab.id}
                sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-popups allow-presentation"
              />
            )}
          </div>
        ))}
      </div>
      <TabCardView
        isOpen={isTabViewOpen}
        onClose={() => setIsTabViewOpen(false)}
        tabs={browserState.tabs}
        activeTabId={browserState.activeTabId}
        onTabSelect={(id) => setBrowserState((prev) => ({ ...prev, activeTabId: id }))}
        onTabClose={handleCloseTab}
      />
    </div>
  );
}
'use client'
import { useState, useEffect, useRef } from 'react';
import { useLogout } from '@/lib/hooks/use-auth';
import { useUser } from '@/lib/hooks/use-user';
import { LogOut, Settings, Sparkles, Languages } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

const Header = () => {
    const logout = useLogout();
    const { data: userData } = useUser();
    const [language, setLanguage] = useState('en');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const languageMenuRef = useRef<HTMLDivElement>(null);

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
    ];

    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    // Close language menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
          setShowLanguageMenu(false);
        }
      };

      if (showLanguageMenu) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showLanguageMenu]);

  return (
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Vimerai</span>
          </Link>
          <div className="flex items-center gap-3">
            {userData?.user ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      Generator
                    </Button>
                  </Link>
                  <Link href="/my-videos">
                    <Button variant="ghost" size="sm">
                      My Videos
                    </Button>
                  </Link>
                  <Link href="/prompt-studio">
                    <Button variant="ghost" size="sm">
                      Prompt Studio
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Pricing
                    </Button>
                  </Link>
                </div>
                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      Generator
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm">
                      Pricing
                    </Button>
                  </Link>
                </div>
                <div className="relative" ref={languageMenuRef}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="gap-2"
                  >
                    <Languages className="w-4 h-4" />
                    <span>{currentLanguage.name}</span>
                  </Button>
                  {showLanguageMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-50">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${
                            language === lang.code ? 'bg-primary/10 font-medium' : ''
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

  );
};

export default Header
"use client";
import { Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // TODO(human) - Implement search suggestions data
  const searchSuggestions = [
    "React components",
    "TypeScript interfaces",
    "API documentation",
    "CSS animations",
    "JavaScript functions",
  ];

  const filteredSuggestions = searchSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape") {
        if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
          setSearchQuery("");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (isSearchModalOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchModalOpen]);


  return (
    <>
      <header className="bg-background-elevated shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-end">
          {/* Compact Search Button */}
          <div className="mx-8">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center px-3 py-2 text-sm text-secondary bg-background-secondary hover:bg-background-hover rounded-lg transition-colors duration-200"
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Search...</span>
              <span className="ml-2 text-xs text-tertiary hidden sm:inline">
                (⌘K)
              </span>
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Full-Screen Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-backdrop z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4">
            <div className="bg-background-elevated rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-secondary w-6 h-6" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation, guides, and more..."
                  className="w-full pl-16 pr-16 py-6 text-xl bg-transparent text-primary placeholder-secondary border-0 focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="border-t  max-h-96 overflow-y-auto">
                  {filteredSuggestions.length > 0 ? (
                    <div className="py-2">
                      <div className="px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wide bg-background-secondary">
                        Suggestions
                      </div>
                      {filteredSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-6 py-4 text-left text-primary hover:bg-background-hover transition-colors flex items-center"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setIsSearchModalOpen(false);
                          }}
                        >
                          <Search className="w-5 h-5 text-secondary mr-4" />
                          <span className="text-base">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-secondary">
                      <Search className="w-12 h-12 mx-auto text-tertiary mb-4" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 bg-background-secondary border-t text-xs text-secondary flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span>
                    Press{" "}
                    <kbd className="px-2 py-1 bg-background-elevated border-border rounded text-xs">
                      ↵
                    </kbd>{" "}
                    to select
                  </span>
                  <span>
                    Press{" "}
                    <kbd className="px-2 py-1 bg-background-elevated border-border rounded text-xs">
                      Esc
                    </kbd>{" "}
                    to close
                  </span>
                </div>
                <span>⌘K to search</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

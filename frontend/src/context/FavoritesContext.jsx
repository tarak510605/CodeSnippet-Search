/**
 * Favorites Context
 * Manages user's favorite snippets using localStorage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  getFavoritesCount: () => 0,
});

export const useFavorites = () => useContext(FavoritesContext);

const STORAGE_KEY = 'code_snippet_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((snippetId) => {
    return favorites.some(fav => fav._id === snippetId);
  }, [favorites]);

  const toggleFavorite = useCallback((snippet) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav._id === snippet._id);
      if (exists) {
        return prev.filter(fav => fav._id !== snippet._id);
      } else {
        // Store the full snippet for offline access
        return [...prev, {
          _id: snippet._id,
          title: snippet.title,
          language: snippet.language,
          tags: snippet.tags,
          code: snippet.code,
          description: snippet.description,
          ratings: snippet.ratings,
          favoritesCount: snippet.favoritesCount,
          savedAt: new Date().toISOString(),
        }];
      }
    });
    return !isFavorite(snippet._id);
  }, [isFavorite]);

  const getFavoritesCount = useCallback(() => favorites.length, [favorites]);

  const value = {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesContext;

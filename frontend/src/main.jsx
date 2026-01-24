import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeContextProvider, FavoritesProvider } from './context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);

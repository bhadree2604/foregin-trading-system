import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToMarket,
  unsubscribeFromMarket,
  getQuote,
  getMarketStatus,
  DEFAULT_PAIRS,
} from '../services/marketDataService';

const MarketDataContext = createContext(null);

export function MarketDataProvider({ children }) {
  const [quotes, setQuotes] = useState({}); // symbol -> normalized quote
  const [providerStatus, setProviderStatus] = useState(null);
  const [watchedSymbols, setWatchedSymbols] = useState(DEFAULT_PAIRS);
  const unsubscribers = useRef({});

  // Update a quote in the state map
  const handleQuoteUpdate = useCallback((symbol, quote) => {
    setQuotes((prev) => ({ ...prev, [symbol]: quote }));
  }, []);

  // Subscribe to a symbol
  const subscribe = useCallback(
    (symbol) => {
      if (unsubscribers.current[symbol]) return; // already subscribed
      const unsub = subscribeToMarket(
        symbol,
        (q) => handleQuoteUpdate(symbol, q),
        30000 // poll every 30 seconds
      );
      unsubscribers.current[symbol] = unsub;
      setWatchedSymbols((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
    },
    [handleQuoteUpdate]
  );

  // Unsubscribe from a symbol
  const unsubscribe = useCallback((symbol) => {
    if (unsubscribers.current[symbol]) {
      unsubscribers.current[symbol]();
      delete unsubscribers.current[symbol];
    }
  }, []);

  // Manually refresh a single quote
  const refreshQuote = useCallback(async (symbol) => {
    const q = await getQuote(symbol);
    if (q) handleQuoteUpdate(symbol, q);
    return q;
  }, [handleQuoteUpdate]);

  // Start subscriptions for default pairs on mount
  useEffect(() => {
    DEFAULT_PAIRS.forEach((s) => subscribe(s));

    // Check provider status once
    getMarketStatus().then(setProviderStatus);

    return () => {
      Object.values(unsubscribers.current).forEach((unsub) => unsub());
      unsubscribers.current = {};
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    quotes,           // { [symbol]: normalizedQuote }
    providerStatus,   // provider health
    watchedSymbols,
    subscribe,
    unsubscribe,
    refreshQuote,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const ctx = useContext(MarketDataContext);
  if (!ctx) throw new Error('useMarketData must be used inside MarketDataProvider');
  return ctx;
}

export default MarketDataContext;

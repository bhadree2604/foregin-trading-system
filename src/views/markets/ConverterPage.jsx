import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { convertCurrency } from '../../services/marketDataService';
import MarketStatusBadge from '../../components/fx/MarketStatusBadge';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';

const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF',
  'SGD', 'CNY', 'AED', 'SAR', 'NZD', 'HKD', 'NOK', 'SEK',
];

export default function ConverterPage() {
  const [amount, setAmount] = useState('10000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
    setLoading(true);
    setResult(null);
    const res = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
    setResult(res);
    setLoading(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  // Auto-convert on currency change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      handleConvert();
    }
  }, [fromCurrency, toCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Currency Converter</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time FX rates powered by Twelve Data. Rates may be delayed up to 15 minutes (free tier).
          </p>
        </div>

        {/* Converter card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setResult(null); }}
              className="w-full text-2xl font-mono font-bold border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10,000"
              min="0"
            />
          </div>

          {/* From / Swap / To */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwap}
              className="mt-4 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
              title="Swap currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={loading || fromCurrency === toCurrency}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Converting…</>
            ) : (
              'Convert'
            )}
          </button>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl p-5 border ${
              result.status === 'UNAVAILABLE'
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}>
              {result.status === 'UNAVAILABLE' ? (
                <div className="text-center">
                  <p className="text-red-600 font-bold text-sm">MARKET DATA UNAVAILABLE</p>
                  <p className="text-red-400 text-xs mt-1">
                    Could not fetch {fromCurrency}/{toCurrency} rate. Try again later.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-slate-400 text-xs mb-1">Result</p>
                    <p className="text-3xl font-bold font-mono">
                      {Number(result.convertedAmount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })} {toCurrency}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      {Number(amount).toLocaleString()} {fromCurrency}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-700 pt-4">
                    <div>
                      <p className="text-slate-400 text-xs">FX Pair</p>
                      <p className="font-mono font-semibold">{result.symbol}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Exchange Rate</p>
                      <p className="font-mono font-semibold">{Number(result.rate).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Data Source</p>
                      <p className="text-sm">{result.source}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Data Status</p>
                      <MarketStatusBadge status={result.freshness} />
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">Rate Timestamp</p>
                      <p className="text-sm">
                        {result.timestampIso ? new Date(result.timestampIso).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4 text-center">
                    Indicative rate only. Not for financial settlement. Always verify with your payment provider.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-xs text-slate-400 text-center">
          Rates sourced from Twelve Data. Free tier data may be delayed up to 15 minutes.
          This tool is for indicative purposes only.
        </div>
      </div>
    </DashboardLayout>
  );
}

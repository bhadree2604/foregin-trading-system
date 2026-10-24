import React from 'react';
import dynamic from 'next/dynamic';

const TrackingMapClient = dynamic(() => import('./TrackingMapInner'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-xs h-[436px] flex flex-col items-center justify-center text-slate-400 gap-2">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">Initializing global tracking map...</p>
    </div>
  ),
});

export default function TrackingMap(props) {
  return <TrackingMapClient {...props} />;
}

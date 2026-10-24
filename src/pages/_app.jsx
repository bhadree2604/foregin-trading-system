import '../index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { MarketDataProvider } from '../contexts/MarketDataContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MarketDataProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
              },
            }}
          />
          <Component {...pageProps} />
        </NotificationProvider>
      </MarketDataProvider>
    </AuthProvider>
  );
}

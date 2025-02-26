import { magic } from '@/lib/magic-client';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '@/styles/globals.css';
import Loading from '@/components/loading/loading';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (!magic) return;

      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          // route to /
          router.push('/');
        } else {
          // route to /login
          router.push('/login');
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  });

  useEffect(() => {
    const handleComplete = () => {
      setIsLoading(false);
    };
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return isLoading ? <Loading /> : <Component {...pageProps} />;
}

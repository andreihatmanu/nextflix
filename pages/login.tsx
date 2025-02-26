import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Login.module.css';
import { SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { magic } from '@/lib/magic-client';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

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

  const handleLoginWithEmail = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (email) {
      // route to dashboard
      setIsLoading(true);
      // log in a user by their email
      try {
        const didToken = await magic.auth.loginWithMagicLink({ email });
        if (didToken) {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${didToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response) {
            router.push('/');
          }

        }
      } catch (error) {
        setIsLoading(false);
        // Handle errors if required!
      }
    } else {
      setIsLoading(false);
      // show user message
      setUserMsg('Enter a valid email address');
    }
  };
  const handleOnChangeEmail = (e: { target: { value: SetStateAction<string> } }) => {
    setUserMsg('');
    const email = e.target.value;
    setEmail(email);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Netflix SignIn</title>
      </Head>

      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <Image
                src="/static/netflix.svg"
                alt="Netflix logo"
                width={128}
                height={34}
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.mainWrapper}>
          <h1 className={styles.signinHeader}>Sign in</h1>

          <input
            type="text"
            name="email"
            id="email"
            placeholder="Email address"
            className={styles.emailInput}
            onChange={handleOnChangeEmail}
          />

          <p className={styles.userMsg}>{userMsg}</p>

          <button onClick={handleLoginWithEmail} className={styles.loginBtn}>
            {isLoading ? 'Loading...' : 'Sign in'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;

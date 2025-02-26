import styles from './navbar.module.css';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { magic } from '@/lib/magic-client';
import Link from 'next/link';

const NavBar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [didToken, setDidToken] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    // Function to retrieve user data
    const getUsername = async () => {
      try {
        if (magic) {
          const { email } = await magic.user.getMetadata();
          const token = await magic.user.getIdToken();
          if (email && token) {
            setUsername(email);
            setDidToken(token);
          }
        } else {
          console.error('Error, magic not defined');
        }
      } catch (error) {
        console.error('Error retrieving user metadata:', error);
      }
    };

    getUsername();
  });

  const handleOnClickHome = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const handleOnClickMyList = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/browse/my-list');
  };

  const handleShowDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleSignout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${didToken}`,
          'Content-Type': 'application/json',
        },
      });

      const res = await response.json();
      if (res.redirect) {
        window.location.href = res.redirect;
      }
    } catch (error) {
      console.error('Error logging out:', error);
      router.push('/login');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoWrapper}>
            <Image src="/static/netflix.svg" alt="Netflix logo" width={128} height={34} />
          </div>
        </Link>

        <ul className={styles.navItems}>
          <li className={styles.navItem} onClick={handleOnClickHome}>
            Home
          </li>
          <li className={styles.navItem2} onClick={handleOnClickMyList}>
            My List
          </li>
        </ul>

        <nav className={styles.navContainer}>
          <div>
            <button className={styles.usernameBtn} onClick={handleShowDropdown}>
              <p className={styles.username}>{username}</p>
              <Image src="/static/expand_more.svg" alt="Expand dropdown" width={24} height={24} />
            </button>
            {showDropdown && (
              <div className={styles.navDropdown}>
                <a className={styles.linkName} onClick={handleSignout}>
                  Sign out
                </a>
                <div className={styles.lineWrapper}></div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;

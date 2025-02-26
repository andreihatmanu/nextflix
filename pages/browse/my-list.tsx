import Head from 'next/head';
import { GetServerSideProps } from 'next';
import NavBar from '@/components/nav/navbar';

import SectionCards from '@/components/card/section-cards';
import { getMyListVideos } from '@/lib/videos';
import useRedirectUser from '@/utils/redirectUser';
import Video from '../video/[videoId]';

import styles from '../../styles/MyList.module.css';

interface MyListProps {
  myListVideos: Video[];
}

export const getServerSideProps: GetServerSideProps<MyListProps> = async (context) => {
  const { userId, token } = await useRedirectUser(context);

  const myListVideos = await getMyListVideos(userId, token);

  return {
    props: { myListVideos },
  };
};

const MyList: React.FC<MyListProps> = ({ myListVideos = [] }) => {
  return (
    <div>
      <Head>
        <title>My list</title>
      </Head>
      <main className={styles.main}>
        <NavBar />
        <div className={styles.sectionWrapper}>
          <SectionCards title="My List" videos={myListVideos} size="small" shouldWrap={true} shouldScale={true} />
        </div>
      </main>
    </div>
  );
};
export default MyList;

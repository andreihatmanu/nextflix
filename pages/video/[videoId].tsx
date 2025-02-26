import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { getYoutubeVideoById } from '@/lib/videos';
import NavBar from '@/components/nav/navbar';
import Like from '../../components/icons/like-icon';
import DisLike from '../../components/icons/dislike-icon';
import clsx from 'classnames';
import styles from '../../styles/Video.module.css';

Modal.setAppElement('#__next');

interface Video {
  id: string;
  title: string;
  imgUrl: string;
  description: string;
  publishTime: string;
  channelTitle: string;
  statistics: { viewCount: Number };
}

export async function getStaticProps(context: { params: { videoId: string } }) {
  //data to fetch from API
  /*const video = {
    title: 'Hi cute dog',
    publishTime: '1990-01-01',
    description:
      'A big red dog that is super cute, can he get any bigger? A big red dog that is super cute, can he get any bigger?',
    channelTitle: 'Paramount Pictures',
    viewCount: 10000,
  };*/
  const videoArray = await getYoutubeVideoById(context.params.videoId);

  return {
    props: {
      video: videoArray.length > 0 ? videoArray[0] : {},
    },
    revalidate: 10, // In seconds
  };
}

export async function getStaticPaths() {
  const listOfVideos = ['mYfJxlgR2jw', '4zH5iYM4wJo', 'KCPEHsAViiQ'];
  const paths = listOfVideos.map((videoId) => ({
    params: { videoId },
  }));

  return { paths, fallback: 'blocking' };
}

const Video: React.FC<{ video: Video }> = ({ video }) => {
  const router = useRouter();

  const [toggleLike, setToggleLike] = useState(false);
  const [toggleDislike, setToggleDislike] = useState(false);

  const { videoId } = router.query;

  useEffect(() => {
    const handleLikeDislikeService = async () => {
      const response = await fetch(`/api/stats?videoId=${videoId}`, {
        method: "GET",
      });
      const data = await response.json();

      if (data.length > 0) {
        const favourited = data[0].favourited;
        if (favourited === 1) {
          setToggleLike(true);
        } else if (favourited === 0) {
          setToggleDislike(true);
        }
      }
    };
    handleLikeDislikeService();
  }, [videoId]);
  const {
    title,
    publishTime,
    description,
    channelTitle,
    statistics: { viewCount },
  } = video;

  const handleToggleLike = async () => {
    setToggleLike(!toggleLike);
    setToggleDislike(toggleLike);

    const val = !toggleLike;
    const response = await fetch('/api/stats', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        favourited: val ? 1 : 0,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });
  };
  const handleToggleDislike = async () => {
    setToggleDislike(!toggleDislike);
    setToggleLike(toggleDislike);

    const val = !toggleDislike;

    const response = await fetch('/api/stats', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        favourited: val ? 0 : 1,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  return (
    <div className={styles.container}>
      <NavBar />
      <Modal
        isOpen={true}
        contentLabel="Watch the video"
        onRequestClose={() => router.back()}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <iframe
          id="ytplayer"
          type="text/html"
          className={styles.videoPlayer}
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
          frameBorder="0"
        ></iframe>

        <div className={styles.likeDislikeBtnWrapper}>
          <div className={styles.likeBtnWrapper}>
            <button onClick={handleToggleLike}>
              <div className={styles.btnWrapper}>
                <Like selected={toggleLike} />
              </div>
            </button>
          </div>
          <button onClick={handleToggleDislike}>
            <div className={styles.btnWrapper}>
              <DisLike selected={toggleDislike} />
            </div>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <div className={styles.col1}>
              <p className={styles.publishTime}>{publishTime}</p>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.col2}>
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>Cast: </span>
                <span className={styles.channelTitle}>{channelTitle}</span>
              </p>
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>View Count: </span>
                <span className={styles.channelTitle}>{viewCount}</span>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Video;

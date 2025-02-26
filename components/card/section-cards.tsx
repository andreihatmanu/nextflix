import styles from './section-cars.module.css';
import Card from './card';
import Link from 'next/link';
import clsx from 'classnames';

const SectionCards = (props: {
  title: string;
  videos: Array<T>;
  size: string;
  shouldWrap?: boolean;
  shouldScale?: boolean;
}) => {
  const { title, videos, shouldWrap = false, size, shouldScale = true } = props;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={clsx(styles.cardWrapper, shouldWrap && styles.wrap)}>
        {videos?.map((video, idx) => {
          return (
            <Link href={`/video/${video.id}`} key={`${title}_${idx}_${video.id}`}>
                <Card id={video.id} imgUrl={video.imgUrl} size={size} shouldScale={shouldScale} />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SectionCards;

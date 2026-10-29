import Link from 'next/link';
import Photo from '../Photo';
import { Chevron, Reveal } from './ui';

// Photo (or a pair of photos) beside text; alternate rows flip sides.
export default function Split({ id, images, tag, title, text, list = [], link, flip = false, children }) {
  return (
    <div id={id} className={`split ${flip ? 'flip' : ''}`}>
      <Reveal className={images.length > 1 ? 'pair' : 'frame zoom-hover'}>
        {images.length > 1 ? (
          images.map((k) => (
            <div key={k} className="frame zoom-hover">
              <Photo k={k} sizes="(max-width: 900px) 50vw, 28vw" />
            </div>
          ))
        ) : (
          <Photo k={images[0]} sizes="(max-width: 900px) 100vw, 55vw" />
        )}
      </Reveal>
      <Reveal className="split-copy" delay={0.1}>
        {tag && <span className="tag-line">{tag}</span>}
        <h2>{title}</h2>
        {text && <p className="lead">{text}</p>}
        {list.length > 0 && (
          <ul>
            {list.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {children}
        {link && (
          <Link href={link.href} className="more-link">
            {link.label} <Chevron />
          </Link>
        )}
      </Reveal>
    </div>
  );
}

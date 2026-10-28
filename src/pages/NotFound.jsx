import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/seo';

export default function NotFound() {
  usePageMeta('Page not found | Hotel Sea View', 'This page does not exist.', { noindex: true });
  return (
    <main id="main" className="page">
      <div className="container prose">
        <h1>Page not found</h1>
        <p>The page you are looking for has moved or no longer exists.</p>
        <p>
          <Link to="/" className="btn solid">
            Back to the hotel
          </Link>
        </p>
      </div>
    </main>
  );
}

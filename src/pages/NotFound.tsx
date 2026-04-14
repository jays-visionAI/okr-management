import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.description}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className={styles.actions}>
          <Link to="/">
            <Button>대시보드로 이동</Button>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()}>
            이전 페이지
          </Button>
        </div>
      </div>

      <div className={styles.decoration}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>
    </div>
  );
}

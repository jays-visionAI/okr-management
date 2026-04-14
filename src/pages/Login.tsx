import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login({ email, password });
    // MSW will intercept and return mock data
  };

  // Demo login handler
  const handleDemoLogin = () => {
    setEmail('sarah.lee@company.com');
    setPassword('password123');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className={styles.title}>OKR</h1>
          <p className={styles.subtitle}>목표 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            label="이메일"
            placeholder="company@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className={styles.error}>{error}</div>}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          <button type="button" className={styles.demoButton} onClick={handleDemoLogin}>
            데모 계정으로 로그인
          </button>
        </form>

        <div className={styles.footer}>
          <p>© 2024 블루포지 Corp. All rights reserved.</p>
        </div>
      </div>

      <div className={styles.decoration}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>
    </div>
  );
}

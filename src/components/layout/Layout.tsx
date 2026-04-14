import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authContainer}>
        <div className={styles.authLogo}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="var(--color-primary)" />
            <circle cx="16" cy="16" r="8" fill="var(--color-accent-yellow)" />
            <circle cx="16" cy="16" r="3" fill="var(--color-accent-red)" />
          </svg>
          <h1 className={styles.authTitle}>OKR Management</h1>
        </div>
        <Outlet />
      </div>
      <div className={styles.authBackground}>
        <div className={styles.bgShape1} />
        <div className={styles.bgShape2} />
        <div className={styles.bgShape3} />
      </div>
    </div>
  );
}

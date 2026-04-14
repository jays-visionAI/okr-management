import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import ProgressChart from '../components/charts/ProgressChart';
import TeamChart from '../components/charts/TeamChart';
import styles from './Dashboard.module.css';
import { mockDashboardStats } from '../mocks/data';

export default function Dashboard() {
  const { objectives, fetchObjectives, isLoading } = useOkrStore();
  const [stats] = useState(mockDashboardStats);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  const recentObjectives = objectives.slice(0, 3);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>OKR 현황을 한눈에 확인하세요</p>
        </div>
        <Link to="/okr/create" className={styles.createButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          새 OKR 만들기
        </Link>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} data-type="total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalObjectives}</span>
            <span className={styles.statLabel}>전체 목표</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} data-type="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.activeObjectives}</span>
            <span className={styles.statLabel}>진행 중</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} data-type="completed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completedObjectives}</span>
            <span className={styles.statLabel}>완료</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} data-type="progress">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.overallProgress}%</span>
            <span className={styles.statLabel}>전체 달성률</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>분기별 진행 추이</h3>
          <ProgressChart data={stats.quarterlyTrend} />
        </Card>

        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>팀별 성과</h3>
          <TeamChart />
        </Card>
      </div>

      {/* Recent Objectives */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>최근 Objectives</h2>
          <Link to="/my-okr" className={styles.viewAll}>전체 보기</Link>
        </div>

        <div className={styles.objectivesList}>
          {recentObjectives.map((objective) => (
            <Link
              key={objective.id}
              to={`/okr/${objective.id}`}
              className={styles.objectiveCard}
            >
              <div className={styles.objectiveHeader}>
                <span className={`${styles.badge} ${styles[objective.type]}`}>
                  {objective.type === 'team' ? '팀' : '개인'}
                </span>
                <span className={`${styles.status} ${styles[objective.status]}`}>
                  {objective.status === 'active' && '진행 중'}
                  {objective.status === 'completed' && '완료'}
                  {objective.status === 'draft' && '초안'}
                  {objective.status === 'cancelled' && '취소'}
                </span>
              </div>
              <h4 className={styles.objectiveTitle}>{objective.title}</h4>
              <div className={styles.objectiveProgress}>
                <ProgressBar value={objective.progress} />
                <span className={styles.progressText}>{objective.progress}%</span>
              </div>
              <div className={styles.objectiveMeta}>
                <span>Q{objective.quarter} • {objective.year}</span>
                <span>{objective.keyResults?.length || 0}개의 Key Results</span>
              </div>
            </Link>
          ))}

          {recentObjectives.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <p>아직 Objectives가 없습니다.</p>
              <Link to="/okr/create">첫 번째 OKR을 만들어보세요</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

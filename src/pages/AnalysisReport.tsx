import { useState } from 'react';
import { mockDashboardStats, mockObjectives, mockTeams } from '../mocks/data';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import TrendChart from '../components/charts/TrendChart';
import styles from './AnalysisReport.module.css';

export default function AnalysisReport() {
  const [filter, setFilter] = useState({ team: 'all', quarter: 'Q1', year: '2024' });
  const stats = mockDashboardStats;

  // Calculate filtered objectives
  const filteredObjectives = mockObjectives.filter((o) => {
    if (filter.team !== 'all' && o.teamId !== filter.team) return false;
    return true;
  });

  const avgProgress = filteredObjectives.length > 0
    ? Math.round(filteredObjectives.reduce((sum, o) => sum + o.progress, 0) / filteredObjectives.length)
    : 0;

  const completedCount = filteredObjectives.filter((o) => o.status === 'completed').length;
  const atRiskCount = filteredObjectives.filter((o) =>
    o.keyResults?.some((kr) => kr.status === 'at_risk' || kr.status === 'behind')
  ).length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>분석 리포트</h1>
          <p className={styles.subtitle}>OKR 성과 분석 및 의사결정 지원 인사이트</p>
        </div>
      </header>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>팀</label>
            <select
              className={styles.select}
              value={filter.team}
              onChange={(e) => setFilter({ ...filter, team: e.target.value })}
            >
              <option value="all">전체 팀</option>
              {mockTeams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>분기</label>
            <select
              className={styles.select}
              value={filter.quarter}
              onChange={(e) => setFilter({ ...filter, quarter: e.target.value })}
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>연도</label>
            <select
              className={styles.select}
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>평균 달성률</span>
            <span className={`${styles.statTrend} ${styles.up}`}>↑ 12%</span>
          </div>
          <span className={styles.statValue}>{avgProgress}%</span>
          <ProgressBar value={avgProgress} />
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>완료된 목표</span>
            <span className={`${styles.statTrend} ${styles.up}`}>↑ 2개</span>
          </div>
          <span className={styles.statValue}>{completedCount} / {filteredObjectives.length}</span>
          <div className={styles.miniChart}>
            <div
              className={styles.miniBar}
              style={{ width: `${(completedCount / filteredObjectives.length) * 100}%` }}
            />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>주의 필요</span>
            <span className={`${styles.statTrend} ${styles.down}`}>↓ 1개</span>
          </div>
          <span className={styles.statValue}>{atRiskCount}개</span>
          <p className={styles.statDesc}>진행이 지연되거나 위험 상태인 목표</p>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>팀 성과</span>
            <span className={`${styles.statTrend} ${styles.up}`}>↑ 8%</span>
          </div>
          <span className={styles.statValue}>{stats.teamProgress}%</span>
          <p className={styles.statDesc}>팀 목표 평균 달성률</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>분기별 진행 추이</h3>
          <TrendChart data={stats.quarterlyTrend} />
        </Card>

        <Card className={styles.insightsCard}>
          <h3 className={styles.chartTitle}>인사이트</h3>
          <div className={styles.insights}>
            <div className={styles.insight}>
              <div className={styles.insightIcon} data-type="success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4>목표 달성률 상승</h4>
                <p>분기별로 꾸준히 달성률이 상승하고 있습니다. 현재 추세라면 분기 목표를 달성할 것으로 예상됩니다.</p>
              </div>
            </div>

            <div className={styles.insight}>
              <div className={styles.insightIcon} data-type="warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4>LCP 최적화 주의</h4>
                <p>웹사이트 성능 관련 목표에서 LCP 지표가 위험 상태입니다. CDN 설정 최적화가 필요합니다.</p>
              </div>
            </div>

            <div className={styles.insight}>
              <div className={styles.insightIcon} data-type="info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className={styles.insightContent}>
                <h4>마케팅 캠페인 성공</h4>
                <p>Marketing Team의 캠페인 목표가 100% 완료되었습니다. 성공 사례를 다른 팀과 공유해보세요.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className={styles.recommendationsCard}>
        <h3 className={styles.chartTitle}>권장 조치</h3>
        <div className={styles.recommendations}>
          <div className={styles.recommendation}>
            <span className={styles.recNumber}>1</span>
            <div className={styles.recContent}>
              <h4>Frontend Team 리소스 재배치</h4>
              <p>성능 최적화 작업에 추가 인력을 배치하여 LCP 목표 달성을 지원하세요.</p>
            </div>
          </div>
          <div className={styles.recommendation}>
            <span className={styles.recNumber}>2</span>
            <div className={styles.recContent}>
              <h4>주간 리뷰 활성화</h4>
              <p>지연된 목표에 대한 주간 리뷰 미팅을 도입하여 조기 개입 기회를 늘리세요.</p>
            </div>
          </div>
          <div className={styles.recommendation}>
            <span className={styles.recNumber}>3</span>
            <div className={styles.recContent}>
              <h4>성공 사례 공유 회의</h4>
              <p>Marketing Team의 성공적인 캠페인 운영 방식을 다른 팀에 공유하는 세션을 개최하세요.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

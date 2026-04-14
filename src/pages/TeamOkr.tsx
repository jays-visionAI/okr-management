import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { mockTeams } from '../mocks/data';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import styles from './TeamOkr.module.css';

export default function TeamOkr() {
  const { objectives, fetchObjectives } = useOkrStore();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  const teamObjectives = objectives.filter((o) => o.type === 'team');
  const filteredObjectives = selectedTeam === 'all'
    ? teamObjectives
    : teamObjectives.filter((o) => o.teamId === selectedTeam);

  // Calculate team stats
  const teamStats = mockTeams.map((team) => {
    const teamObjs = teamObjectives.filter((o) => o.teamId === team.id);
    const completedCount = teamObjs.filter((o) => o.status === 'completed').length;
    const avgProgress = teamObjs.length > 0
      ? Math.round(teamObjs.reduce((sum, o) => sum + o.progress, 0) / teamObjs.length)
      : 0;
    return {
      ...team,
      totalObjectives: teamObjs.length,
      completedObjectives: completedCount,
      avgProgress,
    };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>팀 OKR</h1>
          <p className={styles.subtitle}>팀별 목표 현황 및 성과 추적</p>
        </div>
      </header>

      {/* Team Cards */}
      <div className={styles.teamStats}>
        {teamStats.map((team) => (
          <Card
            key={team.id}
            className={`${styles.teamCard} ${selectedTeam === team.id ? styles.selected : ''}`}
            onClick={() => setSelectedTeam(team.id)}
          >
            <div className={styles.teamHeader}>
              <h3 className={styles.teamName}>{team.name}</h3>
              <span className={styles.teamProgress}>{team.avgProgress}%</span>
            </div>
            {team.description && (
              <p className={styles.teamDesc}>{team.description}</p>
            )}
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{team.totalObjectives}</span>
                <span className={styles.statLabel}>전체 목표</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{team.completedObjectives}</span>
                <span className={styles.statLabel}>완료</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{team.totalObjectives - team.completedObjectives}</span>
                <span className={styles.statLabel}>진행 중</span>
              </div>
            </div>
            <ProgressBar value={team.avgProgress} />
          </Card>
        ))}
      </div>

      {/* Team Objectives */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedTeam === 'all'
              ? '전체 팀 Objectives'
              : `${mockTeams.find((t) => t.id === selectedTeam)?.name || ''} Objectives`}
          </h2>
          <button
            className={styles.clearFilter}
            onClick={() => setSelectedTeam('all')}
          >
            필터 초기화
          </button>
        </div>

        <div className={styles.objectivesList}>
          {filteredObjectives.map((objective) => (
            <Link
              key={objective.id}
              to={`/okr/${objective.id}`}
              className={styles.objectiveCard}
            >
              <div className={styles.objectiveHeader}>
                <h3 className={styles.objectiveTitle}>{objective.title}</h3>
                <span className={`${styles.status} ${styles[objective.status]}`}>
                  {objective.status === 'active' && '진행 중'}
                  {objective.status === 'completed' && '완료'}
                  {objective.status === 'draft' && '초안'}
                </span>
              </div>
              {objective.description && (
                <p className={styles.objectiveDesc}>{objective.description}</p>
              )}
              <div className={styles.objectiveMeta}>
                <span>Q{objective.quarter} • {objective.year}</span>
                <span>{objective.keyResults?.length || 0} KR</span>
              </div>
              <ProgressBar value={objective.progress} />
            </Link>
          ))}

          {filteredObjectives.length === 0 && (
            <div className={styles.emptyState}>
              <p>선택한 팀에 해당하는 Objectives가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

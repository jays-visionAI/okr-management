import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import styles from './MyOkr.module.css';

export default function MyOkr() {
  const { objectives, fetchObjectives, deleteObjective, isLoading } = useOkrStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'personal' | 'team'>('all');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  const myObjectives = objectives.filter(
    (o) => o.ownerId === user?.id || o.type === 'personal'
  );

  const filteredObjectives = filter === 'all'
    ? myObjectives
    : myObjectives.filter((o) => o.type === filter);

  const handleDelete = async (id: string) => {
    await deleteObjective(id);
    setDeleteModal(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>내 OKR</h1>
          <p className={styles.subtitle}>개인 및 팀 목표를 관리하세요</p>
        </div>
        <Link to="/okr/create">
          <Button>새 Objective 만들기</Button>
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        {(['all', 'personal', 'team'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${filter === tab ? styles.active : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' && '전체'}
            {tab === 'personal' && '개인'}
            {tab === 'team' && '팀'}
            <span className={styles.count}>
              {tab === 'all'
                ? myObjectives.length
                : myObjectives.filter((o) => o.type === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Objectives Grid */}
      {isLoading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : (
        <div className={styles.grid}>
          {filteredObjectives.map((objective) => (
            <Card key={objective.id} className={styles.objectiveCard}>
              <div className={styles.cardHeader}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles[objective.type]}`}>
                    {objective.type === 'team' ? '팀' : '개인'}
                  </span>
                  <span className={`${styles.status} ${styles[objective.status]}`}>
                    {objective.status === 'active' && '진행 중'}
                    {objective.status === 'completed' && '완료'}
                    {objective.status === 'draft' && '초안'}
                  </span>
                </div>
                <div className={styles.actions}>
                  <Link to={`/okr/${objective.id}`} className={styles.actionBtn} title="상세 보기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <Link to={`/okr/${objective.id}/update`} className={styles.actionBtn} title="진행 상황 업데이트">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-4" />
                    </svg>
                  </Link>
                  <button
                    className={styles.actionBtn}
                    title="삭제"
                    onClick={() => setDeleteModal(objective.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <Link to={`/okr/${objective.id}`} className={styles.cardContent}>
                <h3 className={styles.objectiveTitle}>{objective.title}</h3>
                {objective.description && (
                  <p className={styles.objectiveDesc}>{objective.description}</p>
                )}
              </Link>

              <div className={styles.progress}>
                <div className={styles.progressHeader}>
                  <span>진행률</span>
                  <span className={styles.progressValue}>{objective.progress}%</span>
                </div>
                <ProgressBar value={objective.progress} />
              </div>

              <div className={styles.keyResults}>
                <h4>Key Results ({objective.keyResults?.length || 0})</h4>
                <div className={styles.krList}>
                  {objective.keyResults?.slice(0, 3).map((kr) => (
                    <div key={kr.id} className={styles.krItem}>
                      <span className={`${styles.krStatus} ${styles[kr.status]}`} />
                      <span className={styles.krTitle}>{kr.title}</span>
                      <span className={styles.krProgress}>
                        {kr.currentValue}/{kr.targetValue}
                        {kr.unit && ` ${kr.unit}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span>Q{objective.quarter} • {objective.year}</span>
                <span>{objective.startDate} ~ {objective.endDate}</span>
              </div>
            </Card>
          ))}

          {filteredObjectives.length === 0 && (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <h3>Objectives가 없습니다</h3>
              <p>새로운 목표를 설정해보세요</p>
              <Link to="/okr/create">
                <Button>새 Objective 만들기</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Objective 삭제"
      >
        <p className={styles.modalText}>
          이 Objective를 삭제하시겠습니까?<br />
          관련된 Key Results도 함께 삭제됩니다.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteModal && handleDelete(deleteModal)}
          >
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { mockUsers, mockComments } from '../mocks/data';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import styles from './OkrDetail.module.css';

export default function OkrDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentObjective, fetchObjective, deleteObjective, isLoading } = useOkrStore();
  const [commentModal, setCommentModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchObjective(id);
    }
  }, [id, fetchObjective]);

  const owner = currentObjective
    ? mockUsers.find((u) => u.id === currentObjective.ownerId)
    : null;

  const handleDelete = async () => {
    if (id) {
      await deleteObjective(id);
      navigate('/my-okr');
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!currentObjective) {
    return (
      <div className={styles.notFound}>
        <h2>Objective를 찾을 수 없습니다</h2>
        <Link to="/my-okr">
          <Button>목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/my-okr">내 OKR</Link>
        <span>/</span>
        <span>{currentObjective.title}</span>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles[currentObjective.type]}`}>
              {currentObjective.type === 'team' ? '팀' : '개인'}
            </span>
            <span className={`${styles.status} ${styles[currentObjective.status]}`}>
              {currentObjective.status === 'active' && '진행 중'}
              {currentObjective.status === 'completed' && '완료'}
              {currentObjective.status === 'draft' && '초안'}
            </span>
            <span className={styles.period}>
              Q{currentObjective.quarter} • {currentObjective.year}
            </span>
          </div>
          <h1 className={styles.title}>{currentObjective.title}</h1>
          {currentObjective.description && (
            <p className={styles.description}>{currentObjective.description}</p>
          )}
          <div className={styles.meta}>
            <div className={styles.owner}>
              {owner?.avatar && (
                <img src={owner.avatar} alt={owner.name} className={styles.avatar} />
              )}
              <span>{owner?.name}</span>
            </div>
            <span className={styles.date}>
              {currentObjective.startDate} ~ {currentObjective.endDate}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link to={`/okr/${id}/update`}>
            <Button>진행 상황 업데이트</Button>
          </Link>
          <Button variant="secondary" onClick={() => setCommentModal(true)}>
            댓글
          </Button>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            삭제
          </Button>
        </div>
      </header>

      {/* Progress Overview */}
      <Card className={styles.progressCard}>
        <div className={styles.progressOverview}>
          <div className={styles.progressInfo}>
            <h3>전체 진행률</h3>
            <span className={styles.progressValue}>{currentObjective.progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <ProgressBar value={currentObjective.progress} size="lg" />
          </div>
          <div className={styles.progressStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {currentObjective.keyResults?.filter((kr) => kr.status === 'on_track').length || 0}
              </span>
              <span className={styles.statLabel}>정상</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {currentObjective.keyResults?.filter((kr) => kr.status === 'at_risk').length || 0}
              </span>
              <span className={styles.statLabel}>주의</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {currentObjective.keyResults?.filter((kr) => kr.status === 'behind').length || 0}
              </span>
              <span className={styles.statLabel}>지연</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Results */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Key Results</h2>
          <span className={styles.krCount}>
            {currentObjective.keyResults?.length || 0}개
          </span>
        </div>

        <div className={styles.keyResultsList}>
          {currentObjective.keyResults?.map((kr) => {
            const krOwner = mockUsers.find((u) => u.id === kr.ownerId);
            const progress = kr.targetValue > 0
              ? Math.round((kr.currentValue / kr.targetValue) * 100)
              : 0;

            return (
              <Card key={kr.id} className={styles.krCard}>
                <div className={styles.krHeader}>
                  <div className={styles.krTitleRow}>
                    <span className={`${styles.krStatus} ${styles[kr.status]}`} />
                    <h3 className={styles.krTitle}>{kr.title}</h3>
                  </div>
                  <span className={`${styles.krStatusBadge} ${styles[kr.status]}`}>
                    {kr.status === 'on_track' && '정상'}
                    {kr.status === 'at_risk' && '주의'}
                    {kr.status === 'behind' && '지연'}
                    {kr.status === 'completed' && '완료'}
                  </span>
                </div>

                <div className={styles.krProgress}>
                  <div className={styles.krProgressHeader}>
                    <span>
                      {kr.currentValue} / {kr.targetValue}
                      {kr.unit && ` ${kr.unit}`}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} variant={kr.status === 'on_track' ? 'success' : kr.status === 'at_risk' ? 'warning' : 'danger'} />
                </div>

                <div className={styles.krFooter}>
                  <div className={styles.krOwner}>
                    {krOwner?.avatar && (
                      <img src={krOwner.avatar} alt={krOwner.name} className={styles.krAvatar} />
                    )}
                    <span>{krOwner?.name}</span>
                  </div>
                  <span className={styles.krDate}>
                    {kr.startDate} ~ {kr.endDate}
                  </span>
                </div>

                {/* Progress History */}
                {kr.progressUpdates && kr.progressUpdates.length > 0 && (
                  <div className={styles.progressHistory}>
                    <h4>최근 업데이트</h4>
                    {kr.progressUpdates.slice(0, 2).map((update) => {
                      const updater = mockUsers.find((u) => u.id === update.userId);
                      return (
                        <div key={update.id} className={styles.historyItem}>
                          <div className={styles.historyHeader}>
                            <span>{updater?.name}</span>
                            <span className={styles.historyDate}>
                              {new Date(update.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className={styles.historyValue}>
                            {update.value}{kr.unit} {update.note && `- ${update.note}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comment Modal */}
      <Modal isOpen={commentModal} onClose={() => setCommentModal(false)} title="댓글">
        <p className={styles.modalText}>
          댓글 기능은 다음 버전에서 제공됩니다.<br />
          현재 {mockComments.filter(c => c.objectiveId === currentObjective.id).length}개의 댓글이 있습니다.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setCommentModal(false)}>
            닫기
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Objective 삭제">
        <p className={styles.modalText}>
          이 Objective를 삭제하시겠습니까?<br />
          관련된 Key Results도 함께 삭제됩니다.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { mockUsers } from '../mocks/data';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import styles from './ProgressUpdate.module.css';

export default function ProgressUpdate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentObjective, fetchObjective, updateKeyResultProgress, isLoading } = useOkrStore();

  const [updates, setUpdates] = useState<Record<string, { value: string; note: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchObjective(id);
    }
  }, [id, fetchObjective]);

  useEffect(() => {
    if (currentObjective?.keyResults) {
      const initial: Record<string, { value: string; note: string }> = {};
      currentObjective.keyResults.forEach((kr) => {
        initial[kr.id] = {
          value: kr.currentValue.toString(),
          note: '',
        };
      });
      setUpdates(initial);
    }
  }, [currentObjective]);

  const handleUpdate = (krId: string, field: 'value' | 'note', val: string) => {
    setUpdates((prev) => ({
      ...prev,
      [krId]: { ...prev[krId], [field]: val },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      for (const [krId, update] of Object.entries(updates)) {
        const value = parseFloat(update.value);
        if (!isNaN(value)) {
          await updateKeyResultProgress(krId, value, update.note || undefined);
        }
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(`/okr/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !currentObjective) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>진행 상황 업데이트</h1>
        <p className={styles.subtitle}>{currentObjective.title}</p>
      </header>

      {success && (
        <div className={styles.successMessage}>
          진행 상황이 성공적으로 업데이트되었습니다!
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Results 업데이트</h2>
          <p className={styles.sectionDesc}>
            각 Key Result의 현재 값을 입력하고 메모를 추가하세요.
          </p>

          <div className={styles.keyResults}>
            {currentObjective.keyResults?.map((kr, index) => {
              const progress = kr.targetValue > 0
                ? Math.round((parseFloat(updates[kr.id]?.value || '0') / kr.targetValue) * 100)
                : 0;
              const krOwner = mockUsers.find((u) => u.id === kr.ownerId);

              return (
                <div key={kr.id} className={styles.krItem}>
                  <div className={styles.krHeader}>
                    <span className={styles.krNumber}>{index + 1}</span>
                    <div className={styles.krInfo}>
                      <h3 className={styles.krTitle}>{kr.title}</h3>
                      <div className={styles.krMeta}>
                        {krOwner && (
                          <span className={styles.owner}>
                            <img src={krOwner.avatar} alt={krOwner.name} />
                            {krOwner.name}
                          </span>
                        )}
                        <span className={styles.target}>
                          목표: {kr.targetValue}{kr.unit}
                        </span>
                      </div>
                    </div>
                    <span className={`${styles.krStatus} ${styles[kr.status]}`}>
                      {kr.status === 'on_track' && '정상'}
                      {kr.status === 'at_risk' && '주의'}
                      {kr.status === 'behind' && '지연'}
                    </span>
                  </div>

                  <div className={styles.krInput}>
                    <div className={styles.valueInput}>
                      <Input
                        type="number"
                        label="현재값"
                        value={updates[kr.id]?.value || ''}
                        onChange={(e) => handleUpdate(kr.id, 'value', e.target.value)}
                        min={0}
                        max={kr.type === 'boolean' ? 1 : undefined}
                        step={kr.type === 'percentage' ? 0.1 : 1}
                      />
                      {kr.unit && kr.type !== 'boolean' && (
                        <span className={styles.unit}>{kr.unit}</span>
                      )}
                    </div>
                    <div className={styles.noteInput}>
                      <Input
                        label="메모 (선택)"
                        placeholder="진행 상황에 대한 메모를 입력하세요"
                        value={updates[kr.id]?.note || ''}
                        onChange={(e) => handleUpdate(kr.id, 'note', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.krPreview}>
                    <div className={styles.previewHeader}>
                      <span>예상 진행률</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar
                      value={progress}
                      variant={
                        progress >= 100 ? 'success' :
                        progress >= 60 ? 'success' :
                        progress >= 30 ? 'warning' : 'danger'
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={submitting || success}>
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}

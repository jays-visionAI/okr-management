import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOkrStore } from '../store/okrStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import styles from './OkrCreate.module.css';

interface KeyResultInput {
  title: string;
  type: 'numeric' | 'percentage' | 'boolean' | 'currency';
  targetValue: string;
  unit: string;
}

export default function OkrCreate() {
  const navigate = useNavigate();
  const { createObjective, isLoading } = useOkrStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'personal' | 'team'>('personal');
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyResults, setKeyResults] = useState<KeyResultInput[]>([
    { title: '', type: 'percentage', targetValue: '', unit: '%' },
  ]);
  const [error, setError] = useState('');

  const addKeyResult = () => {
    setKeyResults([...keyResults, { title: '', type: 'percentage', targetValue: '', unit: '%' }]);
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  const updateKeyResult = (index: number, field: keyof KeyResultInput, value: string) => {
    const updated = [...keyResults];
    updated[index] = { ...updated[index], [field]: value };
    setKeyResults(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('목표 제목을 입력해주세요.');
      return;
    }

    const validKeyResults = keyResults.filter((kr) => kr.title.trim() && kr.targetValue);
    if (validKeyResults.length === 0) {
      setError('최소 1개의 Key Result를 입력해주세요.');
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      year,
      quarter,
      startDate: startDate || `${year}-01-01`,
      endDate: endDate || `${year}-03-31`,
      keyResults: validKeyResults.map((kr) => ({
        title: kr.title.trim(),
        type: kr.type,
        targetValue: parseFloat(kr.targetValue) || 0,
        unit: kr.unit || undefined,
        ownerId: user?.id || 'user-1',
        startDate: startDate || `${year}-01-01`,
        endDate: endDate || `${year}-03-31`,
      })),
    };

    const result = await createObjective(data);
    if (result) {
      navigate(`/okr/${result.id}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>새 Objective 만들기</h1>
        <p className={styles.subtitle}>목표와 Key Results를 작성하여 달성 가능한 목표를 설정하세요</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info */}
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>

          <div className={styles.field}>
            <Input
              label="Objective 제목 *"
              placeholder="달성하고 싶은 목표를 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>설명</label>
            <textarea
              className={styles.textarea}
              placeholder="목표에 대한 상세 설명을 입력하세요 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>유형</label>
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="type"
                    value="personal"
                    checked={type === 'personal'}
                    onChange={() => setType('personal')}
                  />
                  <span>개인</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="type"
                    value="team"
                    checked={type === 'team'}
                    onChange={() => setType('team')}
                  />
                  <span>팀</span>
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>분기</label>
              <div className={styles.quarterGroup}>
                {([1, 2, 3, 4] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`${styles.quarterBtn} ${quarter === q ? styles.active : ''}`}
                    onClick={() => setQuarter(q)}
                  >
                    Q{q}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <Input
                label="연도"
                type="number"
                value={year.toString()}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2020}
                max={2030}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <Input
                label="시작일"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <Input
                label="종료일"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Key Results */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Key Results</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addKeyResult}>
              + 추가
            </Button>
          </div>

          <div className={styles.keyResults}>
            {keyResults.map((kr, index) => (
              <div key={index} className={styles.keyResultItem}>
                <div className={styles.krNumber}>{index + 1}</div>
                <div className={styles.krFields}>
                  <Input
                    placeholder="Key Result 제목을 입력하세요"
                    value={kr.title}
                    onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                  />
                  <div className={styles.krMeta}>
                    <select
                      className={styles.select}
                      value={kr.type}
                      onChange={(e) => updateKeyResult(index, 'type', e.target.value)}
                    >
                      <option value="percentage">퍼센트 (%)</option>
                      <option value="numeric">숫자</option>
                      <option value="currency">금액</option>
                      <option value="boolean">완료/미완료</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="목표값"
                      value={kr.targetValue}
                      onChange={(e) => updateKeyResult(index, 'targetValue', e.target.value)}
                      style={{ width: '120px' }}
                    />
                    {kr.type !== 'boolean' && (
                      <Input
                        placeholder="단위"
                        value={kr.unit}
                        onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                        style={{ width: '80px' }}
                      />
                    )}
                  </div>
                </div>
                {keyResults.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeKeyResult(index)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {error && <div className={styles.error}>{error}</div>}

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : 'Objective 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}

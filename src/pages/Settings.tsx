import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const { showToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    progress_updates: true,
    comments: true,
    deadlines: true,
    weekly_report: false,
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', '프로필이 저장되었습니다.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', '비밀번호가 일치하지 않습니다.');
      return;
    }
    showToast('success', '비밀번호가 변경되었습니다.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
    showToast('success', '설정이 저장되었습니다.');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>설정</h1>
        <p className={styles.subtitle}>계정 및 알림 설정을 관리하세요</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['profile', 'security', 'notifications', 'team'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'profile' && '프로필'}
            {tab === 'security' && '보안'}
            {tab === 'notifications' && '알림'}
            {tab === 'team' && '팀 관리'}
          </button>
        )))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>프로필 정보</h2>

          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <Button variant="secondary" size="sm">아바타 변경</Button>
          </div>

          <form onSubmit={handleProfileSave} className={styles.form}>
            <Input
              label="이름"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <Input
              label="이메일"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <Input
              label="부서"
              value={profileForm.department}
              onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
            />
            <div className={styles.actions}>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>비밀번호 변경</h2>

          <form onSubmit={handlePasswordChange} className={styles.form}>
            <Input
              label="현재 비밀번호"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="새 비밀번호"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
            <div className={styles.actions}>
              <Button type="submit">비밀번호 변경</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>알림 설정</h2>

          <div className={styles.notificationList}>
            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4>이메일 알림</h4>
                <p>중요한 업데이트를 이메일로 받습니다</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notificationSettings.email_notifications}
                  onChange={() => handleNotificationChange('email_notifications')}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4>진행 상황 업데이트</h4>
                <p>Key Result 진행률이 업데이트될 때 알림</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notificationSettings.progress_updates}
                  onChange={() => handleNotificationChange('progress_updates')}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4>댓글 알림</h4>
                <p>나에 대한 댓글이나 멘션 시 알림</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notificationSettings.comments}
                  onChange={() => handleNotificationChange('comments')}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4>마감일 알림</h4>
                <p>목표 마감일이 다가올 때 미리 알림</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notificationSettings.deadlines}
                  onChange={() => handleNotificationChange('deadlines')}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4>주간 리포트</h4>
                <p>매주 OKR 진행状況 요약 받기</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notificationSettings.weekly_report}
                  onChange={() => handleNotificationChange('weekly_report')}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>팀 관리</h2>

          <div className={styles.teamInfo}>
            <div className={styles.teamDetail}>
              <span className={styles.teamLabel}>소속 팀</span>
              <span className={styles.teamValue}>
                {user?.teamId ? 'Frontend Team' : '없음'}
              </span>
            </div>
            <div className={styles.teamDetail}>
              <span className={styles.teamLabel}>역할</span>
              <span className={styles.teamValue}>
                {user?.role === 'admin' && '관리자'}
                {user?.role === 'manager' && '매니저'}
                {user?.role === 'member' && '팀원'}
              </span>
            </div>
          </div>

          <div className={styles.teamActions}>
            <Button variant="secondary">팀 정보 수정</Button>
            <Button variant="secondary">팀원 초대</Button>
          </div>

          <p className={styles.teamNote}>
            * 팀 관리는 매니저 이상 권한이 필요합니다.
          </p>
        </Card>
      )}
    </div>
  );
}

import { User, Team, Objective, KeyResult, ProgressUpdate, Comment, Notification, DashboardStats } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'sarah.lee@company.com',
    name: '이Sarah',
    department: 'Engineering',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    teamId: 'team-1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-2',
    email: 'james.kim@company.com',
    name: '김James',
    department: 'Engineering',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    teamId: 'team-1',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'user-3',
    email: 'emma.park@company.com',
    name: '박Emma',
    department: 'Marketing',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    teamId: 'team-2',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
  },
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Frontend Team',
    description: 'Responsible for frontend development',
    leaderId: 'user-1',
    memberIds: ['user-1', 'user-2'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'team-2',
    name: 'Marketing Team',
    description: 'Marketing and growth initiatives',
    leaderId: 'user-3',
    memberIds: ['user-3'],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
  },
];

// Mock Key Results
export const mockKeyResults: KeyResult[] = [
  {
    id: 'kr-1',
    objectiveId: 'obj-1',
    title: '성능 점수 90 이상 달성',
    type: 'percentage',
    targetValue: 90,
    currentValue: 72,
    unit: '%',
    status: 'on_track',
    ownerId: 'user-1',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'kr-2',
    objectiveId: 'obj-1',
    title: 'LCP 최적화로 로딩 시간 2초 이하',
    type: 'numeric',
    targetValue: 2,
    currentValue: 2.4,
    unit: '초',
    status: 'at_risk',
    ownerId: 'user-1',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'kr-3',
    objectiveId: 'obj-2',
    title: '새로운 컴포넌트 라이브러리 도입',
    type: 'boolean',
    targetValue: 1,
    currentValue: 0,
    status: 'behind',
    ownerId: 'user-2',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'kr-4',
    objectiveId: 'obj-3',
    title: '사용자 리뷰 4.5점 이상 달성',
    type: 'percentage',
    targetValue: 4.5,
    currentValue: 4.2,
    unit: '점',
    status: 'at_risk',
    ownerId: 'user-1',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-14T10:00:00Z',
  },
];

// Mock Objectives
export const mockObjectives: Objective[] = [
  {
    id: 'obj-1',
    title: '웹사이트 성능 최적화로用户体验 향상',
    description: 'Core Web Vitals 점수를 개선하여 사용자 만족도를 높입니다.',
    type: 'team',
    year: 2024,
    quarter: 1,
    status: 'active',
    ownerId: 'user-1',
    teamId: 'team-1',
    progress: 65,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    keyResults: [mockKeyResults[0], mockKeyResults[1]],
  },
  {
    id: 'obj-2',
    title: '개발 프로세스 표준화',
    description: '일관된 코딩 표준과 리뷰 프로세스를 수립합니다.',
    type: 'team',
    year: 2024,
    quarter: 1,
    status: 'active',
    ownerId: 'user-2',
    teamId: 'team-1',
    progress: 30,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    keyResults: [mockKeyResults[2]],
  },
  {
    id: 'obj-3',
    title: '고객 만족도 20% 향상',
    description: '서비스 품질 개선으로 고객 만족도를 높입니다.',
    type: 'personal',
    year: 2024,
    quarter: 1,
    status: 'active',
    ownerId: 'user-1',
    progress: 55,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-14T10:00:00Z',
    keyResults: [mockKeyResults[3]],
  },
  {
    id: 'obj-4',
    title: '마케팅 캠페인 3개 성공적 실행',
    description: 'Q1 마케팅 활동의 성과를 극대화합니다.',
    type: 'team',
    year: 2024,
    quarter: 1,
    status: 'completed',
    ownerId: 'user-3',
    teamId: 'team-2',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-31T18:00:00Z',
  },
];

// Mock Progress Updates
export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: 'pu-1',
    keyResultId: 'kr-1',
    userId: 'user-1',
    value: 72,
    note: '성능 최적화 작업 진행 중. 이미지 지연 로딩 적용 완료.',
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'pu-2',
    keyResultId: 'kr-2',
    userId: 'user-1',
    value: 2.4,
    note: 'LCP 개선을 위한 CDN 설정 최적화 진행 예정.',
    createdAt: '2024-03-14T10:00:00Z',
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    objectiveId: 'obj-1',
    userId: 'user-2',
    content: '@user-1 성능 개선 작업이 잘 진행되고 있네요. 혹시 다음 주 스프린트에서 추가 작업 가능할까요?',
    mentions: ['user-1'],
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
    user: mockUsers[1],
  },
  {
    id: 'comment-2',
    objectiveId: 'obj-1',
    userId: 'user-1',
    content: '@user-2 네, 가능합니다. 리소스 할당해서 진행하겠습니다.',
    mentions: ['user-2'],
    createdAt: '2024-03-15T15:30:00Z',
    updatedAt: '2024-03-15T15:30:00Z',
    user: mockUsers[0],
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'comment',
    title: '새 댓글',
    message: 'James Kim님이 obj-1에 댓글을 남겼습니다.',
    isRead: false,
    relatedId: 'obj-1',
    createdAt: '2024-03-15T14:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'progress_update',
    title: '진행 상황 업데이트',
    message: 'kr-1의 진행률이 72%로 업데이트되었습니다.',
    isRead: false,
    relatedId: 'kr-1',
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'deadline',
    title: '마감일 임박',
    message: 'obj-1의 마감일이 2주 남았습니다.',
    isRead: true,
    relatedId: 'obj-1',
    createdAt: '2024-03-14T09:00:00Z',
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalObjectives: 12,
  completedObjectives: 4,
  activeObjectives: 7,
  overallProgress: 68,
  teamProgress: 72,
  personalProgress: 65,
  quarterlyTrend: [
    { quarter: '1월', progress: 45 },
    { quarter: '2월', progress: 58 },
    { quarter: '3월', progress: 68 },
  ],
  topPerformers: [
    { name: '박Emma', progress: 95 },
    { name: '이Sarah', progress: 88 },
    { name: '김James', progress: 72 },
  ],
};

// Helper to get current quarter
export const getCurrentQuarter = (): 1 | 2 | 3 | 4 => {
  const month = new Date().getMonth();
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
};

export const getCurrentYear = (): number => new Date().getFullYear();
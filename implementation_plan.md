# Implementation Plan: OKR Management System

## Summary
블루포지 임직원을 위한 OKR(Objectives and Key Results) 관리 시스템을 구축합니다. React Frontend + Express API Server + PostgreSQL 아키텍처로, 바우하우스 스타일의 반응형 웹 인터페이스를 제공합니다.

## Scope
### In Scope
- **인증 시스템**: 로그인, 세션 관리, 역할 기반 접근 제어
- **OKR CRUD**: Objective와 Key Result 생성, 수정, 삭제
- **팀 OKR**: 팀 단위 목표 설정 및 팀원 목표 정렬
- **진행 추적**: Key Result별 진행률 업데이트 및 히스토리
- **대시보드**: 데이터 시각화 (Recharts), 의사결정 지원 인사이트
- **코멘트/알림**: OKR 코멘트, 진행 상황 알림, @멘션

### Out of Scope
- 데이터 내보내기 (PDF/CSV)
- OKR 템플릿
- 외부 SSO 연동
- 모바일 네이티브 앱

## Planned Changes

### Phase 1: Project Setup
| File | Action | Purpose |
|------|--------|---------|
| package.json | Create | 프로젝트 의존성 정의 |
| vite.config.ts | Create | Vite 빌드 설정 |
| tsconfig.json | Create | TypeScript 설정 |
| index.html | Create | 진입점 HTML |
| src/main.tsx | Create | React 엔트리 포인트 |
| src/App.tsx | Create | 라우팅 설정 |

### Phase 2: Shared Components & Styles
| File | Action | Purpose |
|------|--------|---------|
| src/styles/globals.css | Create | 바우하우스 글로벌 스타일 |
| src/styles/variables.css | Create | CSS 변수 (색상, 간격) |
| src/components/ui/Button.tsx | Create | 재사용 버튼 컴포넌트 |
| src/components/ui/Input.tsx | Create | 재사용 입력 컴포넌트 |
| src/components/ui/Card.tsx | Create | 카드 컴포넌트 |
| src/components/ui/Modal.tsx | Create | 모달 컴포넌트 |
| src/components/ui/ProgressBar.tsx | Create | 진행률 바 컴포넌트 |
| src/components/layout/Header.tsx | Create | 헤더 레이아웃 |
| src/components/layout/Sidebar.tsx | Create | 사이드바 레이아웃 |

### Phase 3: API Layer (Mock)
| File | Action | Purpose |
|------|--------|---------|
| src/api/client.ts | Create | API 클라이언트 설정 |
| src/api/auth.ts | Create | 인증 API 함수 |
| src/api/okr.ts | Create | OKR API 함수 |
| src/api/team.ts | Create | 팀 API 함수 |
| src/mocks/handlers.ts | Create | MSW 핸들러 |
| src/mocks/data.ts | Create | Mock 데이터 |

### Phase 4: State Management
| File | Action | Purpose |
|------|--------|---------|
| src/store/authStore.ts | Create | 인증 상태 (Zustand) |
| src/store/okrStore.ts | Create | OKR 상태 (Zustand) |
| src/store/uiStore.ts | Create | UI 상태 (Zustand) |

### Phase 5: Screen Components
| File | Action | Purpose |
|------|--------|---------|
| src/pages/Login.tsx | Create | 로그인 화면 |
| src/pages/Dashboard.tsx | Create | 대시보드 (메인) |
| src/pages/MyOkr.tsx | Create | 내 OKR 목록 |
| src/pages/TeamOkr.tsx | Create | 팀 OKR 목록 |
| src/pages/OkrDetail.tsx | Create | OKR 상세 뷰 |
| src/pages/OkrCreate.tsx | Create | OKR 생성 폼 |
| src/pages/ProgressUpdate.tsx | Create | 진행 상황 업데이트 |
| src/pages/AnalysisReport.tsx | Create | 분석 리포트 |
| src/pages/Settings.tsx | Create | 설정 화면 |
| src/pages/NotFound.tsx | Create | 404 에러 |

### Phase 6: Dashboard Charts
| File | Action | Purpose |
|------|--------|---------|
| src/components/charts/ProgressChart.tsx | Create | 진행률 차트 (Recharts) |
| src/components/charts/TrendChart.tsx | Create | 트렌드 차트 |
| src/components/charts/TeamChart.tsx | Create | 팀별 현황 차트 |

### Phase 7: Express Backend (Phase 2)
| File | Action | Purpose |
|------|--------|---------|
| server/index.js | Create | Express 서버 진입점 |
| server/routes/auth.js | Create | 인증 라우트 |
| server/routes/okr.js | Create | OKR 라우트 |
| server/routes/team.js | Create | 팀 라우트 |
| server/middleware/auth.js | Create | 인증 미들웨어 |
| server/db/schema.sql | Create | PostgreSQL 스키마 |

## Technical Approach

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router v6** for routing
- **Zustand** for state management
- **Recharts** for data visualization
- **CSS Modules** for styling (Bauhaus aesthetic)

### Backend Stack
- **Express.js** REST API
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing

### Architecture Pattern
```
src/
├── api/          # API calls
├── components/   # React components
│   ├── ui/       # Reusable UI components
│   ├── layout/   # Layout components
│   └── charts/   # Chart components
├── pages/        # Page components
├── store/        # Zustand stores
├── mocks/        # MSW mock data
├── styles/       # Global styles
└── types/        # TypeScript types
```

### Bauhaus Design System
- Primary colors: Red (#E53935), Blue (#1E88E5), Yellow (#FDD835)
- Geometric shapes, clean typography
- High contrast, functional aesthetics
- Grid-based layout

## Estimated Complexity
**High** — Full-stack application with 10 screens, 8 features, 7 entities

## Risk Assessment
- **Mock → Real DB migration**: Keep API layer abstracted for easy backend swap
- **Bauhaus styling**: May need refinement for readability; start with accessible defaults
- **Chart complexity**: Recharts has learning curve; use simple chart types first

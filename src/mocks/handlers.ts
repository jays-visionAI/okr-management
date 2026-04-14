import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockTeams,
  mockObjectives,
  mockKeyResults,
  mockProgressUpdates,
  mockComments,
  mockNotifications,
  mockDashboardStats,
  getCurrentQuarter,
  getCurrentYear,
} from './data';
import { CreateObjectiveRequest } from '../api/okr';

// In-memory data store for mutations
let objectives = [...mockObjectives];
let keyResults = [...mockKeyResults];
let progressUpdates = [...mockProgressUpdates];
let comments = [...mockComments];
let notifications = [...mockNotifications];

// Helper functions
const getObjectiveWithKeyResults = (id: string) => {
  const objective = objectives.find((o) => o.id === id);
  if (objective) {
    return {
      ...objective,
      keyResults: keyResults.filter((kr) => kr.objectiveId === id),
    };
  }
  return null;
};

const calculateProgress = (krList: typeof keyResults) => {
  if (krList.length === 0) return 0;
  const totalProgress = krList.reduce((sum, kr) => {
    const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
    return sum + Math.min(progress, 100);
  }, 0);
  return Math.round(totalProgress / krList.length);
};

const getStatusFromProgress = (progress: number): 'on_track' | 'at_risk' | 'behind' | 'completed' => {
  if (progress >= 100) return 'completed';
  if (progress >= 60) return 'on_track';
  if (progress >= 30) return 'at_risk';
  return 'behind';
};

// Export handlers
export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { email: string; password: string };
    const user = mockUsers.find((u) => u.email === body.email);
    
    if (user && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user,
          token: `mock-jwt-token-${user.id}`,
        },
      });
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'Invalid email or password' },
    }, { status: 401 });
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(300);
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const userId = token.replace('mock-jwt-token-', '');
      const user = mockUsers.find((u) => u.id === userId);
      
      if (user) {
        return HttpResponse.json({ success: true, data: user });
      }
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    }, { status: 401 });
  }),

  // Objectives handlers
  http.get('/api/objectives', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const quarter = url.searchParams.get('quarter');
    const year = url.searchParams.get('year');

    let filtered = [...objectives];

    if (type) filtered = filtered.filter((o) => o.type === type);
    if (status) filtered = filtered.filter((o) => o.status === status);
    if (quarter) filtered = filtered.filter((o) => o.quarter === parseInt(quarter));
    if (year) filtered = filtered.filter((o) => o.year === parseInt(year));

    return HttpResponse.json({
      success: true,
      data: filtered.map((o) => ({
        ...o,
        keyResults: keyResults.filter((kr) => kr.objectiveId === o.id),
      })),
    });
  }),

  http.get('/api/objectives/:id', async ({ params }) => {
    await delay(300);
    const objective = getObjectiveWithKeyResults(params.id as string);
    
    if (objective) {
      return HttpResponse.json({ success: true, data: objective });
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Objective not found' },
    }, { status: 404 });
  }),

  http.post('/api/objectives', async ({ request }) => {
    await delay(500);
    const body = await request.json() as CreateObjectiveRequest;
    const newId = `obj-${Date.now()}`;
    
    const newObjective = {
      id: newId,
      title: body.title,
      description: body.description,
      type: body.type,
      year: body.year,
      quarter: body.quarter,
      status: 'draft' as const,
      ownerId: mockUsers[0].id,
      teamId: body.teamId,
      parentObjectiveId: body.parentObjectiveId,
      progress: 0,
      startDate: body.startDate,
      endDate: body.endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keyResults: [],
    };
    
    objectives.push(newObjective);
    
    // Create key results
    if (body.keyResults) {
      for (const kr of body.keyResults) {
        const newKr = {
          id: `kr-${Date.now()}-${Math.random()}`,
          objectiveId: newId,
          ...kr,
          currentValue: 0,
          status: 'behind' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        keyResults.push(newKr);
        newObjective.keyResults?.push(newKr);
      }
    }
    
    return HttpResponse.json({ success: true, data: newObjective }, { status: 201 });
  }),

  http.patch('/api/objectives/:id', async ({ params, request }) => {
    await delay(400);
    const body = await request.json() as Partial<typeof objectives[0]>;
    const index = objectives.findIndex((o) => o.id === params.id);
    
    if (index !== -1) {
      objectives[index] = {
        ...objectives[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json({ success: true, data: objectives[index] });
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Objective not found' },
    }, { status: 404 });
  }),

  http.delete('/api/objectives/:id', async ({ params }) => {
    await delay(300);
    const index = objectives.findIndex((o) => o.id === params.id);
    
    if (index !== -1) {
      objectives.splice(index, 1);
      // Also delete related key results
      keyResults = keyResults.filter((kr) => kr.objectiveId !== params.id);
      return HttpResponse.json({ success: true });
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Objective not found' },
    }, { status: 404 });
  }),

  // Progress update handler
  http.post('/api/key-results/:id/progress', async ({ params, request }) => {
    await delay(400);
    const body = await request.json() as { value: number; note?: string };
    const kr = keyResults.find((k) => k.id === params.id);
    
    if (kr) {
      kr.currentValue = body.value;
      kr.updatedAt = new Date().toISOString();
      
      const progress = (kr.currentValue / kr.targetValue) * 100;
      kr.status = getStatusFromProgress(progress);
      
      // Update parent objective progress
      const objective = objectives.find((o) => o.id === kr.objectiveId);
      if (objective) {
        const krList = keyResults.filter((k) => k.objectiveId === objective.id);
        objective.progress = calculateProgress(krList);
        objective.updatedAt = new Date().toISOString();
      }
      
      const update = {
        id: `pu-${Date.now()}`,
        keyResultId: kr.id,
        userId: mockUsers[0].id,
        value: body.value,
        note: body.note,
        createdAt: new Date().toISOString(),
      };
      progressUpdates.push(update);
      
      return HttpResponse.json({ success: true, data: update });
    }
    
    return HttpResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Key result not found' },
    }, { status: 404 });
  }),

  // Comments handlers
  http.get('/api/objectives/:id/comments', async ({ params }) => {
    await delay(300);
    const objComments = comments.filter((c) => c.objectiveId === params.id);
    return HttpResponse.json({ success: true, data: objComments });
  }),

  http.post('/api/objectives/:id/comments', async ({ params, request }) => {
    await delay(400);
    const body = await request.json() as { content: string; keyResultId?: string; mentions?: string[] };
    const newComment = {
      id: `comment-${Date.now()}`,
      objectiveId: params.id as string,
      keyResultId: body.keyResultId,
      userId: mockUsers[0].id,
      content: body.content,
      mentions: body.mentions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: mockUsers[0],
    };
    comments.push(newComment);
    return HttpResponse.json({ success: true, data: newComment }, { status: 201 });
  }),

  // Teams handlers
  http.get('/api/teams', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockTeams });
  }),

  http.get('/api/teams/:id', async ({ params }) => {
    await delay(300);
    const team = mockTeams.find((t) => t.id === params.id);
    if (team) {
      return HttpResponse.json({ success: true, data: team });
    }
    return HttpResponse.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Team not found' },
    }, { status: 404 });
  }),

  // Dashboard stats
  http.get('/api/dashboard/stats', async () => {
    await delay(400);
    return HttpResponse.json({ success: true, data: mockDashboardStats });
  }),

  // Notifications
  http.get('/api/notifications', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: notifications });
  }),
];

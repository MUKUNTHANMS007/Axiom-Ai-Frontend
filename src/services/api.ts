const API_BASE_URL = 'https://aether-backend-n7ss.onrender.com';

export interface ProjectInput {
  description: string;
  budget?: string;
  team_size?: string;
  timeline?: string;
  existing_tech?: string;
  project_type?: string;
  experience_level?: string;
}

export interface Risk {
  title: string;
  description: string;
  severity?: string;
}

export interface Competitor {
  name: string;
  description: string;
}

export interface AnalysisResult {
  project_title: string;
  project_summary: string;
  complexity: string;
  estimated_timeline: string;
  confidence_score: number;
  languages: Language[];
  frameworks: Framework[];
  build_platforms: any[];
  deploy_platforms: any[];
  budget_breakdown: any;
  best_budget_stack: any;
  architecture_patterns: any[];
  key_considerations: string[];
  mvp_roadmap: string[];
  potential_risks: Risk[];
  market_analysis?: {
    potential_competitors: Competitor[];
    market_opportunity: string;
    startup_viability?: string;
    growth_strategy: string;
    risk_mitigation: string;
  };
}

export const analyzeProject = async (project: ProjectInput, user_id?: string, modelId: string = 'groq/llama-3.3-70b-versatile', project_id?: string): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project,
      model_id: modelId,
      user_id: user_id,
      project_id: project_id
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze project');
  }

  return response.json();
};

export const getQuickSummary = async (description: string, modelId: string = 'groq/llama-3.3-70b-versatile'): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/quick-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description, model_id: modelId }),
  });

  if (!response.ok) throw new Error('Failed to get summary');
  const data = await response.json();
  return data.summary;
};

export const suggestProjectName = async (description: string, modelId: string = 'groq/llama-3.3-70b-versatile'): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/suggest-name`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description, model_id: modelId }),
  });

  if (!response.ok) throw new Error('Failed to suggest name');
  const data = await response.json();
  return data.name;
};

export interface HistoryItem {
  id: string;
  name: string;
  stack: string[];
  score: number;
  created_at: string;
  result_json: AnalysisResult;
}

export const fetchHistory = async (user_id?: string): Promise<HistoryItem[]> => {
  const url = user_id ? `${API_BASE_URL}/api/v1/history?user_id=${encodeURIComponent(user_id)}` : `${API_BASE_URL}/api/v1/history`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};

export const saveStack = async (user_id: string, name: string, tech_slugs: string[], description: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/stacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, name, tech_slugs, description }),
  });
  if (!response.ok) throw new Error('Failed to save stack');
  return response.json();
};

export const fetchSavedStacks = async (user_id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/stacks/${encodeURIComponent(user_id)}`);
  if (!response.ok) throw new Error('Failed to fetch stacks');
  return response.json();
};

export interface AnalyticsData {
  total_syntheses: number;
  total_saved_stacks: number;
  average_score: number;
  top_frameworks: { name: string; count: number }[];
  activity: { date: string; syntheses: number }[];
  tokens_saved: number;
  strategic_insights?: {
    project_title: string;
    market_opportunity: string;
    competitors: string[];
    growth_strategy: string;
  }[];
}

export const fetchAnalytics = async (user_id: string): Promise<AnalyticsData> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/${encodeURIComponent(user_id)}`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'voice.webm');

  const response = await fetch(`${API_BASE_URL}/api/v1/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Transcription failed');
  }

  const data = await response.json();
  return data.text;
};

export interface TeamMemberProfile {
  name: string;
  role: string;
  skills: string[];
}

export interface Language {
  name: string;
  icon: string;
  type?: string;
  reason: string;
  detailed_reasoning?: string[];
  match: number;
  use_case: string;
  docs_url?: string;
}

export interface Framework {
  name: string;
  icon: string;
  category: string;
  reason: string;
  detailed_reasoning?: string[];
  match: number;
  docs_url: string;
  learning_curve: string;
}

export interface BuildPlatform {
  name: string;
  icon: string;
  type: string;
  purpose: string;
  pricing: string;
  monthly_estimate: string;
  free_tier: boolean;
  setup_time: string;
  docs_url?: string;
}

export interface DeployPlatform {
  name: string;
  icon: string;
  type: string;
  purpose: string;
  pricing: string;
  monthly_estimate: string;
  budget_fit: string;
  scalability: string;
  free_tier: boolean;
  best_for: string;
  docs_url?: string;
}

export interface TaskAssignment {
  status: 'success' | 'error';
  validation_error?: string | null;
  assigned_to: string;
  confidence: number;
  rationale: string;
  estimated_effort: string;
}

export const assignTask = async (task: string, team_members: TeamMemberProfile[]): Promise<TaskAssignment> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/assign-task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, team_members }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Task assignment failed');
  }
  return response.json();
};

// ─── COLLABORATION API ────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: string;
  created_at: string;
  project_members?: { user_id: string; role: string }[];
}

export interface ProjectInvite {
  id: string;
  project_id: string;
  invited_by: string;
  invited_username?: string;
  token: string;
  status: string;
  created_at: string;
  projects?: { name: string; description: string; owner_id: string };
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  status: string;
  priority: string;
  estimated_effort?: string;
  ai_confidence?: number;
  ai_rationale?: string;
  created_at: string;
  updated_at: string;
  task_updates?: TaskUpdate[];
  projects?: { name: string };
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  old_status: string;
  new_status: string;
  created_at: string;
}

export const createProject = async (name: string, description: string, owner_id: string): Promise<Project> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, owner_id }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};

export const fetchProjects = async (user_id: string): Promise<Project[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/projects/${encodeURIComponent(user_id)}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export const fetchProject = async (project_id: string): Promise<Project> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/project/${project_id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
};

export const updateProject = async (project_id: string, name: string, description: string): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/project/${project_id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
};

export const deleteProject = async (project_id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/project/${project_id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
};

export const removeMember = async (project_id: string, user_id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/projects/${project_id}/members/${encodeURIComponent(user_id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove member');
};

export const searchUsers = async (q: string): Promise<{ username: string }[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
};

export const createInvite = async (project_id: string, invited_by: string, invited_username?: string, invited_email?: string): Promise<ProjectInvite> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/invites`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id, invited_by, invited_username, invited_email }),
  });
  if (!res.ok) throw new Error('Failed to send invite');
  return res.json();
};

export const fetchInviteByToken = async (token: string): Promise<ProjectInvite> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/invites/token/${token}`);
  if (!res.ok) throw new Error('Invite not found');
  return res.json();
};

export const respondToInvite = async (token: string, user_id: string, action: 'accept' | 'reject') => {
  const res = await fetch(`${API_BASE_URL}/api/v1/invites/token/${token}/respond`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, action }),
  });
  if (!res.ok) throw new Error('Failed to respond to invite');
  return res.json();
};

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (user_id: string): Promise<Notification[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/${encodeURIComponent(user_id)}`);
  if (!res.ok) return [];
  return res.json();
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to mark as read');
};

export const fetchPendingInvites = async (username: string): Promise<ProjectInvite[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/invites/pending/${encodeURIComponent(username)}`);
  if (!res.ok) return [];
  return res.json();
};

export const createTask = async (task: Omit<Task, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Task> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};

export const fetchProjectTasks = async (project_id: string): Promise<Task[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks/project/${project_id}`);
  if (!res.ok) return [];
  return res.json();
};

export const fetchUserTasks = async (user_id: string): Promise<Task[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks/user/${encodeURIComponent(user_id)}`);
  if (!res.ok) return [];
  return res.json();
};

export const updateTaskStatus = async (task_id: string, user_id: string, new_status: string, message: string) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks/${task_id}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, new_status, message }),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

export const fetchWorkflowTaskUpdates = async (project_ids: string[]): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/workflow/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project_ids),
  });
  if (!res.ok) return [];
  return res.json();
};

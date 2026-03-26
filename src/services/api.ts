const API_BASE_URL = 'http://localhost:8000';

export interface ProjectInput {
  description: string;
  budget?: string;
  team_size?: string;
  timeline?: string;
  existing_tech?: string;
  project_type?: string;
  experience_level?: string;
}

export interface AnalysisResult {
  project_title: string;
  project_summary: string;
  complexity: string;
  estimated_timeline: string;
  confidence_score: number;
  languages: any[];
  frameworks: any[];
  build_platforms: any[];
  deploy_platforms: any[];
  budget_breakdown: any;
  best_budget_stack: any;
  architecture_patterns: any[];
  key_considerations: string[];
  mvp_roadmap: string[];
  potential_risks: string[];
}

export const analyzeProject = async (project: ProjectInput, modelId: string = 'groq/llama-3.3-70b-versatile'): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project,
      model_id: modelId,
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

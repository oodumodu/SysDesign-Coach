export enum SectionStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  NEEDS_REVISION = 'NEEDS_REVISION',
  PASSED = 'PASSED',
}

export interface ProblemDefinition {
  id: string;
  title: string;
  description: string;
}

export interface SectionConfig {
  id: string;
  category: string;
  title: string;
  description: string;
  placeholder: string;
}

export interface SectionState {
  id: string;
  content: string;
  status: SectionStatus;
  feedback: string | null;
}

export interface GradeResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}
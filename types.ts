
export interface ThinkingData {
  interpretation: string;
  visualApproach: string;
  prompts: string[];
  styleConsiderations: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
  images: string[]; // base64 encoded strings
  thinking?: ThinkingData;
  isError?: boolean;
  sources?: GroundingSource[];
}

export enum ViewState {
  Initial,
  Chat,
}
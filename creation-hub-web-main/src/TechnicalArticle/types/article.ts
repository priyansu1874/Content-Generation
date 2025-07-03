export interface FormData {
  organizationName: string;
  articleTitle: string;
  targetAudience: string[];
  targetAudienceRaw?: string; // Added for raw target audience
  technologyFocus: string;
  articleObjective: string;
  toneOfArticle: string;
  exampleReferences: string;
  keywords: string[];
  keywordsRaw?: string; // Added for raw keywords
  uploadedImages: File[];
  authorName: string;
  webhookResponse?: string; // Added for webhook response
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export type ToggleMemoryStatusRequestBody = {
    memoryCardId: string;
    status: 'active' | 'hidden';
  };

  export type UpdateMemoryCardRequestBody = {
    memoryCardId: string;
    title: string;
    content: string;
    confidence: 'high' | 'medium' | 'low';
  };
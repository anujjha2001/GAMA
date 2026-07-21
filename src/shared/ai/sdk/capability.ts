import { ToolSchema } from './tool';

export interface Capability {
  id: string;
  name: string;
  enabled: boolean;
  tools: ToolSchema[];
}

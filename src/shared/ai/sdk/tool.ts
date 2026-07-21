export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  keywords: string[];
  handler: (args: any) => Promise<any>;
}

export function registerTool(tool: ToolSchema): ToolSchema {
  return tool;
}

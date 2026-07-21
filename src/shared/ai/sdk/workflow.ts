export interface WorkflowStep {
  name: string;
  run: (context: any) => Promise<any>;
}

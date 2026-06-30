export interface IComponent {
  showLabelAsHint: boolean;
  id: string;
  name: string;
  type: 'boolean' | 'cron' | 'number' | 'string' | 'file' | 'list_string';
  label: string;
  value: string;
  uploadProgress: string;
}

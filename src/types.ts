export type FileEntry = {
  contents: string;
  meta?: Record<string, string>;
};

export type FunctionEntry = {
  id: string;
  binId: string;
  name: string;
};

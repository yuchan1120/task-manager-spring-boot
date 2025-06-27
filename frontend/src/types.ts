export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  tagIds?: number[];
};

// 新規作成時の入力型（id は不要）
export type NewTask = {
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  tagIds?: number[];
};

export type Tag = {
  id: number;
  name: string;
};

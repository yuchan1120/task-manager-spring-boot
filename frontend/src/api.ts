// src/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE = 'http://localhost:8080/api/tasks';

// タスクの型定義
export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

// 新規作成時の入力型（id は不要）
export type NewTask = Omit<Task, 'id'>;

// タスク取得
export const getTasks = (): Promise<AxiosResponse<Task[]>> => {
  return axios.get(API_BASE);
};

// タスク追加
export const addTask = (task: NewTask): Promise<AxiosResponse<Task>> => {
  return axios.post(API_BASE, task);
};

// 完了状態の切り替え
export const toggleTask = (id: number): Promise<AxiosResponse<Task>> => {
  return axios.put(`${API_BASE}/${id}/toggle`);
};

// タスク削除
export const deleteTask = (id: number): Promise<AxiosResponse<void>> => {
  return axios.delete(`${API_BASE}/${id}`);
};

// タスク更新
export const updateTask = (
  id: number,
  data: Partial<Omit<Task, 'id'>>
): Promise<AxiosResponse<Task>> => {
  return axios.put(`${API_BASE}/${id}`, data);
};

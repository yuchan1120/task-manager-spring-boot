// src/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE = 'http://localhost:8080/api/tasks';

// タスクの型定義
export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string; // ISO形式の文字列（例: "2025-06-20"）
};

// 新規作成時の入力型（id は不要）
export type NewTask = Omit<Task, 'id'>;

export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const login = (username: string, password: string) => {
  return axios.post('http://localhost:8080/api/auth/login', { username, password });
};

export const validateToken = () => {
  return axios.get('http://localhost:8080/api/auth/validate', getAuthHeader());
};

export const getTasks = (): Promise<AxiosResponse<Task[]>> => {
  return axios.get(API_BASE, getAuthHeader());
};

export const addTask = (task: NewTask): Promise<AxiosResponse<Task>> => {
  return axios.post(API_BASE, task, getAuthHeader());
};

export const toggleTask = (id: number): Promise<AxiosResponse<Task>> => {
  return axios.put(`${API_BASE}/${id}/toggle`, null, getAuthHeader());
};

export const deleteTask = (id: number): Promise<AxiosResponse<void>> => {
  return axios.delete(`${API_BASE}/${id}`, getAuthHeader());
};

export const updateTask = (
  id: number,
  data: Partial<Omit<Task, 'id'>>
): Promise<AxiosResponse<Task>> => {
  return axios.put(`${API_BASE}/${id}`, data, getAuthHeader());
};


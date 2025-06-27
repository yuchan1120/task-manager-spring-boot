import axios, { AxiosResponse } from 'axios';
import { NewTask, Task } from './types';

const API_BASE = 'http://localhost:8080/api/tasks';
const TAG_API_BASE = 'http://localhost:8080/api/tags';

// タグの型定義
export type Tag = {
  id: number;
  name: string;
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// 認証関連
export const login = (username: string, password: string) => {
  return axios.post('http://localhost:8080/api/auth/login', { username, password });
};

export const validateToken = () => {
  return axios.get('http://localhost:8080/api/auth/validate', getAuthHeader());
};

// タスク関連API
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
  data: Partial<NewTask>
): Promise<AxiosResponse<Task>> => {
  return axios.put(`${API_BASE}/${id}`, data, getAuthHeader());
};

// タグ関連API
export const getTags = (): Promise<AxiosResponse<Tag[]>> => {
  return axios.get(TAG_API_BASE, getAuthHeader());
};

export const addTag = (name: string): Promise<AxiosResponse<Tag>> => {
  return axios.post(TAG_API_BASE, { name }, getAuthHeader());
};

export const updateTag = (id: number, name: string): Promise<AxiosResponse<Tag>> => {
  return axios.put(`${TAG_API_BASE}/${id}`, { name }, getAuthHeader());
};

export const deleteTag = (id: number): Promise<AxiosResponse<void>> => {
  return axios.delete(`${TAG_API_BASE}/${id}`, getAuthHeader());
};

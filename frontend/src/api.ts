import axios, { AxiosResponse } from 'axios';
import { NewTask, Tag, Task } from './types';

// APIベースURL
const BASE_URL = 'http://localhost:8080/api';
const TASK_API = `${BASE_URL}/tasks`;
const TAG_API = `${BASE_URL}/tags`;
const AUTH_API = `${BASE_URL}/auth`;

// 認証ヘッダー取得
const getAuthHeader = () => {
  const token = localStorage.getItem('jwt');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 認証関連API
export const login = (username: string, password: string) =>
  axios.post(`${AUTH_API}/login`, { username, password });

export const validateToken = () =>
  axios.get(`${AUTH_API}/validate`, getAuthHeader());

// タスク関連API
export const getTasks = (): Promise<AxiosResponse<Task[]>> =>
  axios.get(TASK_API, getAuthHeader());

export const addTask = (task: NewTask): Promise<AxiosResponse<Task>> =>
  axios.post(TASK_API, task, getAuthHeader());

export const toggleTask = (id: number): Promise<AxiosResponse<Task>> =>
  axios.put(`${TASK_API}/${id}/toggle`, null, getAuthHeader());

export const deleteTask = (id: number): Promise<AxiosResponse<void>> =>
  axios.delete(`${TASK_API}/${id}`, getAuthHeader());

export const updateTask = (
  id: number,
  data: Partial<NewTask>
): Promise<AxiosResponse<Task>> =>
  axios.put(`${TASK_API}/${id}`, data, getAuthHeader());

// タグ関連API
export const getTags = (): Promise<AxiosResponse<Tag[]>> =>
  axios.get(TAG_API, getAuthHeader());

export const addTag = (name: string): Promise<AxiosResponse<Tag>> =>
  axios.post(TAG_API, { name }, getAuthHeader());

export const updateTag = (id: number, name: string): Promise<AxiosResponse<Tag>> =>
  axios.put(`${TAG_API}/${id}`, { name }, getAuthHeader());

export const deleteTag = (id: number): Promise<AxiosResponse<void>> =>
  axios.delete(`${TAG_API}/${id}`, getAuthHeader());

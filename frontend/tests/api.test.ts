import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
  Task,
  NewTask,
  login
} from '../src/api';

describe('API 関数のテスト', () => {
  const mock = new MockAdapter(axios);
  const API_BASE = 'http://localhost:8080/api/tasks';

  afterEach(() => {
    mock.reset();
  });

  test('login: 正常にトークンを取得できる', async () => {
    const mockToken = { token: 'mock-token' };
    mock.onPost('http://localhost:8080/api/auth/login').reply(200, mockToken);

    const response = await login('user', 'pass');
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockToken);
  });


  test('getTasks: タスク一覧を取得できる', async () => {
    const mockData: Task[] = [
      { id: 1, title: 'タスク1', description: '説明1', completed: false }
    ];
    mock.onGet(API_BASE).reply(200, mockData);

    const response = await getTasks();
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });

  test('addTask: 新しいタスクを追加できる', async () => {
    const newTask: NewTask = {
      title: '新規タスク',
      description: '説明',
      completed: false
    };
    const createdTask: Task = { id: 1, ...newTask };

    mock.onPost(API_BASE, newTask).reply(201, createdTask);

    const response = await addTask(newTask);
    expect(response.status).toBe(201);
    expect(response.data).toEqual(createdTask);
  });

  test('toggleTask: タスクの完了状態を切り替えられる', async () => {
    const toggledTask: Task = {
      id: 1,
      title: 'タスク1',
      description: '説明1',
      completed: true
    };
    mock.onPut(`${API_BASE}/1/toggle`).reply(200, toggledTask);

    const response = await toggleTask(1);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(toggledTask);
  });

  test('deleteTask: タスクを削除できる', async () => {
    mock.onDelete(`${API_BASE}/1`).reply(204);

    const response = await deleteTask(1);
    expect(response.status).toBe(204);
  });

  test('updateTask: タスクを更新できる', async () => {
    const updatedData = { title: '更新後タイトル' };
    const updatedTask: Task = {
      id: 1,
      title: '更新後タイトル',
      description: '説明1',
      completed: false
    };
    mock.onPut(`${API_BASE}/1`, updatedData).reply(200, updatedTask);

    const response = await updateTask(1, updatedData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedTask);
  });
});

// frontend/tests/api.test.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
  getTags,
  addTag,
  updateTag,
  deleteTag,
  login,
  validateToken,
  Tag,
} from '../src/api';
import { NewTask, Task } from '../src/types';

const mock = new MockAdapter(axios);
const token = 'test-token';
localStorage.setItem('jwt', token);

describe('API Tests', () => {
  afterEach(() => {
    mock.reset();
  });

  const authHeader = { Authorization: `Bearer ${token}` };

  it('should login successfully', async () => {
    const responseData = { token: 'abc123' };
    mock.onPost('http://localhost:8080/api/auth/login').reply(200, responseData);

    const response = await login('user', 'pass');
    expect(response.data).toEqual(responseData);
  });

  it('should validate token', async () => {
    mock.onGet('http://localhost:8080/api/auth/validate').reply(200, { valid: true });

    const response = await validateToken();
    expect(response.data.valid).toBe(true);
  });

  it('should fetch tasks', async () => {
    const tasks: Task[] = [{ id: 1, title: 'Test', description: 'Desc', completed: false }];
    mock.onGet('http://localhost:8080/api/tasks').reply(200, tasks);

    const response = await getTasks();
    expect(response.data).toEqual(tasks);
  });

  it('should add a task', async () => {
    const newTask: NewTask = { title: 'New', description: 'Task', completed: false };
    const createdTask: Task = { id: 2, ...newTask };
    mock.onPost('http://localhost:8080/api/tasks').reply(200, createdTask);

    const response = await addTask(newTask);
    expect(response.data).toEqual(createdTask);
  });

  it('should toggle a task', async () => {
    const toggledTask: Task = { id: 1, title: 'Test', description: 'Desc', completed: true };
    mock.onPut('http://localhost:8080/api/tasks/1/toggle').reply(200, toggledTask);

    const response = await toggleTask(1);
    expect(response.data.completed).toBe(true);
  });

  it('should delete a task', async () => {
    mock.onDelete('http://localhost:8080/api/tasks/1').reply(200);

    const response = await deleteTask(1);
    expect(response.status).toBe(200);
  });

  it('should update a task', async () => {
    const updatedTask: Task = { id: 1, title: 'Updated', description: 'Updated', completed: false };
    mock.onPut('http://localhost:8080/api/tasks/1').reply(200, updatedTask);

    const response = await updateTask(1, { title: 'Updated', description: 'Updated' });
    expect(response.data.title).toBe('Updated');
  });

  it('should fetch tags', async () => {
    const tags: Tag[] = [{ id: 1, name: 'Urgent' }];
    mock.onGet('http://localhost:8080/api/tags').reply(200, tags);

    const response = await getTags();
    expect(response.data).toEqual(tags);
  });

  it('should add a tag', async () => {
    const newTag: Tag = { id: 2, name: 'Work' };
    mock.onPost('http://localhost:8080/api/tags').reply(200, newTag);

    const response = await addTag('Work');
    expect(response.data.name).toBe('Work');
  });

  it('should update a tag', async () => {
    const updatedTag: Tag = { id: 1, name: 'UpdatedTag' };
    mock.onPut('http://localhost:8080/api/tags/1').reply(200, updatedTag);

    const response = await updateTag(1, 'UpdatedTag');
    expect(response.data.name).toBe('UpdatedTag');
  });

  it('should delete a tag', async () => {
    mock.onDelete('http://localhost:8080/api/tags/1').reply(200);

    const response = await deleteTag(1);
    expect(response.status).toBe(200);
  });
});

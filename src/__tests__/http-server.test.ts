import http from 'node:http';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { startHTTPServer } from '../server.js';
import { dispatcher } from '../dispatcher.js';
import { isUserId } from '../helpers/validators.js';

describe('Scenario 1', () => {
  let server: http.Server | null = null;
  const user = {
    username: 'John Doe',
    age: 42,
    hobbies: ['fishing', 'hunting'],
  };
  const user2 = {
    username: 'Jane Doe',
    age: 21,
    hobbies: ['knitting'],
  };
  let userId = '';

  beforeAll(async () => {
    server = await startHTTPServer('localhost', 3000, dispatcher);
  });

  afterAll(() => {
    server?.close();
  });

  it('1. Get all records with a GET api/users request (an empty array is expected)', async () => {
    const response = await request('http://localhost:3000/').get('api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject([]);
  });

  it('2. Create a user with a POST api/users request', async () => {
    const response = await request('http://localhost:3000/').post('api/users').send(user);

    userId = response.body.id;
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(user);
    expect(typeof userId).toBe('string');
    expect(isUserId(userId)).toBe(true);
  });

  it('3. Get user created on a previous step with a GET api/users/:userId request', async () => {
    const response = await request('http://localhost:3000/').get(`api/users/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(user);
    expect(response.body.id).toBe(userId);
  });

  it('4. Update created user with a PUT api/users/:userId request', async () => {
    const response = await request('http://localhost:3000/').put(`api/users/${userId}`).send(user2);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(user2);
    expect(response.body.id).toBe(userId);
  });

  it('5. Delete created user with a DELETE api/users/:userId request', async () => {
    const response = await request('http://localhost:3000/').delete(`api/users/${userId}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });

  it('6. Check that user has been deleted with a GET api/users/:userId request', async () => {
    const response = await request('http://localhost:3000/').get(`api/users/${userId}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });
});

describe('Scenario 2', () => {
  let server: http.Server | null = null;
  const user = {
    username: 'John Doe',
    age: 42,
    hobbies: ['fishing', 'hunting'],
  };
  const validUUID = '6ae109bd-a2c4-4a6c-a3b2-c9d9169330f0';
  let userId = '';

  beforeAll(() => {
    server = startHTTPServer('localhost', 3001, dispatcher);
  });

  afterAll(() => {
    server?.close();
  });

  it('1. Perform request with unsupported HTTP method', async () => {
    const response = await request('http://localhost:3001/').patch('api/users');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid HTTP method');
  });

  it('2. Perform request to non-existing endpoint', async () => {
    const response = await request('http://localhost:3001/').post('not/exists');

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: Request to non-existing endpoint');
  });

  it('3. Attempt to get user using userId in invalid format', async () => {
    const response = await request('http://localhost:3001/').get('api/users/invalid');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('4. Attempt to get user with non-existing userId', async () => {
    const response = await request('http://localhost:3001/').get(`api/users/${validUUID}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });

  it('5. Attempt to create user with not all required fields provided', async () => {
    const response = await request('http://localhost:3001/').post('api/users').send({
      username: 'Martin',
      age: 27,
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid user data: required fields are missing or have wrong format');
  });

  it('6. Attempt to update user with non-existing userId', async () => {
    const response = await request('http://localhost:3001/').put(`api/users/${validUUID}`).send(user);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });

  it('7. Create a user with a POST api/users request', async () => {
    const response = await request('http://localhost:3001/').post('api/users').send(user);

    userId = response.body.id;
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(user);
    expect(typeof userId).toBe('string');
    expect(isUserId(userId)).toBe(true);
  });

  it('8. Attempt to update created user using userId in invalid format', async () => {
    const response = await request('http://localhost:3001/').put('api/users/invalid').send(user);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('9. Attempt to update created user with not all required fields provided', async () => {
    const response = await request('http://localhost:3001/').put(`api/users/${userId}`).send({
      age: 42,
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid user data: required fields are missing or have wrong format');
  });

  it('10. Attempt to delete created user using userId in invalid format', async () => {
    const response = await request('http://localhost:3001/').delete('api/users/invalid');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('11. Attempt to delete user with non-existing userId', async () => {
    const response = await request('http://localhost:3001/').delete(`api/users/${validUUID}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });
});

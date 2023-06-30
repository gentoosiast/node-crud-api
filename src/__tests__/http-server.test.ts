import http from 'node:http';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { startHTTPServer } from '../server.js';
import { dispatcher } from '../dispatcher.js';

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

  beforeAll(() => {
    server = startHTTPServer('localhost', 3000, dispatcher);
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
  });
});

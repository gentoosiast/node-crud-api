import http from 'node:http';
import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { startHTTPServer } from '../server.js';
import { createDispatcher } from '../dispatcher.js';
import { isUserId } from '../helpers/validators.js';
import { User } from '../types/users.js';

describe('Scenario 1', () => {
  let server: http.Server | null = null;
  const userDto1 = {
    username: 'John Doe',
    age: 42,
    hobbies: ['fishing', 'hunting'],
  };
  const userDto2 = {
    username: 'Jane Doe',
    age: 21,
    hobbies: ['knitting'],
  };
  let userId = '';
  const SERVER_PORT = 3000;
  const BASE_URL = `http://localhost:${SERVER_PORT}/`;

  beforeAll(async () => {
    server = await startHTTPServer('localhost', SERVER_PORT, await createDispatcher());
  });

  afterAll(() => {
    server?.close();
  });

  it('1. Get all records with a GET api/users request (an empty array is expected)', async () => {
    const response = await request(BASE_URL).get('api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject([]);
  });

  it('2. Create a user with a POST api/users request', async () => {
    const response = await request(BASE_URL).post('api/users').send(userDto1);

    userId = response.body.id;
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(userDto1);
    expect(typeof userId).toBe('string');
    expect(isUserId(userId)).toBe(true);
  });

  it('3. Get user created on a previous step with a GET api/users/:userId request', async () => {
    const response = await request(BASE_URL).get(`api/users/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(userDto1);
    expect(response.body.id).toBe(userId);
  });

  it('4. Update created user with a PUT api/users/:userId request', async () => {
    const response = await request(BASE_URL).put(`api/users/${userId}`).send(userDto2);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(userDto2);
    expect(response.body.id).toBe(userId);
  });

  it('5. Delete created user with a DELETE api/users/:userId request', async () => {
    const response = await request(BASE_URL).delete(`api/users/${userId}`);

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });

  it('6. Check that user has been deleted with a GET api/users/:userId request', async () => {
    const response = await request(BASE_URL).get(`api/users/${userId}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });
});

describe('Scenario 2', () => {
  let server: http.Server | null = null;
  const userDto = {
    username: 'John Doe',
    age: 42,
    hobbies: ['fishing', 'hunting'],
  };
  const validUUID = '6ae109bd-a2c4-4a6c-a3b2-c9d9169330f0';
  let userId = '';
  const SERVER_PORT = 3001;
  const BASE_URL = `http://localhost:${SERVER_PORT}/`;

  beforeAll(async () => {
    server = await startHTTPServer('localhost', SERVER_PORT, await createDispatcher());
  });

  afterAll(() => {
    server?.close();
  });

  it('1. Perform request with unsupported HTTP method', async () => {
    const response = await request(BASE_URL).patch('api/users');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid HTTP method');
  });

  it('2. Perform request to non-existing endpoint', async () => {
    const response = await request(BASE_URL).post('not/exists');

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: Request to non-existing endpoint');
  });

  it('3. Attempt to get user using userId in invalid format', async () => {
    const response = await request(BASE_URL).get('api/users/invalid');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('4. Attempt to get user with non-existing userId', async () => {
    const response = await request(BASE_URL).get(`api/users/${validUUID}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });

  it('5. Attempt to create user with not all required fields provided', async () => {
    const response = await request(BASE_URL).post('api/users').send({
      username: 'Martin',
      age: 27,
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid user data: required fields are missing or have wrong format');
  });

  it('6. Attempt to update user with non-existing userId', async () => {
    const response = await request(BASE_URL).put(`api/users/${validUUID}`).send(userDto);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });

  it('7. Create a user with a POST api/users request', async () => {
    const response = await request(BASE_URL).post('api/users').send(userDto);

    userId = response.body.id;
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(userDto);
    expect(typeof userId).toBe('string');
    expect(isUserId(userId)).toBe(true);
  });

  it('8. Attempt to update created user using userId in invalid format', async () => {
    const response = await request(BASE_URL).put('api/users/invalid').send(userDto);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('9. Attempt to update created user with not all required fields provided', async () => {
    const response = await request(BASE_URL).put(`api/users/${userId}`).send({
      age: 42,
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid user data: required fields are missing or have wrong format');
  });

  it('10. Attempt to delete created user using userId in invalid format', async () => {
    const response = await request(BASE_URL).delete('api/users/invalid');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Error: Invalid UUID format');
  });

  it('11. Attempt to delete user with non-existing userId', async () => {
    const response = await request(BASE_URL).delete(`api/users/${validUUID}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Error: User not found');
  });
});

describe('Scenario 3', () => {
  let server: http.Server | null = null;
  const userDto1 = {
    username: 'John Doe',
    age: 42,
    hobbies: ['fishing', 'hunting'],
  };
  const userDto2 = {
    username: 'Jane Doe',
    age: 21,
    hobbies: ['knitting'],
  };
  let user1: User | null = null;
  let user2: User | null = null;
  const validUUID = '6ae109bd-a2c4-4a6c-a3b2-c9d9169330f0';
  const SERVER_PORT = 3002;
  const BASE_URL = `http://localhost:${SERVER_PORT}/`;

  beforeAll(async () => {
    server = await startHTTPServer('localhost', SERVER_PORT, await createDispatcher());
  });

  afterAll(() => {
    server?.close();
  });

  it('1. Create a user with a POST api/users request', async () => {
    const response = await request(BASE_URL).post('api/users').send(userDto1);

    expect(response.statusCode).toBe(201);
    user1 = response.body;
    expect(user1).toMatchObject(userDto1);
    expect(typeof user1?.id).toBe('string');
    expect(isUserId(user1?.id)).toBe(true);
  });

  it('2. Create another user with a POST api/users request with the same properties as previous user', async () => {
    const response = await request(BASE_URL).post('api/users').send(userDto1);

    expect(response.statusCode).toBe(201);
    user2 = response.body;
    expect(user2).toMatchObject(userDto1);
    expect(typeof user2?.id).toBe('string');
    expect(isUserId(user2?.id)).toBe(true);
  });

  it('3. Get all users with a GET api/users request and check that both created users are present', async () => {
    const response = await request(BASE_URL).get('api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual(expect.arrayContaining([user1, user2]));
  });

  it('4. Create user with a POST api/users request and try to provide valid UUID as a part of body', async () => {
    const response = await request(BASE_URL)
      .post('api/users')
      .send({ ...userDto1, id: validUUID });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(userDto1);
    expect(typeof response.body.id).toBe('string');
    expect(isUserId(response.body.id)).toBe(true);
    expect(response.body.id).not.toBe(validUUID);
  });

  it('5. Update created user with a PUT api/users/:userId request and try to provide valid UUID as a part of body', async () => {
    const response = await request(BASE_URL)
      .put(`api/users/${user1?.id}`)
      .send({ ...userDto2, id: validUUID });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(userDto2);
    expect(response.body.id).toBe(user1?.id);
  });
});

# CRUD HTTP server with cluster mode and round-robin load balancer

[RS School NodeJS 2023 Q2 - Week 3 Task](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## Usage

### Installation

- Install with `npm install`

### Configuration via .env

Create `.env` and specify port on which you want to run the server. Example `.env.sample` is provided for reference. If `.env` is missing and environment variable `PORT` is undefined, server will use default port `4000`.

### Starting application

There are four different modes of operation:

- Run with `npm run start:dev` to launch single server instance in development mode
- Run with `npm run start:prod` to launch single server instance in production mode
- Run with `npm run start:multi:dev` to launch server in cluster mode wih round-robin load balancer in development mode
- Run with `npm run start:multi:prod` to launch server in cluster mode with round-robin load balancer in production mode

In Cluster Mode there are multiple instances of the application using the Node.js `Cluster API` (equal to the number of available parallelism - 1 on the host machine, each listening on port PORT + n) with a load balancer that distributes requests across them (using Round-robin algorithm).

Note: my implementation allows making HTTP requests not only to port of master process, but also to ports of worker processes. State of in-memory database should be consistent in all possible cases.

### Running tests

Use `npm t` to run provided integration tests (3 different scenarios are provided)

## API

- **GET** `api/users` is used to get all users
  - Server answers with `status code` **200** and all users records
- **GET** `api/users/{userId}` gets user with provided `userId`
  - Server answers with `status code` **200** and user record with `id === userId` if it exists
  - Server answers with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server answers with `status code` **404** and corresponding message if user record with `id === userId` doesn't exist
- **POST** `api/users` creates new user and stores it in in-memory database

  - Server answers with `status code` **201** and newly created user record
  - Server answers with `status code` **400** and corresponding message if request `body` does not contain **required** fields

- **PUT** `api/users/{userId}` updates existing user with provided `userId`

  - Server answers with `status code` **200** and updated user record
  - Server answers with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server answers with `status code` **400** and corresponding message if request `body` does not contain **required** fields
  - Server answers with `status code` **404** and corresponding message if user record with `id === userId` doesn't exist

- **DELETE** `api/users/{userId}` deletes existing user with provided `userId`
  - Server answers with `status code` **204** if the user record is found and deleted
  - Server answers with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server answers with `status code` **404** and corresponding message if user record with `id === userId` doesn't exist

Bodies of **POST** and **PUT** requests **must be** in the following format:

- `username` — user's name (`string`, **required**)
- `age` — user's age (`number`, **required**)
- `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

Requests to non-existing endpoints (e.g. `some-non/existing/resource`) are handled (server answers with `status code` **404** and corresponding human-friendly message)

Errors on the server side that occur during the processing of a request are handled and processed correctly (server answers with `status code` **500** and corresponding human-friendly message)

Users are stored in in-memory database and have following properties:

- `id` — unique identifier (`string`, `uuid`) generated on server side
- `username` — user's name (`string`, **required**)
- `age` — user's age (`number`, **required**)
- `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

## Project dependencies

My implementation doesn't use any external dependencies, with the exception of `dotenv` only builtin Node.js modules are used. But there are dependencies for bundling the project, for running the project and watching for source code changes, for testing, etc..

- TypeScript because my project is 100% TypeScript implementation: `typescript`
- ESLint and its plugins which are used for detecting code errors early: `eslint`, `eslint-config-prettier`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-import`, `eslint-import-resolver-typescript`
- Prettier formatter which I use for formatting source code in a consistent way: `prettier`
- Webpack and its plugins which are used for bundling project modules into single executable JavaScript file: `webpack`, `webpack-cli`, `ts-loader`
- nodemon which is used for running server in development mode and watching for source code changes: `nodemon`
- ts-node which is used for transpiling TypeScript modules on the fly for use by nodemon: `ts-node`
- dotenv which is used for parsing `.env` configs: `dotenv`
- Jest with its dependencies & SuperTest are used for performing integration tests: `jest`, `ts-jest`, `babel-jest`, `@babel/preset-env`, `supertest`
- Type definitions for comfortable TypeScript development: `@types/node`, `@types/supertest`

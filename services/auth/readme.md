# Pavilion Backend - Auth Microservice

This is the auth microservice app of the backend part of the Pavilion application, a social network app.

## Overview

The auth microservice handles user authentication and authorization for the Pavilion application.

## Features

- User registration
- User login
- Token-based authentication

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **TypeScript**: Superset of JavaScript
- **Prisma**: ORM for database management
- **Redis**: In-memory data structure store for caching and session management
- **JWT**: JSON Web Tokens for secure authentication
- **Biomejs**: linter and formatter 

## Getting Started

To get started with the auth microservice, follow these steps:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Configure environment variables.
4. Run the application using `npm start`.

## Endpoints

1. **Login**
   - Endpoint: `/api/v1/login`
   - Method: `POST`
   - Description: Authenticates a user and returns a token.

2. **Register**
   - Endpoint: `/api/v1/register`
   - Method: `POST`
   - Description: Registers a new user.

3. **Refresh**
   - Endpoint: `/api/v1/refresh`
   - Method: `POST`
   - Description: Refreshes the authentication token.

4. **Logout**
   - Endpoint: `/api/v1/logout`
   - Method: `POST`
   - Description: Logs out the user and invalidates the token.

## License

This project is licensed under the MIT License.

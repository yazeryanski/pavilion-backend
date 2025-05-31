# Express TypeScript Boilerplate

This is a boilerplate project for building a RESTful API using Express and TypeScript. It provides a solid foundation for your Node.js applications with a clean and organized architecture.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
- [Headers](#headers)

## Features

- Express.js for building the server
- TypeScript for static typing
- Pre-configured Biome.js for code quality and formatting
- Nodemon for automatic server restarts during development
- Environment variables management with dotenv
- Prisma for database management
- Basic folder structure for scalability

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x) or yarn (>= 1.x)

### Installation

1. Clone the repository:
	```sh
	git clone https://github.com/yazeryanski/express-ts-boilerplate.git
	cd express-ts-boilerplate
	```

2. Install dependencies:
	```sh
	npm install
	# or
	yarn install
	```

3. Copy and paste `.env.example` to `.env` and fill in the details.

4. Start the development server:
	```sh
	npm run dev
	# or
	yarn dev
	```

## Project Structure

```
/D:/www/express-ts-boilerplate/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── types/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── index.ts
├── .env
├── .env.example
├── .biomerc
├── package.json
├── tsconfig.json
└── README.md
```

- **src/controllers**: Define route handlers.
- **src/middlewares**: Custom middleware functions.
- **src/models**: Define data models.
- **src/routes**: Define application routes.
- **src/services**: Business logic and services.
- **src/utils**: Utility functions and helpers.
- **src/index.ts**: Entry point of the application.

## Scripts

- `npm run dev` or `yarn dev`: Start the development server with hot reloading.
- `npm run build` or `yarn build`: Compile TypeScript to JavaScript.
- `npm start` or `yarn start`: Start the production server.
- `npm run lint` or `yarn lint`: Run Biome.js for code quality.
- `npm run format` or `yarn format`: Format code with Biome.js.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Headers

Each endpoint requires the following headers:
- `x-user-id`
- `x-service-name`
- `x-request-id`
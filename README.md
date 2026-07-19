# Chat Application

This is a full-stack chat application featuring a Spring Boot backend and a React (Vite) frontend. The application uses PostgreSQL for data persistence.

## Project Structure

The repository is structured as a monorepo containing both the frontend and backend applications:

- `backend/`: Java Spring Boot backend application (built with Maven).
- `frontend/`: React frontend application built with Vite and Tailwind CSS.
- `compose.yaml`: Docker Compose configuration to easily spin up the application and its dependencies (like PostgreSQL).

## Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) (recommended for easy setup)
- Java 21 (if running backend locally without Docker)
- Node.js & npm (if running frontend locally)

### Running with Docker Compose (Recommended)

1. **Set Environment Variables**: Create a `.env` file in the root of the project with your database credentials:
   ```env
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   ```

2. **Start the Application**:
   Run the following command from the root directory to build and start the backend and PostgreSQL database:
   ```bash
   docker compose up --build
   ```
   *Note: Ensure your frontend is either served through the backend or you run it separately for development.*

### Running for Development

#### Backend
1. Navigate to the `backend` directory.
2. Run the application using the Maven wrapper:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

#### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Java, Spring Boot
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

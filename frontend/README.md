# Next.js v15 Frontend Application with TypeScript, ShadCN UI, Azure Entra SSO Login, Tailwind CSS, and FastAPI Backend Integration

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It is built with TypeScript, ShadCN UI components, and Tailwind CSS for styling. The application supports Azure Entra SSO Login for authentication and communicates with a FastAPI backend service to interact with a local or inference provided LLM.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js v22**: [Download and install Node.js](https://nodejs.org/).
- **Yarn v4.9**: Install Yarn globally using `npm install -g yarn`.
- **Python 3.10+**: Required for the FastAPI backend.

## Getting Started

### 1. Install Dependencies

Navigate to the `frontend` directory and install the required dependencies:

```bash
yarn set version stable
yarn install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory and add the following environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 3. Run the Development Server

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 4. Backend Setup

The frontend communicates with a FastAPI backend service. Follow these steps to set up the backend:

1. Navigate to the `backend` directory:

   ```bash
   cd ../backend
   ```

2. Create a virtual environment and activate it:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:

   ```bash
   hypercorn main:app --bind 0.0.0.0:{$PORT}
   ```

The backend will be available at [http://localhost:4000](http://localhost:4000).

## Features

- **Next.js v15**: A React framework for building fast and scalable web applications.
- **TypeScript**: Strongly typed programming language for better developer experience.
- **ShadCN UI**: Pre-built UI components for rapid development.
- **Azure Entra SSO Login**: Secure authentication using Azure Active Directory.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **FastAPI Backend**: High-performance backend framework for Python.
- **Local LLM Integration**: Communicates with a local or inference provided Large Language Model for advanced AI capabilities.

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Learn about TypeScript.
- [ShadCN UI Documentation](https://shadcn.dev/) - Learn about ShadCN UI components.
- [Azure Entra SSO Documentation](https://learn.microsoft.com/en-us/azure/active-directory/) - Learn about Azure Active Directory.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Learn about FastAPI.

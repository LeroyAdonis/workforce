# Project Guidelines

This document provides essential information for development, build, and testing in this project.

## 1. Build and Configuration Instructions

### Core Technologies
- **Next.js 16.2.2**: Note that this version contains breaking changes from earlier versions. Refer to `node_modules/next/dist/docs/` for specific API details.
- **Tailwind CSS 4**: The latest version of Tailwind is used.
- **Drizzle ORM & Neon**: PostgreSQL with Neon serverless driver.
- **Better-auth**: Authentication is handled via `better-auth`.
- **Zod**: Used for all API request validation.

### Environment Setup
The project uses `dotenv-cli` to manage environment variables from `.env.local`. 
Ensure you have a `.env.local` file with the following:
```env
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

### Database Management
- **Generate Migrations**: `npm run db:generate`
- **Apply Migrations**: `npm run db:migrate`
- **Push Schema (Dev)**: `npm run db:push` (Uses `dotenv-cli` internally)
- **Seed Data**: `npm run db:seed`
- **Database Studio**: `npm run db:studio`

## 2. Testing Information

### Running Tests
The project does not use a traditional testing framework like Vitest or Jest. Instead, tests are written as TypeScript scripts and executed using `tsx`.

- **Run a test script**: 
  ```bash
  npx tsx <path-to-script>
  ```
- **Run a test with environment variables**:
  ```bash
  dotenv-cli -e .env.local -- npx tsx <path-to-script>
  ```

### Current Test Scripts
- **Database Table Check**: `npm run db:test` (runs `scripts/test-auth-tables.ts`)
- **Utility Tests**: `npx tsx scripts/test-utils.ts` (manually created for verification)

### Adding New Tests
1. Create a new file in `scripts/` or a dedicated `tests/` directory.
2. Import the logic you want to test.
3. Use simple assertions or console logs to verify behavior.
4. Exit with a non-zero code on failure (`process.exit(1)`).

Example test template:
```typescript
import { someFunction } from "../src/lib/some-module";

async function runTest() {
  console.log("Testing someFunction...");
  const result = await someFunction();
  if (result !== "expected") {
    console.error("Test failed!");
    process.exit(1);
  }
  console.log("✓ Test passed!");
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
```

## 3. Additional Development Information

### API Conventions
- **Standardized Responses**: Use `src/lib/api/responses.ts` for consistent API output.
  - `successResponse(data, meta?)`
  - `errorResponse(message, status, details?)`
  - `errors.notFound()`, `errors.badRequest()`, etc.
- **Validation**: All API routes should validate input using Zod schemas found in `src/lib/validations/`.

### UI and Components
- **Shadcn UI**: Components are located in `src/components/ui`.
- **Utility Classes**: Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging.

### Code Quality
- **Linting**: `npm run lint`
- **Formatting**: `npm run format` (Prettier)
- **TypeScript**: Strict type checking is enabled in `tsconfig.json`.

### Project Structure
- `src/db/schema/`: Drizzle database schema definitions.
- `src/app/api/`: Next.js App Router API routes.
- `src/lib/validations/`: Zod validation schemas.
- `scripts/`: Maintenance and test scripts.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Context

This is a modern web application built with a bleeding-edge stack. Adhere to the following conventions and technologies:

### Tech Stack & Versions
- **Next.js 16.2.2**: High-risk breaking changes; refer to `node_modules/next/dist/docs/` for any API usage.
- **Tailwind CSS 4**: Uses the latest Tailwind features.
- **Drizzle ORM & Neon**: PostgreSQL with Neon serverless driver.
- **Better-auth**: Handles authentication.
- **Zod**: Required for all API request validation.

### Architecture & Patterns
- **API Responses**: Always use the standardized response utilities in `src/lib/api/responses.ts`. 
  - `successResponse(data, meta?)`
  - `errorResponse(message, status, details?)`
  - `errors.notFound()`, `errors.badRequest()`, etc.
- **Validation**: All API routes **must** validate input using Zod schemas found in `src/lib/validations/`.
- **Utility Classes**: Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging.

### Testing Strategy
- **Framework**: No traditional framework (Vitest/Jest).
- **Execution**: Tests are written as TypeScript scripts and executed with `tsx`.
- **Run a test**: `npx tsx <path-to-script>`
- **Run with DB access**: `dotenv-cli -e .env.local -- npx tsx <path-to-script>`
- **Custom scripts**: Check `package.json` for existing test scripts like `db:test`.

### Database Management
- Generate: `npm run db:generate`
- Migrate: `npm run db:migrate`
- Push (Dev): `npm run db:push`
- Seed: `npm run db:seed`
- Studio: `npm run db:studio`

For more detailed information, see `.junie/guidelines.md`.

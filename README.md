## Getting Started

| Resource | Link | Description |
| :--- | :--- | :--- |
| Application | [http://localhost:3000](http://localhost:3000) | Local dev server |
| Mail Server | [http://localhost:8025](http://localhost:8025) | Local mail server |
| Auth API | [http://localhost:3000/api/auth/reference](http://localhost:3000/api/auth/reference) | Auth Open API Scalar |
| Docker Compose | [Gist Link](https://gist.github.com/zotodev/3115582a81392ddd49949cbf67810045) | Docker Compose setup for setting up necessary services for development |

### Agent Skills
| Action | Command |
| :--- | :--- |
| Read skill | `npx openskills read <skill-name>` |
| Sync to AGENTS.md | `npx openskills sync` |

## Roadmap
- [ ] Auth onboarding with better-auth flows and email templates
- [ ] Dashboard and reporting for cash flow, budgets, and investments
- [ ] Data table and import/export tooling for transactions
- [ ] evlog support for logging - https://www.evlog.dev/frameworks/tanstack-start
- [ ] Object storage integration: better-upload - https://better-upload.com/
- [ ] Object storage alternative: file-uploader - https://github.com/sadmann7/file-uploader
- [ ] Deployment checklist (env config, monitoring, backups)

### Development
| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run Lint to check code quality |
| `pnpm format` | Format code |
| `pnpm check` | Run Lint and TypeScript type checking |
| `pnpm typecheck` | Run TypeScript type checking |

### Database Management
| Command | Description |
| :--- | :--- |
| `pnpm db:generate` | Generate SQL from your Drizzle schema |
| `pnpm db:push` | Push schema changes to your database |
| `pnpm db:introspect` | Introspect an existing database |
| `pnpm db:studio` | Open Drizzle Studio to manage your database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:drop-migration` | Drop a migration |
| `pnpm db:pull` | Pull database schema into your Drizzle schema |

### Git Workflow & Package Management
| Command | Description |
| :--- | :--- |
| `pnpm commit` | Interactive commit with conventional commits + version bump |
| `pnpm outdated` | Check for outdated packages |
| `pnpm update --interactive` | Update packages interactively |
| `pnpm update` | Update all packages |
| `pnpm update --latest` | Update packages to the latest version |
| `npx depcheck` | Check for unused dependencies |
| `pnpm remove <package-name>` | Remove specific package |
| `pnpm prune` | Remove orphaned packages |

## VSCode Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Cmd+Shift+P` → `TypeScript: Restart TS Server` | Restart TypeScript server |
| `Cmd+Shift+V` | Preview markdown file |

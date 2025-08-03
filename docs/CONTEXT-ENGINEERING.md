# 🎯 AIM TRAINER PRO - Comprehensive Context Engineering Document

This document provides an exhaustive overview of the AIM TRAINER PRO project, serving as a central reference for developers, maintainers, and stakeholders. It integrates information from project structure, documentation files, git status, and development history to create a holistic context for engineering decisions.

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Project History and Evolution](#project-history-and-evolution)
3. [Architecture](#architecture)
4. [Key Components](#key-components)
5. [Features](#features)
6. [Technology Stack](#technology-stack)
7. [Development Setup](#development-setup)
8. [Deployment Strategies](#deployment-strategies)
9. [Performance Considerations](#performance-considerations)
10. [Security and Best Practices](#security-and-best-practices)
11. [Testing Strategies](#testing-strategies)
12. [Known Issues and Limitations](#known-issues-and-limitations)
13. [Dependencies and Ecosystem](#dependencies-and-ecosystem)
14. [Future Roadmap](#future-roadmap)
15. [Contribution Guidelines](#contribution-guidelines)
16. [Appendix: Additional Resources](#appendix-additional-resources)

## Project Overview

AIM TRAINER PRO is a professional-grade FPS aim training application designed to help gamers improve their aiming skills, reflexes, accuracy, and reaction times. Originally conceived as a web-based tool, it has evolved into a hybrid web/desktop application with advanced multiplayer features, AI-driven adaptations, and cross-platform support.

### Key Goals
- Deliver realistic, high-fidelity FPS training simulations
- Support diverse training modes from solo practice to competitive tournaments
- Incorporate AI for personalized, adaptive training experiences
- Ensure seamless cross-platform functionality (web, Windows, macOS, Linux)
- Maintain exceptional performance metrics (e.g., 144+ FPS, sub-millisecond latency)
- Foster a community through social and competitive features

### Current Status (as of January 2025)
- Version: Beta 1.4
- Platforms: Web (browser-based), Desktop (Electron for Windows/macOS/Linux)
- Public Access: Temporary via localtunnel; VPS migration planned
- Development Stage: Production-ready beta with core features implemented
- Git Status: On branch 'main', up to date with origin/main; several uncommitted changes and untracked files (see git_status for details)
- Build Status: Desktop app build successful, with unpacked executable available

## Project History and Evolution

The project has progressed through several phases, as documented in README.md and other .md files:

### Timeline
- **Foundation Phase**: Initial web-based FPS trainer with core modes (Precision, Speed, Tracking, Flick)
- **Authentication Phase**: Added user registration, login, and profile management
- **Multiplayer Phase**: Implemented party system and 1v1 competitions
- **Tournament Phase**: Added tournament browser, creation, and management
- **Desktop Conversion**: Wrapped in Electron for native desktop experience (see ELECTRON-SETUP.md)
- **AI Enhancements**: Integrated dynamic difficulty and prediction training
- **Social Features**: Added spectator mode, team challenges, achievements
- **Current Beta 1.4**: Full tournament system, divisions, seasons; ready for public launch
- **Future**: AI analytics, mobile apps, VR support (see Future Roadmap)

Key milestones include successful desktop builds (ELECTRON-BUILD-RESULTS.md) and planned VPS migration (VPS-MIGRATION-PLAN.md).

## Architecture

AIM TRAINER PRO employs a monorepo architecture with clear separation of concerns between client, server, shared utilities, and desktop layers. This facilitates code reuse while maintaining modularity.

### High-Level Architecture Diagram (Conceptual)
```
[User] <-> [Desktop Electron Wrapper] <-> [React Frontend (Client)]
                          |
                          v
[Socket.io] <-> [Node.js Backend (Server)] <-> [Prisma ORM] <-> [PostgreSQL DB]
                          |                                      ^
                          v                                      |
                     [Redis Cache] <-> [Real-time Sessions]
```

- **Frontend**: Handles UI rendering, 3D simulations, and user interactions
- **Backend**: Manages business logic, authentication, and real-time communications
- **Database Layer**: Persistent storage with caching for performance
- **Desktop Layer**: Provides native OS integration for enhanced user experience

### Directory Structure (Detailed)
Based on project_layout and list_dir:
- **assets/**: Icons (icns, ico, png, svg) for desktop branding
- **client/**: React application
  - index.html, package.json, src/ (App.tsx, components/, hooks/, pages/, services/, stores/, utils/)
- **dist-electron/**: Build outputs (win-unpacked/ with exe, dlls, resources/)
- **docs/**: Documentation files (this file, CONTEXT-ENGINEERING.md, etc.)
- **electron/**: Electron-specific files (main.js, package.json, preload.js, renderer.js)
- **scripts/**: Utility scripts (build-icons.js, create-simple-icon.js, etc.)
- **server/**: Node.js backend
  - package.json, prisma/ (schema.prisma), src/ (config/, controllers/, middleware/, routes/, services/, sockets/, utils/)
- **shared/**: types/ and utils/ for cross-component sharing
- Other files: docker-compose.yml, redis.conf, various .md files, package.json (root)

Untracked files and changes indicate active development (e.g., new components in client/src/).

### Data Flow Examples
- **Solo Training**: User input → Three.js rendering → Local analytics → Server sync for stats
- **Multiplayer Party**: Socket.io events → Server broadcast → Real-time UI updates
- **Desktop Features**: IPC calls from renderer → Main process → Native OS APIs

## Key Components

### Client (Frontend)
- **Core**: React 18 with Vite for fast builds
- **3D Rendering**: Three.js for FPS camera, targets, and environments
- **State Management**: Zustand stores (e.g., authStore.ts, partyStore.ts, gameStore.ts)
- **Components**: Categorized (achievement/, ai/, analytics/, auth/, etc.)
- **Pages**: Routed views (HomePage.tsx, GamePage.tsx, PartyGamePage.tsx, etc.)
- **Services**: API calls (api.ts) and Firebase integration (firebase.ts)
- **Hooks**: Custom hooks (useAchievementTracker.ts, useElectron.ts, etc.)

### Server (Backend)
- **Framework**: Express.js with TypeScript
- **Real-time**: Socket.io events (partyEvents.ts, competitionEvents.ts, etc.)
- **Routes**: API endpoints (auth.ts, games.ts, sensitivity.ts, etc.)
- **Database**: Prisma schema for users, sessions, achievements
- **Middleware**: Error handling, Firebase auth
- **Config**: Database and passport setup

### Electron Desktop
- **Main Process (main.js)**: Window creation, menus, auto-updater, backend server management
- **Preload (preload.js)**: Secure API exposure to renderer
- **Build Config**: In root package.json (build section for win/mac/linux targets)

### Shared
- **Types**: index.ts for common interfaces (users, games, etc.)
- **Utils**: index.ts for shared functions

## Features

### Core Training Features
- **Modes**: Precision (static targets), Speed (fast spawning), Tracking (moving targets), Flick (quick shots)
- **Sensitivity System**: Multi-test suite (FlickTest.tsx, TrackingTest.tsx) with history and results
- **AI Features**: DynamicDifficultyStore.ts for adaptive training; AIPredictionTraining.tsx

### Multiplayer and Social
- **Party System**: PartyLobby.tsx, partyStore.ts; Real-time chat and synchronized training
- **Competitions**: CompetitionMatchmaking.tsx, 1v1 modes with ELO
- **Tournaments**: TournamentBrowser.tsx, BracketVisualization.tsx, tournamentStore.ts
- **Spectator**: SpectatorViewer.tsx, spectatorStore.ts
- **Teams**: TeamChallengeManager.tsx, teamChallengeStore.ts

### Progression and Rewards
- **Achievements**: AchievementDashboard.tsx, achievementStore.ts
- **Seasons**: SeasonDashboard.tsx, seasonStore.ts
- **Divisions**: DivisionDashboard.tsx, divisionStore.ts

### Desktop-Specific
- Native menus with shortcuts
- Auto-updater integration
- System tray and notifications

For full list, see README.md#features.

## Technology Stack

### Frontend
- React ^18.3.1
- TypeScript ^5.2.2
- Three.js ^0.158.0
- Tailwind CSS ^3.3.6
- Framer Motion ^10.18.0
- Zustand ^4.5.7
- Socket.io Client ^4.8.1
- Axios ^1.6.2

### Backend
- Node.js (via Electron or standalone)
- Express.js (implied in server structure)
- Socket.io ^4.8.1 (assumed)
- Prisma (schema.prisma)
- PostgreSQL (docker-compose)
- Redis (redis.conf)
- JWT & bcrypt (in auth routes)

### Desktop
- Electron ^30.0.0 (from recent changes)
- Electron Builder ^25.1.8
- Electron Updater ^6.3.9

### Dev Tools
- Vite ^5.0.0
- Docker Compose (for DB/Redis)
- ESLint ^8.53.0 & Prettier
- Concurrently ^8.2.2 for dev scripts

Full dependencies in package.json files.

## Development Setup

### Prerequisites
- Node.js >=18.0.0
- npm >=8.0.0
- Docker (for PostgreSQL/Redis)
- Git

### Installation Steps
1. Clone repository: `git clone <repo-url>`
2. Navigate: `cd aim-training`
3. Install root dependencies: `npm install`
4. Install client: `cd client && npm install`
5. Install server: `cd ../server && npm install`
6. Return: `cd ..`

### Environment Configuration
- Copy `.env.example` to `.env` in root/server
- Set DATABASE_URL, REDIS_URL, JWT_SECRET, etc.
- For desktop, configure build section in package.json

### Running Development
- Start containers: `npm run docker:up` or `docker-compose up -d`
- Dev server: `npm run dev` (concurrent client/server)
- Electron dev: `npm run electron:dev` (waits for ports 3000/3001)
- Database migrate: `cd server && npx prisma migrate dev`

### Build Process
- Full build: `npm run build` (client + server)
- Electron package: `npm run electron:pack`
- Clean: `npm run clean`

## Deployment Strategies

### Development/Local
- Localtunnel for public testing (myaimtrainer.loca.lt)
- Docker for DB/Redis

### Production VPS (Planned)
- Provider: Hetzner/DigitalOcean ($12-16/month)
- OS: Ubuntu 22.04
- Setup: Nginx reverse proxy, Certbot SSL, PM2 process manager
- Domain: aimtrainer.pro with subdomains (api., ws.)
- Deployment Script: Git pull, npm install, build, PM2 restart
- Monitoring: PM2 logs, UFW firewall

Detailed plan in VPS-MIGRATION-PLAN.md.

### Desktop Deployment
- Build: `npm run electron:dist`
- Outputs: win-unpacked/ with AIM TRAINER PRO.exe (see ELECTRON-BUILD-RESULTS.md)
- Distribution: Zip unpacked folder or use NSIS installer
- Auto-updates: Configured in main.js with electron-updater

See ELECTRON-SETUP.md for desktop-specific setup.

## Performance Considerations

### Targets
- FPS: Consistent 144+ with Three.js optimizations
- Input Latency: <1ms mouse-to-render
- Load Time: <2s initial
- Network: <50ms for multiplayer sync

### Optimizations
- Object pooling in Three.js for targets
- Efficient Socket.io event handling
- Code splitting in Vite
- Memoization in React components
- Redis caching for frequent queries

### Monitoring
- Built-in: Real-time HUD with FPS/stats
- Tools: Chrome DevTools, Electron performance API
- Production: PM2 monitoring, server logs

## Security and Best Practices

### Security Features
- Authentication: JWT with bcrypt hashing
- CORS: Restricted to client origins
- Input Validation: Joi in server
- Electron: Context isolation, nodeIntegration false
- HTTPS: Via Certbot in production

### Best Practices
- Code: TypeScript strict mode, ESLint rules
- Commits: Descriptive messages, feature branches
- Testing: Component tests, end-to-end scenarios
- Documentation: Keep README and docs updated

## Testing Strategies

### Types of Tests
- **Unit**: Individual components/functions (e.g., sensitivity calculations)
- **Integration**: API endpoints, Socket.io events
- **E2E**: Full user flows (login → training → multiplayer)
- **Performance**: FPS benchmarks, load testing

### Tools
- Jest/Vitest for unit tests
- Cypress for E2E
- Artillery for load testing
- Manual: Cross-browser/device testing

### CI/CD
- GitHub Actions for automated tests on PRs
- Coverage thresholds: 80%+

## Known Issues and Limitations

From git_status and build logs:
- Uncommitted changes in multiple files (e.g., README.md, client/App.tsx)
- Untracked files: New components, hooks, stores
- Build Warnings: Large chunks in Vite build (>500kB)
- Electron Build: Occasional signing/symbolic link issues (resolved via unpacked)
- Limitations: Current localtunnel setup is temporary; VPS needed for production

See ELECTRON-BUILD-RESULTS.md for build-related issues.

## Dependencies and Ecosystem

### Root Dependencies (package.json)
- Electron ^30.0.0
- Electron Builder ^25.1.8
- Concurrently ^8.2.2
- Wait-on ^8.0.1
- Rimraf ^6.0.1

### Client Dependencies
- React ^18.3.1
- Three.js ^0.158.0
- Framer Motion ^10.18.0
- Zustand ^4.5.7
- Socket.io Client ^4.8.1

### Server Dependencies
- Express (implied)
- Socket.io
- Prisma
- Typescript

Full lists in respective package.json files.

### External Services
- Firebase: Authentication
- PostgreSQL/Redis: Via Docker/VPS
- Localtunnel: Temporary public access

## Future Roadmap

### Phase 10: AI-Powered Analytics & Coaching (Ready to Start)
- ML-based weakness detection
- Personalized AI training recommendations
- Performance prediction analytics
- Real-time coaching tips
- AI video analysis
- Heat map visualizations
- Advanced trend analysis

### Phase 11: Extended Gaming Features
- Mobile native apps (iOS/Android)
- Cloud sync across platforms
- Streaming integration (Twitch/YouTube)
- Replay system
- Hardware integration (mouse DPI)
- VR training modes
- Training guilds/communities
- Professional coaching marketplace
- User-generated scenarios
- Expanded social features

Detailed phases in README.md.

## Contribution Guidelines

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/new-feature`
3. **Develop**: Follow TypeScript patterns, add tests
4. **Commit**: Use descriptive messages (e.g., "feat: add new achievement type")
5. **Push**: `git push origin feature/new-feature`
6. **PR**: Open pull request with detailed description
7. **Review**: Address feedback

### Code Standards
- ESLint & Prettier for formatting
- TypeScript strict mode
- Component-based architecture
- Performance-first: Optimize for FPS/latency
- Documentation: Update relevant .md files

For bugs/features: Use GitHub Issues with labels (bug, enhancement, etc.)

## Appendix: Additional Resources

- **README.md**: Main project documentation and features
- **DESKTOP-APP-SOLUTION.md**: Desktop conversion details
- **ELECTRON-BUILD-RESULTS.md**: Build outputs and stats
- **ELECTRON-SETUP.md**: Electron setup guide
- **README-ELECTRON.md**: Desktop-specific README
- **VPS-MIGRATION-PLAN.md**: Detailed VPS deployment plan
- **Git Status**: Current uncommitted changes and untracked files indicate active development areas
- **External**: Electron docs, Three.js guides, Socket.io best practices

---

Document Version: 2.0 (Expanded Edition)
Last Updated: [Current Date]
Generated based on project state as of January 2025. Review and update quarterly. 
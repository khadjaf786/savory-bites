# Project Guidance

## User Preferences

- Restaurant ordering site: landing page that introduces and advertises the restaurant
- Two payment options at checkout: cash on delivery and card
- Delivery address entry during ordering
- Warm, appetizing food-focused visual style
- Admin dashboard for the restaurant to see incoming orders
- Admin area is protected and admin-only

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Project is on the Enhanced Migration chain: mops.toml declares [canisters.backend.migrations]; author migration chain files in src/backend/migrations/, never a legacy single migration.mo.
- Under Enhanced Migration, accessControlState must be declared type-only in main.mo and initialized in the migration's NewActor; an inline initializer is M0250.
- Migration files may import mops packages but never project modules, so first-run seed data must be inlined in the migration even when a lib module also exports it.
- OQL auto-derivation (.toEntity) fails for records with variants, options, nested records, arrays, or Int fields; use .toEntityManual with .payload/.flatten and top-level <Type>Value imports.
- Motoko multi-line string literals written as triple quotes are lexed incorrectly; use a single-line string with explicit \n escapes.
- A variant tag binds only to the next atom, so parenthesize tag arguments like #predicate(Char.isWhitespace).
- mops check tolerates top-level helper functions before the actor, but mops build rejects them (M0141); move helpers inside the actor body.
- zustand persist stores holding bigint fields need a merge that coerces JSON-rehydrated strings back to bigint, since BigInt.prototype.toJSON stringifies them.
- Customer-facing pages must not depend on admin-only queries; use the mutation's returned entity or a public lookup.
- Keep shared pricing constants (delivery fee, free-delivery threshold) in one place and derive marketing copy from them so frontend and backend cannot drift.
- Admin dashboard lives at /admin, gated by AdminGate: signed-out visitors see a sign-in prompt, signed-in non-admins see a not-authorized state, and the admin-only listOrders query is enabled only when isCallerAdmin is true.
- Order status transitions are placed -> confirmed|cancelled and confirmed -> delivered|cancelled; delivered and cancelled are terminal. The backend updateOrderStatus endpoint is admin-gated and returns { #ok : Order; #err : UpdateOrderStatusError }.
- Internet Identity sign-in/out uses useInternetIdentity() (isAuthenticated, login, clear, isLoggingIn); isAuthenticated is true for restored sessions, unlike isLoginSuccess.
- Admin dashboard filter/search state lives in the URL via TanStack Router useSearch({ strict: false }) and navigate({ to, search: (prev) => ({...prev, ...}) }).

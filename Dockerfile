# syntax=docker/dockerfile:1

# --- deps: install with pnpm, cached separately from source changes ---
FROM node:22-alpine AS deps
WORKDIR /app
# sharp and other native deps need libc6-compat on musl (alpine)
RUN apk add --no-cache libc6-compat
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: produce the Next.js standalone output ---
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Drizzle config/schema are read at build time by nothing (drizzle-kit isn't
# run here), but the app code imports @/drizzle/schema directly — keep it in
# the build context via the plain COPY . . above.
#
# NEXT_PUBLIC_* vars are inlined into the client JS bundle at build time —
# unlike DATABASE_URL/AUTH_SECRET/etc (read at runtime), these MUST be passed
# as build args, not just container env vars, or they'll be empty in the browser.
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_ENABLE_REACT_GRAB
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_ENABLE_REACT_GRAB=${NEXT_PUBLIC_ENABLE_REACT_GRAB}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- runner: minimal image with only the standalone server ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Overwrite the standalone output's own (partial) node_modules with the
# builder's full, real pnpm install. Next's file tracer copies sharp's
# nested @img/sharp-libvips-linuxmusl-x64 companion package's index.js but
# not its actual .so binary — a known gap with binary assets loaded via
# dlopen() rather than a traceable require()/readFile() call, several
# levels deep in pnpm's virtual store. Copying the complete node_modules
# instead of relying on the trace sidesteps that gap entirely.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# STORAGE_ROOT mounts here via a volume in docker-compose.yml — created and
# owned by the app user so it's writable at runtime regardless of host
# volume ownership on first mount.
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

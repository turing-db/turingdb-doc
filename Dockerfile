# Build the docs and serve them as static files.
#
#   docker build -t turingdb-docs .
#
# The build context is the repository root, which is also the app root: the .mdx content,
# docs.json and the Vite project all live here.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, so editing content doesn't invalidate the npm layer.
COPY package.json package-lock.json ./
RUN npm ci

# Then everything else (see .dockerignore — node_modules and dist are excluded, so the
# layer above survives a content edit).
COPY . .
RUN npm run build

# Fail the build rather than ship a broken site if prerendering silently produced nothing.
RUN test -f dist/index.html \
 && test "$(find dist -name index.html | wc -l)" -ge 35 \
 && echo "prerendered $(find dist -name index.html | wc -l) pages"

# ---------- serve ----------
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
# nginx:alpine's entrypoint runs envsubst over /etc/nginx/templates/*.template, which is how
# ${PORT} gets resolved — the host assigns the port at runtime.
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

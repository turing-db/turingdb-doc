# Build the docs and serve them as static files.
#
# The build context is the REPOSITORY ROOT, not site/: the .mdx content and docs.json live
# one level above this app and are its input. Build with
#   docker build -f site/Dockerfile .
# from the repo root (which is what railway.json tells Railway to do).

# ---------- build ----------
FROM node:22-alpine AS build

# Dependencies first, so editing content doesn't invalidate the npm layer.
WORKDIR /repo/site
COPY site/package.json site/package-lock.json ./
RUN npm ci

# Then the repo (see .dockerignore — node_modules and dist are excluded, so the layer above
# survives).
WORKDIR /repo
COPY . .

WORKDIR /repo/site
RUN npm run build

# Fail the build rather than ship a broken site if prerendering silently produced nothing.
RUN test -f dist/index.html \
 && test "$(find dist -name index.html | wc -l)" -ge 35 \
 && echo "prerendered $(find dist -name index.html | wc -l) pages"

# ---------- serve ----------
FROM nginx:1.27-alpine

COPY --from=build /repo/site/dist /usr/share/nginx/html
# nginx:alpine's entrypoint runs envsubst over /etc/nginx/templates/*.template, which is how
# ${PORT} gets resolved — Railway assigns the port at runtime.
COPY site/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

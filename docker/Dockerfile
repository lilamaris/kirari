FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG CONTENT_REPO
ARG CONTENT_OUTPUT=src/content/posts
ARG CONTENT_TMP=/.tmp/articles

RUN rm -rf "$CONTENT_OUTPUT" \
    && git clone --depth 1 "$CONTENT_REPO" "$CONTENT_TMP" \
    && mkdir -p "$CONTENT_OUTPUT"


RUN pnpm tsx scripts/normalize.ts \
    --source $CONTENT_TMP \
    --output $CONTENT_OUTPUT

RUN pnpm build

FROM docker.io/library/nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

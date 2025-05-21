ARG APP_NAME=aurora-debug

FROM node:24-alpine AS builder
WORKDIR /app

ARG APP_NAME

COPY --chown=node:node . .
RUN corepack enable
RUN pnpm i
RUN pnpm run build
ARG TINI_VERSION=v0.19.0
RUN wget -qO /tini "https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static" \
  && chmod +x /tini

RUN pnpm --prod deploy ${APP_NAME} --filter=${APP_NAME} --legacy  

FROM gcr.io/distroless/nodejs24-debian12:debug-nonroot AS runner
WORKDIR /app
USER nonroot

ARG APP_NAME

COPY --chown=nonroot:nonroot --from=builder /app/dist ./
COPY --chown=nonroot:nonroot --from=builder /app/${APP_NAME}/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=builder /tini /app/tini

ENV NODE_OPTIONS="--enable-source-maps"

ENTRYPOINT ["/app/tini", "--", "/nodejs/bin/node"]

CMD ["index.js"]
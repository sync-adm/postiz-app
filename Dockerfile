FROM node:20-alpine3.19
ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
ENV NODE_ENV=production
RUN apk add --no-cache g++ make py3-pip bash nginx
RUN adduser -D -g 'www' www
RUN mkdir /www
RUN chown -R www:www /var/lib/nginx
RUN chown -R www:www /www


RUN npm --no-update-notifier --no-fund --global install pnpm@10.6.1 pm2

WORKDIR /app

COPY . /app
COPY var/docker/nginx.conf /etc/nginx/nginx.conf

# Limpar cache do pnpm e configurar store
RUN pnpm config set store-dir /tmp/.pnpm-store && \
    pnpm config set cache-dir /tmp/.pnpm-cache

# Corrigir lockfile quebrado e instalar dependências
RUN pnpm install --no-frozen-lockfile --no-optional

# Limpar cache do Prisma e regenerar
RUN rm -rf node_modules/@prisma/client && \
    rm -rf node_modules/.prisma && \
    rm -rf /root/.cache/pnpm && \
    pnpm dlx prisma generate --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma

# Build com mais memória
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# Limpeza final
RUN pnpm prune --prod

CMD ["sh", "-c", "nginx && pnpm run pm2"]
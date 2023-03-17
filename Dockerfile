FROM utkashx/factify-renderer-base

COPY . .

RUN pnpm i

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]
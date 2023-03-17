FROM utkashx/factify-renderer-base

COPY . .

RUN pnpm i

RUN pnpm build

EXPOSE 8080

CMD [ "pnpm", "run dev" ]
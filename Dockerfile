FROM utkashx/factify-renderer-base

COPY . .
RUN pnpm i
RUN apt-get update && apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libxi-dev libglu1-mesa-dev libglew-dev  xvfb
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/bin/dumb-init
RUN chmod 0777 /usr/bin/dumb-init
RUN pnpm build
RUN npm install -g typescript
RUN npm install -g ts-node
EXPOSE 8080
ENTRYPOINT ["/usr/bin/dumb-init", "--", "xvfb-run", "-s", "-ac -screen 0 1280x1024x24"]

CMD [ "npm", "start" ]
FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install --omit=dev && npm install --save-dev typescript && npm run build && npm prune --omit=dev
EXPOSE 8080
CMD ["npm","start"]

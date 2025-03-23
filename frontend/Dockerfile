FROM node:alpine

RUN mkdir -p /app
WORKDIR /app


COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

CMD ["npm", "run", "start"]
FROM node:18

WORKDIR /usr/src/app


EXPOSE 3000

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]
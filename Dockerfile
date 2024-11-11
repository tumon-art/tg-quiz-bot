FROM node:20

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
# RUN npm run build

COPY . .

EXPOSE 8080

CMD [ "node", "./build/src/app.js" ]

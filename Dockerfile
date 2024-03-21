FROM node:20.10.0

WORKDIR /usr/apigateway

COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]


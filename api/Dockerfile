FROM node:22-alpine
WORKDIR /app
RUN npm install nodemailer@6
COPY server.js .
ENV DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]

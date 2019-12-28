FROM node:10
LABEL maintainer="PAUL,CHEN<pengyuenhao@qq.com>"
COPY . /root
WORKDIR /root
RUN npm install && npm cache clean --force
EXPOSE 9000
CMD ["npm","start"]
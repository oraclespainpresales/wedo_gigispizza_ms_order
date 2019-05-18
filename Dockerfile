#FROM container-registry.oracle.com/database/instantclient:12.2.0.1
FROM store/oracle/database-instantclient:12.2.0.1

ADD ol7_developer_nodejs8.repo /etc/yum.repos.d/ol7_developer_nodejs8.repo


RUN yum -y update && \
    rm -rf /var/cache/yum && \
    yum -y install nodejs

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm install
# Bundle app source
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]

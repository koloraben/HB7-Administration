
HB7Television is an IPTV/OTT solution for Pay Tv Businesses. The administration portal is build on Sequelize, Express, ng-admin, and Node.js

### Installation

### Before you start, make sure you have these prerequisites installed:

 * Node.js
 * NPM

### Follow these steps to install backoffice  Management System

Download and install NODE JS from the following link:

https://nodejs.org/en/download/

We recommend versions 7.x.x or 8.x.x installed for nodejs

Download HB7Television Backoffice application from Github

https://github.com/HB7Television/backoffice-administration.git

Run the following command within the root folder to install application libriaries:
```
sudo npm install (in linux)
npm install (in windows)
```
Create a database on MySQL server.

Make sure that the collation and charset of your schema supports the languages that you intend to use.

After all libraries are installed, run the following command to start the server:
```
sudo node server.js (in linux)
node server.js (in windows)
```
When application runs for the first time, it will automatically create database structures and populate necessary tables with default values.


### Database migration
If this is an upgrade, please run the following to upgrade the database with the latest changes:

```bash
$ sequelize db:migrate
```

Login to start creating accounts and assets

go to: 
## http://YourDomain_or_IP/admin 
and login with username admin and password admin

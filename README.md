# birdy [![Build Status](https://travis-ci.org/iiegor/birdy.svg)](https://travis-ci.org/iiegor/birdy) ![](https://david-dm.org/iiegor/birdy.svg)
Make fly your web applications with birdy, an easy way to start developing node.js websites.<br>
Birdy is based on makerparty source.

## Get birdy
Clone the git running ``git clone <repository-url>`` or ``npm install birdy-server``

## Installation
You need to have installed grunt-cli, run:
```
npm install -g grunt-cli
```

When you have grunt-cli installed (type grunt in the console to check) run the following commands to prepare the project:
```
npm install
grunt
cp .env-dist .env
```
At the last, run the following command for run the server:
```
node bin/birdy
```
or
```
npm start
```
The last command compiles your public files and then run the server.

## Compile
Simply run ``grunt``

## CLI
In order to speed up and facilitate the creation of controllers, views and other components, you can use birdy-cli (https://github.com/iiegor/birdy-cli).

## To do
- [x] ES6 Support.
- [x] React server side rendering.
- [x] Better definition for app routes.
- [ ] Show a custom page for exceptions in production.
- [ ] API support.

## Contributors
* Iegor Azuaga (dextrackmedia@gmail.com)

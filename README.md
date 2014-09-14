# birdy [![Build Status](https://travis-ci.org/underc0de/birdy.svg)](https://travis-ci.org/underc0de/birdy) 
Make fly your web applications with birdy, an easy way to start developing node.js websites.<br>
Birdy is based on makerparty source.

## Get birdy
Clone the git running ```git clone <repository-url>`` or ``npm install birdy-server``

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
node app
```
or
```
grunt deploy
```
The last command compiles your public files and then run the server.

## Compile
Simply run ``grunt``

## Authors
* Iegor Azuaga (dextrackmedia@gmail.com)
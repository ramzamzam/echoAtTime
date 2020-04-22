"use strict";
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');

const MessagesService = require('./messages.service');
const MessagesTask = require('./messages.task');
const validateEchoAtTime = require('./messages.validator');

const redisClient = redis.createClient();
redisClient.on("error", function(error) {
  console.error(error);
});

const messagesService = new MessagesService(redisClient);
const echoMessagesTask = new MessagesTask(messagesService);

redisClient.on('connect', () => echoMessagesTask.run());

// Gracefully shut down process so no interruption happens between
// pulling messages and printing to console
['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => {
  process.on(signal, () => {
    echoMessagesTask.onStopped(() => process.exit(0));
    echoMessagesTask.stop();
  });
});

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

app.post('/echoAtTime',
  validateEchoAtTime(),
  async (req, res, next) => {
    try {
      const { time, message } = req.body;
      await messagesService.saveMessage(time, message);
      res.status(202).end();
   } catch (err) {
      return next(err);
   }
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).end(err.message);
});

http.createServer(app).listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server Listening at ${PORT}`);
});

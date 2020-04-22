const util = require('util');
const MessagesSerializer = require('./messages.serializer');

const MESSAGES_SORTED_SET = 'messages';

function promisify(object, key) {
  return util.promisify(object[key]).bind(object);
}

class MessagesService {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.redisPromised = {
      incr: promisify(redisClient, 'incr'),
      zadd: promisify(redisClient, 'zadd'),
      del : promisify(redisClient, 'del'),
    };
  }

  async saveMessage(timestamp, message) {
    const index = await this.redisPromised.incr(timestamp);
    const created = await this.redisPromised.zadd(
      MESSAGES_SORTED_SET,
      timestamp,
      MessagesSerializer.serialize(timestamp, message, index),
    );
    if (!created) throw new Error('Message is not created!');
  }

  async fetchAndDeleteExpiredMessages(timestamp) {
    const rawMessages = await new Promise((resolve, reject) => {
      this.redisClient.multi()
        .zrangebyscore(MESSAGES_SORTED_SET, 0, timestamp)
        .zremrangebyscore(MESSAGES_SORTED_SET, 0, timestamp)
        .exec(function (err, replies) {
          if(err) return reject(err);
          resolve(replies[0]);
        });
    });
    const messages = rawMessages.map((rawMessage) => MessagesSerializer.deserialize(rawMessage));
    const timestamps = messages.reduce((timestampsSet, { timestamp }) => {
      timestampsSet.add(timestamp);
      return timestampsSet;
    }, new Set());

    if (timestamps.size) {
      await this.redisPromised.del(...timestamps);
    }

    return messages;
  }
}


module.exports = MessagesService;

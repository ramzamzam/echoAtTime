class MessagesSerializer {
  static #messageRegex = /(\d*)-(\d*)-(.*)/;

  static serialize(timestamp, message, messageIndex) {
    return `${timestamp}-${messageIndex}-${message}`;
  }

  static deserialize(rawMessage) {
    const [, timestamp, messageIndex, value] = this.#messageRegex.exec(rawMessage);
    return { timestamp, value, messageIndex };
  }
}

module.exports = MessagesSerializer;

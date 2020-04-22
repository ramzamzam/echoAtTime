const EventEmitter = require('events');

class MessagesTask {
  #STOPPED_EVENT = 'stopped';
  #events = new EventEmitter();

  isRunning = false;

  constructor(messagesService) {
    this.messagesService = messagesService;
  }

  run() {
    this.isRunning = true;
    this.scheduleNext();
  }

  stop() {
    console.log('Stopping logging messages...');
    this.isRunning = false;
  }

  async logMessages() {
    const messages = await this.messagesService.fetchAndDeleteExpiredMessages(Date.now());
    messages.forEach((m) => console.log(m.value, `(required time - ${m.timestamp}, current - ${Date.now()})`));
    return this.scheduleNext()
  }

  scheduleNext() {
    if (!this.isRunning) {
      return this.#events.emit(this.#STOPPED_EVENT);
    }
    setImmediate(() => this.logMessages().catch(console.log));
  }

  onStopped(callback) {
    this.#events.on(this.#STOPPED_EVENT, () => callback());
  }
}


module.exports = MessagesTask;


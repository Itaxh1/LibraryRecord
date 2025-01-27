const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

function publishMessage(message) {
  amqp.connect(RABBITMQ_URL, (err, conn) => {
    if (err) {
      throw err;
    }
    conn.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      const queue = 'photoQueue';

      channel.assertQueue(queue, {
        durable: false
      });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log(" [x] Sent %s", message);
    });

    setTimeout(() => {
      conn.close();
    }, 500);
  });
}

module.exports = { publishMessage };

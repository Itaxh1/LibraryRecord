const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL || '';

function startConsumer() {
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

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

      channel.consume(queue, (msg) => {
        const message = JSON.parse(msg.content.toString());
        console.log(" [x] Received %s", message);
        // Process the message (e.g., further processing of the photo)
      }, {
        noAck: true
      });
    });
  });
}

module.exports = { startConsumer };

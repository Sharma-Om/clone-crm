const CommunicationLog = require('../models/CommunicationLog');

const queue = [];
let processing = false;

function addToQueue(update) {
  queue.push(update);
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const batch = queue.splice(0, 10); // take up to 10 at a time

  const bulkOps = batch.map(({ communicationId, status }) => ({
    updateOne: {
      filter: { _id: communicationId },
      update: { $set: { status } },
    },
  }));

  try {
    await CommunicationLog.bulkWrite(bulkOps);
    console.log(`Processed batch of ${batch.length} delivery status updates.`);
  } catch (err) {
    console.error('Error processing delivery queue:', err);
    queue.unshift(...batch); // retry later
  }

  processing = false;
}

setInterval(processQueue, 3000); // run every 3 seconds

module.exports = { addToQueue };

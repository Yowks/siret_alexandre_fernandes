const { MongoClient } = require('mongodb');
const { jobProcessFile, appConfig } = require('./utils');

const url = `mongodb://${appConfig.dbHost}:${appConfig.dbPort}/${appConfig.dbName}`;
const pmId = process.env.pm_id || null;
let paused = false;
let currentProcessingFile = '';

if (!pmId) {
  console.log('You have to launch the app with PM2');
  process.exit(0);
}

const startProcessing = async () => {
  if (!paused) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(appConfig.dbName);

    process.send({
      type: 'job::processingFile',
      data: {
        file: currentProcessingFile,
      },
    });
    await jobProcessFile(currentProcessingFile, db);
    process.send({
      type: 'job::processedFile',
      data: {
        file: currentProcessingFile,
      },
    });
  }
};

const pauseProcessing = () => {
  paused = true;
};

const resumeProcessing = async () => {
  paused = false;
  await startProcessing();
};

process.on('message', async ({ type, data }) => {
  switch (type) {
    case 'action::startProcessing':
      console.log('Starting process', data.file);
      currentProcessingFile = data.file;
      console.log(currentProcessingFile);
      await startProcessing();
      break;
    case 'action::pauseProcessing':
      console.log('Pausing process');
      pauseProcessing();
      break;
    case 'action::resumeProcessing':
      console.log('Resuming process');
      await resumeProcessing();
      console.log(currentProcessingFile);
      break;
    default:
      break;
  }
});

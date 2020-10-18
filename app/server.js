const MongoClient  = require('mongodb');
const jobProcessFile = require('./controllers/manage_data');
const fs = require('fs');
const appConfig = JSON.parse(fs.readFileSync(__dirname + '/../process.json')).apps[0];

const url = `mongodb://${appConfig.dbHost}:${appConfig.dbPort}/${appConfig.dbName}`;
const pmId = process.env.pm_id || null;
let paused = false;
let currentProcessingFile = '';

if (!pmId) {
  console.log('Pm2 is not active');
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
  if(type == 'action::startProcessing') {
      console.log('Starting process on ', data.file);
      currentProcessingFile = data.file;
      console.log(currentProcessingFile);
      await startProcessing();
      return;
  } else if (type == 'action::pauseProcessing') {
    console.log('Pausing process');
    pauseProcessing();
    return;
  } else if (type == 'action::resumeProcessing') {
    console.log('Resuming process');
    await resumeProcessing();
    console.log(currentProcessingFile);
    return;
  }
  return;
});

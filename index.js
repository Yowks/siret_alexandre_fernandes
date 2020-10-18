const pm2 = require('pm2');
const fs = require('fs');
const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const {getFiles, splitCsvFile, appConfig}  = require('./app/controllers/split.js');
const actions = require('./app/controllers/process_management');

const pmIds = [];
let fileIndex = 0;
let files = [];
let over = false;

fs.writeFileSync('process.lock', process.pid);

const processFiles = () => {
  pm2.connect(async (errConnect) => {
    if (errConnect) {
      console.error(errConnect);
      process.exit(2);
    } else {
      console.log('PM2 starting');
      pm2.start(appConfig, async (errStart, apps) => {
        if (errStart) {
          console.log('PM2 starting writting process error logs', errStart);
        } else {
          try {
            files = await getFiles('./upload/');
            apps.forEach((app) => {
              const pmId = app.pm2_env.pm_id;
              pmIds.push(pmId);
              setTimeout(() => {
                actions.startInstance(pmId, files[fileIndex]);
                fileIndex += 1;
              }, 1500);
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    }
  });
};

rl.question('Start processing now ? (y/n) ', (answer) => {
  if (answer == 'y') {
      processFiles();
      return;
  } else if (answer == 'n') {
    console.log('Can be done later in the manager');
    return;
  } else{
    return;
  }
});

const askCleaningWhenOver = (question) => {
  rl.question(question, (answer) => {
    if(answer == 'y') {
      pmIds.forEach((pmId) => {
        pm2.delete(pmId);
        console.log(`process ${pmId} deleted`);
      });
    console.log('All clean');

    } else if (answer == 'n') {
      console.log('Got it');
    } 
    fs.unlinkSync('process.lock');
    process.exit(0);
  });
};

const listenProcesses = () => {
  pm2.launchBus((err, bus) => {
    bus.on('job::processFiles', () => {
      processFiles();
    });
    bus.on('job::processingFile', (packet) => {
      const pmId = packet.process.pm_id;
      console.log(pmId, 'job::processingFile', packet.data.file);
    });
    bus.on('job::processedFile', (packet) => {
      if (!over) {
        const pmId = packet.process.pm_id;
        console.log(pmId, 'job::processedFile', packet.data.file);

        if (fileIndex === files.length) {
          console.log('All files done');
          over = true;
          askCleaningWhenOver('Kill all the process ? (y/n) ');
        } else {
          actions.startInstance(pmId, files[fileIndex]);
          fileIndex += 1;
        }
      }
    });
    bus.on('job::pauseProcessing', () => {
      pmIds.forEach((pmId) => {
        actions.pauseInstance(pmId);
        console.log(pmId, 'job::pauseProcessing');
      });
      console.log('Pause processes');
    });
    bus.on('job::resumeProcessing', () => {
      pmIds.forEach((pmId) => {
        actions.resumeInstance(pmId);
        console.log(pmId, 'job::resumeProcessing');
      });
      console.log('Resume all pause processes');
    });

    bus.on('job::splitCsv', () => {
      const csvName = './upload/StockEtablissement.csv';
      console.log('job::splitCsv', `./${csvName}`);
      splitCsvFile(csvName, 'siret');
    });
  });
};

listenProcesses();

process.on('SIGINT', () => {
  fs.unlinkSync('process.lock');
  process.exit(0);
});

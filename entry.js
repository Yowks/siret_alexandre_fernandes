const pm2 = require('pm2');
const fs = require('fs');
const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { getFiles, splitCsvFile, appConfig } = require('./utils');
const actions = require('./processActions.js');

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
      console.log('PM2 on the line');
      pm2.start(appConfig, async (errStart, apps) => {
        if (errStart) {
          console.log('PM2 starting process error', errStart);
        } else {
          try {
            files = await getFiles('csv');
            apps.forEach((app) => {
              const pmId = app.pm2_env.pm_id;
              pmIds.push(pmId);
              setTimeout(() => {
                actions.sendJobToInstance(pmId, files[fileIndex]);
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

rl.question('Would you like to start the files processing now ? (y/n) ', (answer) => {
  switch (answer) {
    case 'y':
      processFiles();
      break;
    case 'n':
      console.log("It's ok ! You can still do it via the Siret Manager ;)");
      break;
    default:
      break;
  }
});

const askCleaningWhenOver = (question) => {
  rl.question(question, (answer) => {
    switch (answer) {
      case 'y':
        pmIds.forEach((pmId) => {
          pm2.delete(pmId);
          console.log(`process ${pmId} deleted`);
        });
        console.log('All processes have been deleted. Bye ;)');
        break;
      case 'n':
        console.log("It's ok ! Bye ;)");
        break;
      default:
        break;
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
          console.log('All files have been processed, nice !');
          over = true;
          askCleaningWhenOver('Would you like to kill all remaining processes ? (y/n) ');
        } else {
          actions.sendJobToInstance(pmId, files[fileIndex]);
          fileIndex += 1;
        }
      }
    });
    bus.on('job::pauseProcessing', () => {
      pmIds.forEach((pmId) => {
        actions.sendPauseToInstance(pmId);
        console.log(pmId, 'job::pauseProcessing');
      });
      console.log('Paused all processes (they will still continue until their current processing is finished)');
    });
    bus.on('job::resumeProcessing', () => {
      pmIds.forEach((pmId) => {
        actions.sendResumeToInstance(pmId);
        console.log(pmId, 'job::resumeProcessing');
      });
      console.log('Resumed all processes');
    });

    bus.on('job::splitCsv', () => {
      const csvName = 'StockEtablissement_utf8.csv';
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

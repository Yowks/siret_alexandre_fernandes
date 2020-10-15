const pm2 = require('pm2');

const startInstance = (instanceId, file) => {
  pm2.sendDataToProcessId({
    type: 'action::startProcessing',
    id: instanceId,
    data: {
      file,
    },
    topic: 'PROCESS_FILE',
  }, () => {});
};

const pauseInstance = (instanceId) => {
  pm2.sendDataToProcessId({
    type: 'action::pauseProcessing',
    id: instanceId,
    data: {
      pause: true,
    },
    topic: 'PAUSE_PROCESS',
  }, () => {});
};

const resumeInstance = (instanceId, file) => {
  pm2.sendDataToProcessId({
    type: 'action::resumeProcessing',
    id: instanceId,
    data: {
      pause: false,
      file,
    },
    topic: 'RESUME_PROCESS',
  }, () => {});
};

module.exports = {
  startInstance,
  pauseInstance,
  resumeInstance,
};

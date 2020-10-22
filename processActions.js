const pm2 = require('pm2');

const sendJobToInstance = (instanceId, file) => {
  pm2.sendDataToProcessId({
    type: 'action::startProcessing',
    id: instanceId,
    data: {
      file,
    },
    topic: 'PROCESS_FILE',
  }, () => {});
};

const sendPauseToInstance = (instanceId) => {
  pm2.sendDataToProcessId({
    type: 'action::pauseProcessing',
    id: instanceId,
    data: {
      pause: true,
    },
    topic: 'PAUSE_PROCESS',
  }, () => {});
};

const sendResumeToInstance = (instanceId, file) => {
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
  sendJobToInstance,
  sendPauseToInstance,
  sendResumeToInstance,
};

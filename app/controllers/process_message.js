const pmId = process.env.pm_id || null;

if (!pmId) {
  console.log("You can't run the process linker this directly");
  process.exit(0);
}

if (process.argv[2] == '1') {
  process.send({
    type: 'job::processFiles',
    data: {},
  });
} else if (process.argv[2] == '2') {
  process.send({
    type: 'job::pauseProcessing',
    data: {},
  });
} else if (process.argv[2] == '3') {
  process.send({
    type: 'job::resumeProcessing',
    data: {},
  });
} else if (process.argv[2] == '4') {
  process.send({
    type: 'job::splitCsv',
    data: {},
  });
}else {
  return;
}

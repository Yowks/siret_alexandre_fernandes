const pmId = process.env.pm_id || null;

if (!pmId) {
  console.log("You can't run the process linker this directly");
  process.exit(0);
}

switch (process.argv[2]) {
  case '1':
    process.send({
      type: 'job::processFiles',
      data: {},
    });
    break;
  case '2':
    process.send({
      type: 'job::pauseProcessing',
      data: {},
    });
    break;
  case '3':
    process.send({
      type: 'job::resumeProcessing',
      data: {},
    });
    break;
  case '4':
    process.send({
      type: 'job::splitCsv',
      data: {},
    });
    break;
  default:
    break;
}

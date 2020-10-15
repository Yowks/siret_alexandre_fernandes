const fs = require('fs');
const split = require('split');

const appConfig = JSON.parse(fs.readFileSync(__dirname + '/../../process.json')).apps[0];

const splitCsvFile = (inputFile, outputPrefix = 'csv', constraintSize = 48500 * 1024, endLine = '\n') => {
  if (!fs.existsSync(appConfig.Output)) {
    fs.mkdirSync(appConfig.Output);
  }

  console.time('splitting_csv');
  const csvFilePath = `${appConfig.Output}/${outputPrefix}`;
  let fileNumber = 1;
  let chunkFileSize = 0;
  let inStream = fs.createReadStream(inputFile);
  let outStream = fs.createWriteStream(`${csvFilePath}_${fileNumber}.csv`);
  let header = '';

  inStream
    .pipe(split())
    .on('data', async (line) => {
      const newLine = line + endLine;
      if (header === '') {
        header = line;
      }

      await outStream.write(newLine);
      chunkFileSize += Buffer.byteLength(newLine, 'utf8');
      if (chunkFileSize >= constraintSize) {
        const headerLine = header + endLine;
        fileNumber += 1;
        chunkFileSize = 0;
        outStream = fs.createWriteStream(`${csvFilePath}_${fileNumber}.csv`);
        await outStream.write(headerLine);
        chunkFileSize = Buffer.byteLength(headerLine, 'utf8');
      }
    }).on('close', () => {
      inStream.close();
      inStream = null;
      console.timeEnd('splitting_csv');
    });
};

const getFiles = dir => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, files) => {
    if (err) reject(err);
    resolve(files);
  });
});

const csvLineToJson = (csvLine, header, valueDelimiter = ',') => {
  const csvLineJson = {};
  const lineValues = csvLine.split(valueDelimiter);

  for (let valueIndex = 0; valueIndex < lineValues.length; valueIndex += 1) {
    csvLineJson[header[valueIndex]] = lineValues[valueIndex];
  }

  return csvLineJson;
};

const processCsvFile = async (file, op, cropSize = 10000, valueDelimiter = ',') => {
  let lineCounter = 0;
  let header = '';
  let csvJson = [];
  let inStream = fs.createReadStream(file);

  inStream
    .pipe(split())
    .on('data', async (line) => {
      lineCounter += 1;
      if (lineCounter === 1) {
        header = line.split(valueDelimiter);
      } else {
        csvJson.push(csvLineToJson(line, header, valueDelimiter));
      }

      if (csvJson.length === cropSize) {
        op(csvJson, false);
        csvJson = [];
      }
    }).on('close', () => {
      inStream.close();
      inStream = null;
      op(csvJson, true);
      csvJson = [];
    });
};


module.exports = {
  getFiles,
  splitCsvFile,
  appConfig,
};

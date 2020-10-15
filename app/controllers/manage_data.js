const insertBulk = (db, collName, data) => db.collection(collName).bulkWrite(data.map(obj => ({
  insertOne: {
    document: obj,
  },
})), { ordered: false, bypassDocumentValidation: true });

const logMigration = async (db, fileName, insertedCount) => {
  await db.collection('migration').insertOne({
    fileName,
    date: new Date(),
    insertedCount,
  });
};

const updateMigration = async (db, fileName, insertedCount) => {
  await db.collection('migration').updateOne(
    { fileName },
    { $inc: { insertedCount } },
  );
};

const existInMigration = (db, fileName) => db.collection('migration').findOne({
  fileName,
});

const jobProcessFile = async (file, db) => {
  await logMigration(db, file, 0);
  return new Promise(async (resolve, reject) => {
    try {
      processCsvFile(`csv/${file}`, async (csvJson, processed) => {
        const bulkResult = await insertBulk(db, 'stock-etablissement', csvJson);
        if (bulkResult.insertedCount === csvJson.length) {
          await updateMigration(db, file, bulkResult.insertedCount);
        }

        if (processed) {
          console.log(`Processed ${file}`);
          resolve();
        }
      }, appConfig.cropSize);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  existInMigration,
  jobProcessFile
};

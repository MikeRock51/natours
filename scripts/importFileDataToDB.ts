const fs = require('fs').promises;
const Tour = require('../models/tourModel');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

async function readFileData() {
  const fileData = await fs.readFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8'
  );
  return JSON.parse(fileData);
}

async function importData() {
  try {
    const data = await readFileData();
    const response = await Tour.create(data);
    console.log( response.length, 'tours created successfully: ');
  } catch (error) {
    console.log('Error importing data: ', error);
  }
}

async function dropDBData() {
  try {
    await Tour.deleteMany();
    console.log('DB data dropped successfully.');
  } catch (error) {
    console.log('Error dropping DB data: ', error);
  }
}

async function run() {
  switch (argv.t) {
    case 'import':
      await importData();
      break;
    case 'delete':
      await dropDBData();
      break;
    default:
      console.error(
        'Invalid command:\n Usage: "-t import" to import data or "-t delete" to drop DB data'
      );
  }
  process.exit();
}

run();

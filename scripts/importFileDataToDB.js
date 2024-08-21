const fs = require('fs').promises;
const minimist = require('minimist');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const argv = minimist(process.argv.slice(2));

async function readFileData(type) {
  const fileData = await fs.readFile(
    `${__dirname}/../dev-data/data/${type}.json`,
    'utf-8'
  );
  return JSON.parse(fileData);
}

async function importData() {
  try {
    const tours = await readFileData('tours');
    const users = await readFileData('users');
    const reviews = await readFileData('reviews');

    await Promise.all([
      Tour.create(tours),
      User.create(users, { validateBeforeSave: false }),
      Review.create(reviews)
    ]);
    console.log('Data saved to DB successfully!');
  } catch (error) {
    console.log('Error importing data: ', error);
  }
}

async function dropDBData() {
  try {
    await Promise.all([
      Tour.deleteMany(),
      User.deleteMany(),
      Review.deleteMany()
    ]);
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

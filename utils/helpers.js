const { tourFields } = require('../utils/constants');

module.exports.parseFilterQuery = queryObject => {
  const filterObject = {};

  Object.entries(queryObject).forEach(([key, value]) => {
    if (tourFields.includes(key)) {
      filterObject[key] = value;
    }
  });

  return filterObject;
};

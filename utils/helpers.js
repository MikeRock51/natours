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

module.exports.filterObject = (obj, allowedFields) => {
  const filteredObject = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      filteredObject[key] = value;
    }
  });

  return filteredObject;
};

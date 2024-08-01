module.exports.filterObject = (obj, allowedFields) => {
  const filteredObject = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      filteredObject[key] = value;
    }
  });

  return filteredObject;
};

// const { tourFields } = require('./constants');
// const { filterObject } = require('./helpers');

class APIFeatures {
  constructor(dbQuery, reqQueries) {
    this.dbQuery = dbQuery;
    this.reqQueries = reqQueries;
  }

  filter() {
    // /** Filters query based on query params */
    // const filteredObject = filterObject(this.reqQueries, tourFields);
    // this.dbQuery.find(filteredObject);

    const queryObj = { ...this.reqQueries };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.dbQuery = this.dbQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    /**  */
    if (this.reqQueries.sort) {
      const sort = this.reqQueries.sort.split(',').join(' ');
      this.dbQuery.sort(sort);
    }
    return this;
  }

  limitFields() {
    /** Selects on requested fields on query */
    if (this.reqQueries.fields) {
      const fields = this.reqQueries.fields.split(',').join(' ');
      this.dbQuery.select(fields);
    }
    return this;
  }

  paginate() {
    /** Paginates the query */
    const { page = 1, limit } = this.reqQueries;
    this.dbQuery.skip((page - 1) * limit).limit(+limit || 0);
    return this;
  }
}

module.exports = APIFeatures;

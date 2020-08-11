'use strict';

const _ = require('lodash');
const utils = require('strapi-utils');

/**
 * default service
 *
 */
const createCoreService = ({ model, strapi }) => {
  const serviceFactory =
    model.kind === 'singleType' ? createSingleTypeService : createCollectionTypeService;

  const service = serviceFactory({ model, strapi });

  return _.extend(service, withSanitize({ model }));
};

/**
 * Mixins
 */
const withSanitize = ({ model }) => {
  const { getNonWritableAttributes } = utils.contentTypes;

  return {
    sanitizeInput: data => _.omit(data, getNonWritableAttributes(model)),
  };
};

/**
 * Returns a single type service to handle default core-api actions
 */
const createSingleTypeService = ({ model, strapi }) => {
  const { modelName } = model;

  return {
    /**
     * Returns single type content
     *
     * @return {Promise}
     */
    find(populate) {
      return strapi.entityService.find({ populate }, { model: modelName });
    },

    /**
     * Creates or update the single- type content
     *
     * @return {Promise}
     */
    async createOrUpdate(data, { files } = {}) {
      const entity = await this.find();
      const sanitizedData = this.sanitizeInput(data, model);

      if (!entity) {
        return strapi.entityService.create({ data: sanitizedData, files }, { model: modelName });
      } else {
        return strapi.entityService.update(
          {
            params: {
              id: entity.id,
            },
            data: sanitizedData,
            files,
          },
          { model: modelName }
        );
      }
    },

    /**
     * Deletes the single type content
     *
     * @return {Promise}
     */
    async delete() {
      const entity = await this.find();

      if (!entity) return;

      return strapi.entityService.delete({ params: { id: entity.id } }, { model: modelName });
    },
  };
};

/**
 *
 * Returns a collection type service to handle default core-api actions
 */
const createCollectionTypeService = ({ model, strapi }) => {
  const { modelName } = model;

  return {
    /**
     * Promise to fetch all records
     *
     * @return {Promise}
     */
    find(params, populate) {
      return strapi.entityService.find({ params, populate }, { model: modelName });
    },

    /**
     * Promise to fetch record
     *
     * @return {Promise}
     */

    findOne(params, populate) {
      return strapi.entityService.findOne({ params, populate }, { model: modelName });
    },

    /**
     * Promise to count record
     *
     * @return {Promise}
     */

    count(params) {
      return strapi.entityService.count({ params }, { model: modelName });
    },

    /**
     * Promise to add record
     *
     * @return {Promise}
     */

    create(data, { files } = {}) {
      const sanitizedData = this.sanitizeInput(data, model);
      return strapi.entityService.create({ data: sanitizedData, files }, { model: modelName });
    },

    /**
     * Promise to edit record
     *
     * @return {Promise}
     */

    update(params, data, { files } = {}) {
      const sanitizedData = this.sanitizeInput(data, model);
      return strapi.entityService.update(
        { params, data: sanitizedData, files },
        { model: modelName }
      );
    },

    /**
     * Promise to delete a record
     *
     * @return {Promise}
     */

    delete(params) {
      return strapi.entityService.delete({ params }, { model: modelName });
    },

    /**
     * Promise to search records
     *
     * @return {Promise}
     */

    search(params) {
      return strapi.entityService.search({ params }, { model: modelName });
    },

    /**
     * Promise to count searched records
     *
     * @return {Promise}
     */
    countSearch(params) {
      return strapi.entityService.countSearch({ params }, { model: modelName });
    },
  };
};

module.exports = createCoreService;

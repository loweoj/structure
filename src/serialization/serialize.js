const { isPlainObject } = require('lodash');
const { SCHEMA } = require('../symbols');
const getType = require('../typeResolver');

function serialize(structure, toJSONOpts) {
  if(structure == null) {
    return structure;
  }

  const schema = structure[SCHEMA];

  return serializeStructure(structure, schema, toJSONOpts);
}

function getTypeSchema(typeDescriptor) {
  return getType(typeDescriptor)[SCHEMA];
}

function serializeStructure(structure, schema, toJSONOpts) {
  const serializedStructure = Object.create(null);

  for (let attrName in schema) {
    let attribute = structure[attrName];

    if(isPresent(attribute) || isNullable(attribute, schema, attrName)) {
      serializedStructure[attrName] = serializeAttribute(attribute, attrName,
        schema, toJSONOpts);
    }
  }

  return serializedStructure;
}

function isPresent(attribute) {
  return attribute != null;
}

function isNullable(attribute, schema, attrName) {
  return attribute !== undefined && schema[attrName].nullable;
}

function serializeAttribute(attribute, attrName, schema, toJSONOpts) {
  if(isArrayType(schema, attrName)) {
    return serializeArrayType(attribute, toJSONOpts);
  }

  if (isObjectType(attribute)) {
    return serializeObjectType(attribute, toJSONOpts);
  }

  if(isNestedSchema(schema, attrName)) {
    return serializeNestedType(attribute, toJSONOpts);
  }

  return attribute;
}

function serializeArrayType(attribute, toJSONOpts) {
  return attribute.map(item => {
    if (item && typeof item.toJSON === 'function') {
      return item.toJSON(toJSONOpts);
    }

    return serialize(item);
  });
}

function serializeNestedType(attribute, toJSONOpts) {
  if (attribute == null) {
    return attribute;
  }

  return attribute.toJSON(toJSONOpts);
}

function serializeObjectType(attribute, toJSONOpts) {
  return Object.keys(attribute).reduce((serialized, key) => {
    const item = attribute[key];

    serialized[key] = item && typeof item.toJSON === 'function' ?
      item.toJSON(toJSONOpts) : item;

    return serialized;
  }, {});
}

function isArrayType(schema, attrName) {
  return schema[attrName].itemType && getTypeSchema(schema[attrName].itemType);
}

function isObjectType(attribute) {
  return isPlainObject(attribute) && Object.values(attribute).some(value => value && value[SCHEMA]);
}

function isNestedSchema(schema, attrName) {
  return getTypeSchema(schema[attrName]);
}

module.exports = serialize;

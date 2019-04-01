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

  for(let attrName in schema) {
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
    return attribute.map(item => {
      if (item && typeof item.toJSON === 'function') {
        return item.toJSON(toJSONOpts);
      }

      return serialize(item);
    });
  }

  if(isNestedSchema(schema, attrName)) {
    if (attribute == null) {
      return attribute;
    }

    return attribute.toJSON(toJSONOpts);
  }

  return attribute;
}

function isArrayType(schema, attrName) {
  return schema[attrName].itemType && getTypeSchema(schema[attrName].itemType);
}

function isNestedSchema(schema, attrName) {
  return getTypeSchema(schema[attrName]);
}

module.exports = serialize;

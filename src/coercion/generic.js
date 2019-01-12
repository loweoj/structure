const { isFunction } = require('lodash');
const getType = require('../typeResolver');

module.exports = function genericCoercionFor(typeDescriptor) {
  return function coerce(value) {
    if(value === undefined) {
      return;
    }

    const type = getType(typeDescriptor);

    if (!needsCoercion(value, type, typeDescriptor)) {
      return value;
    }

    return new type(value);
  };
};

function needsCoercion(value, type, typeDescriptor) {
  if (typeDescriptor && isFunction(typeDescriptor.needsCoercion)) {
    return typeDescriptor.needsCoercion(value);
  }

  return !(value instanceof type);
}

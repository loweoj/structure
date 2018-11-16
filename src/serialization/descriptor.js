const serialize = require('./serialize');

module.exports = WrapperClass => ({
  value: function toJSON() {
    const serialized = serialize(this);

    if (WrapperClass.toJSON) {
      return WrapperClass.toJSON(serialized);
    }

    return serialized;
  }
});

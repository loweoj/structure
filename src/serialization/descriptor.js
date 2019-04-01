const serialize = require('./serialize');

module.exports = WrapperClass => ({
  value: function toJSON({ raw } = {}) {
    const serialized = serialize(this, { raw });

    if (WrapperClass.toJSON && !raw) {
      return WrapperClass.toJSON(serialized);
    }

    return serialized;
  }
});

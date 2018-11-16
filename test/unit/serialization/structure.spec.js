const { expect } = require('chai');
const { attributes } = require('../../../src');

describe('serialization', () => {
  describe('Structure', () => {
    var User;

    beforeEach(() => {
      User = attributes({
        name: String,
        age: Number
      })(class User {});
    });

    context('when all data is present', () => {
      it('include all data defined on schema', () => {
        const user = new User({
          name: 'Something',
          age: 42
        });

        expect(user.toJSON()).to.eql({
          name: 'Something',
          age: 42
        });
      });
    });

    context('when some attribute is missing', () => {
      it('does not set a key for missing attribute', () => {
        const user = new User({
          name: 'Some name',
          age: undefined
        });

        const serializedUser = user.toJSON();

        expect(serializedUser).to.eql({
          name: 'Some name',
        });

        expect(serializedUser).to.have.all.keys(['name']);
      });
    });
  });

  describe('Custom toJSON method', () => {
    it('it should call toJSON on class if exists', () => {
      var User = attributes({
        name: String,
        age: Number
      })(class User {
        static toJSON() {
          return {
            overridden: true
          };
        }
      });

      const user = new User({
        name: 'Something',
        age: 42
      });

      expect(user.toJSON()).to.eql({
        overridden: true
      });
    });

    it('toJSON should be passed the serialized json', () => {
      var User = attributes({
        name: String,
        age: Number
      })(class User {
        static toJSON(json) {
          json.someProp = true;
          return json;
        }
      });

      const user = new User({
        name: 'Something',
        age: 42
      });

      expect(user.toJSON()).to.eql({
        name: 'Something',
        age: 42,
        someProp: true
      });
    });
  });
});

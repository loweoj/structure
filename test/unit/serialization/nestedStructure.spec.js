const { expect } = require('chai');
const { attributes } = require('../../../src');

describe('serialization', () => {
  describe('Nested structure', () => {
    var Location;
    var User;

    beforeEach(() => {
      Location = attributes({
        longitude: Number,
        latitude: Number
      })(class Location {});

      User = attributes({
        name: String,
        location: Location
      })(class User {});
    });

    context('when all data is present', () => {
      it('include all data defined on schema', () => {
        const location = new Location({
          longitude: 123,
          latitude: 321
        });

        const user = new User({
          name: 'Something',
          location
        });

        expect(user.toJSON()).to.eql({
          name: 'Something',
          location: {
            longitude: 123,
            latitude: 321
          }
        });
      });
    });

    context('when nested structure is missing', () => {
      it('does not set a key for missing structure', () => {
        const user = new User({
          name: 'Some name'
        });

        const serializedUser = user.toJSON();

        expect(serializedUser).to.eql({
          name: 'Some name',
        });

        expect(serializedUser).to.have.all.keys(['name']);
      });
    });

    context('when some attribute on nested structure is missing', () => {
      it('does not set a key for missing nested attribute', () => {
        const location = new Location({
          longitude: 123
        });

        const user = new User({
          name: 'Name',
          location
        });

        const serializedUser = user.toJSON();

        expect(serializedUser).to.eql({
          name: 'Name',
          location: {
            longitude: 123
          }
        });

        expect(serializedUser.location).to.have.all.keys(['longitude']);
      });
    });
  });

  describe('Nested structure with dynamic attribute types', () => {
    var CircularUser;
    var CircularBook;

    beforeEach(() => {
      CircularUser = require('../../fixtures/CircularUser');
      CircularBook = require('../../fixtures/CircularBook');
    });

    context('when all data is present', () => {
      it('include all data defined on schema', () => {
        const user = new CircularUser({
          name: 'Something',
          friends: [
            new CircularUser({
              name: 'Friend 1',
              favoriteBook: new CircularBook({ name: 'Book 1' })
            }),
            new CircularUser({
              name: 'Friend 2',
              favoriteBook: new CircularBook({ name: 'Book 2'})
            })
          ],
          favoriteBook: new CircularBook({ name: 'The Book'})
        });

        expect(user.toJSON()).to.eql({
          name: 'Something',
          friends: [
            {
              name: 'Friend 1',
              favoriteBook: { name: 'Book 1' }
            },
            {
              name: 'Friend 2',
              favoriteBook: { name: 'Book 2'}
            }
          ],
          favoriteBook: { name: 'The Book' }
        });
      });
    });

    context('when nested structure is missing', () => {
      it('does not set a key for missing structure', () => {
        const user = new CircularUser({
          name: 'Something'
        });

        expect(user.toJSON()).to.eql({
          name: 'Something'
        });
      });
    });

    context('when some attribute on nested structure is missing', () => {
      it('does not set a key for missing nested attribute', () => {
        const user = new CircularUser({
          name: 'Something',
          favoriteBook: new CircularBook({})
        });

        expect(user.toJSON()).to.eql({
          name: 'Something',
          favoriteBook: {}
        });
      });
    });

    context('when nested structure has a static toJSON method', () => {
      it('should call the toJSON method of nested array types', () => {
        var Book = attributes({
          title: String,
        })(class Book {
          static toJSON(json) {
            json.isbn = '123456789';
            return json;
          }
        });

        var User = attributes({
          name: String,
          age: Number,
          favouriteBooks: {
            type: Array,
            itemType: Book
          }
        })(class User {
          static toJSON(json) {
            json.name = 'Hello ' + json.name;
            return json;
          }
        });

        const aBook = new Book({
          title: 'aBook'
        });

        const bBook = new Book({
          title: 'bBook'
        });

        const user = new User({
          name: 'Something',
          age: 42,
          favouriteBooks: [aBook, bBook]
        });

        expect(user.toJSON()).to.eql({
          name: 'Hello Something',
          age: 42,
          favouriteBooks: [{
            title: 'aBook',
            isbn: '123456789',
          }, {
            title: 'bBook',
            isbn: '123456789',
          }]
        });
      });

      it('should ignore the toJSON method of nested structures if raw: true is set', () => {
        var Book = attributes({
          title: String,
        })(class Book {
          static toJSON(json) {
            json.isbn = '123456789';
            return json;
          }
        });

        var User = attributes({
          name: String,
          age: Number,
          favouriteBooks: {
            type: Array,
            itemType: Book
          },
          translatableBooks: Object
        })(class User {
          static toJSON(json) {
            json.name = 'Hello ' + json.name;
            return json;
          }
        });

        const aBook = new Book({
          title: 'aBook'
        });

        const bBook = new Book({
          title: 'bBook'
        });

        const enGBook = new Book({
          title: 'enGBook'
        });

        const user = new User({
          name: 'Something',
          age: 42,
          favouriteBooks: [aBook, bBook],
          translatableBooks: {
            'en-GB': enGBook,
            'fr-FR': null,
            'de-DE': '',
            'nl-NL': ['some', 'array'],
            'en': { some: 'Object' }
          }
        });

        expect(user.toJSON({ raw: true })).to.eql({
          name: 'Something',
          age: 42,
          favouriteBooks: [{
            title: 'aBook'
          }, {
            title: 'bBook'
          }],
          translatableBooks: {
            'fr-FR': null,
            'de-DE': '',
            'nl-NL': ['some', 'array'],
            'en': { some: 'Object'},
            'en-GB': {
              title: 'enGBook'
            }
          }
        });
      });
    });
  });
});

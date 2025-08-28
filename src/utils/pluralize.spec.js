import {expect} from 'chai';
import {pluralize} from './pluralize.js';

describe('pluralize function', function () {
  describe('basic pluralization rules', function () {
    it('should add "s" to simple nouns', function () {
      expect(pluralize('apple')).to.equal('apples');
      expect(pluralize('table')).to.equal('tables');
    });

    it('should add "es" to nouns ending in s, x, z, ch, sh', function () {
      expect(pluralize('box')).to.equal('boxes');
      expect(pluralize('watch')).to.equal('watches');
      expect(pluralize('dish')).to.equal('dishes');
      expect(pluralize('buzz')).to.equal('buzzes');
    });

    it('should change "y" to "ies" for nouns ending in a consonant + y', function () {
      expect(pluralize('city')).to.equal('cities');
      expect(pluralize('party')).to.equal('parties');
    });

    it('should just add "s" for nouns ending in a vowel + y', function () {
      expect(pluralize('boy')).to.equal('boys');
      expect(pluralize('key')).to.equal('keys');
    });
  });

  describe('handling already plural nouns', function () {
    it('should not change nouns that are already plural', function () {
      expect(pluralize('apples')).to.equal('apples');
      expect(pluralize('boxes')).to.equal('boxes');
      expect(pluralize('cities')).to.equal('cities');
    });
  });

  describe('handling singular exceptions', function () {
    it('should correctly pluralize nouns from the exceptions list', function () {
      expect(pluralize('bus')).to.equal('buses');
      expect(pluralize('process')).to.equal('processes');
      expect(pluralize('status')).to.equal('statuses');
      expect(pluralize('business')).to.equal('businesses');
    });

    it('should not change already pluralized exceptions', function () {
      expect(pluralize('buses')).to.equal('buses');
      expect(pluralize('processes')).to.equal('processes');
    });

    it('should not change words that were removed from exceptions (like analysis)', function () {
      expect(pluralize('analysis')).to.equal('analysis');
      expect(pluralize('thesis')).to.equal('thesis');
    });
  });

  describe('handling capital letters', function () {
    it('should preserve case for the base word and add lowercase endings', function () {
      expect(pluralize('Apple')).to.equal('Apples');
      expect(pluralize('Bus')).to.equal('Buses');
      expect(pluralize('City')).to.equal('Cities');
    });

    it('should add uppercase endings for all-caps words', function () {
      expect(pluralize('APPLE')).to.equal('APPLES');
      expect(pluralize('BUS')).to.equal('BUSES');
      expect(pluralize('CITY')).to.equal('CITIES');
    });
  });

  describe('handling multi-word strings and different casings', function () {
    it('should pluralize the end of a camelCase string', function () {
      expect(pluralize('userProfile')).to.equal('userProfiles');
      expect(pluralize('accessPass')).to.equal('accessPasses');
      expect(pluralize('dataEntry')).to.equal('dataEntries');
    });

    it('should pluralize the end of a PascalCase string', function () {
      expect(pluralize('UserProfile')).to.equal('UserProfiles');
      expect(pluralize('AccessPass')).to.equal('AccessPasses');
      expect(pluralize('DataEntry')).to.equal('DataEntries');
    });

    it('should pluralize the end of a snake_case string', function () {
      expect(pluralize('user_profile')).to.equal('user_profiles');
      expect(pluralize('access_pass')).to.equal('access_passes');
      expect(pluralize('data_entry')).to.equal('data_entries');
    });

    it('should pluralize the end of an UPPER_CASE string', function () {
      expect(pluralize('USER_PROFILE')).to.equal('USER_PROFILES');
      expect(pluralize('ACCESS_PASS')).to.equal('ACCESS_PASSES');
      expect(pluralize('DATA_ENTRY')).to.equal('DATA_ENTRIES');
      // проверка сохранения регистра для 'y' -> 'ies'
      expect(pluralize('API_KEY')).to.equal('API_KEYS');
      expect(pluralize('COMPANY_PARTY')).to.equal('COMPANY_PARTIES');
    });

    it('should not change already pluralized multi-word strings', function () {
      expect(pluralize('userProfiles')).to.equal('userProfiles');
      expect(pluralize('access_passes')).to.equal('access_passes');
      expect(pluralize('DATA_ENTRIES')).to.equal('DATA_ENTRIES');
    });
  });

  describe('edge cases and invalid input', function () {
    it('should return the input unchanged for empty strings', function () {
      expect(pluralize('')).to.equal('');
    });
  });
});

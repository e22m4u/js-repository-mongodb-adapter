import {expect} from 'chai';
import {toCamelCase} from './to-camel-case.js';

describe('toCamelCase function', function () {
  describe('PascalCase inputs', function () {
    it('should convert a simple PascalCase string to camelCase', function () {
      expect(toCamelCase('UserModel')).to.equal('userModel');
    });

    it('should convert a single PascalCase word to lowercase', function () {
      expect(toCamelCase('User')).to.equal('user');
    });

    it('should correctly split multiple words in PascalCase', function () {
      expect(toCamelCase('UserLoginAttempt')).to.equal('userLoginAttempt');
    });
  });

  describe('snake_case and kebab-case inputs', function () {
    it('should convert a snake_case string to camelCase', function () {
      expect(toCamelCase('user_model')).to.equal('userModel');
    });

    it('should convert a kebab-case string to camelCase', function () {
      expect(toCamelCase('user-model-data')).to.equal('userModelData');
    });

    it('should handle leading and trailing separators', function () {
      expect(toCamelCase('_user_model_')).to.equal('userModel');
      expect(toCamelCase('-user-model-')).to.equal('userModel');
    });
  });

  describe('ALL_CAPS inputs', function () {
    it('should convert an ALL_CAPS word to lowercase', function () {
      expect(toCamelCase('USER')).to.equal('user');
    });

    it('should convert an ALL_CAPS_SNAKE_CASE string to camelCase', function () {
      expect(toCamelCase('USER_MODEL')).to.equal('userModel');
    });

    it('should handle ALL_CAPS words without separators', function () {
      expect(toCamelCase('USERMODEL')).to.equal('usermodel');
    });
  });

  describe('Mixed and complex inputs', function () {
    it('should be idempotent (not change an already camelCased string)', function () {
      expect(toCamelCase('userModel')).to.equal('userModel');
    });

    it('should handle mixed cases like Pascal_Snake_Case', function () {
      expect(toCamelCase('User_Login_Attempt')).to.equal('userLoginAttempt');
    });

    it('should handle strings with numbers', function () {
      expect(toCamelCase('Version1_2_3')).to.equal('version123');
      expect(toCamelCase('user_model_v2')).to.equal('userModelV2');
    });
  });

  describe('Edge cases and invalid inputs', function () {
    it('should return an empty string for falsy or empty inputs', function () {
      expect(toCamelCase('')).to.equal('');
      expect(toCamelCase(null)).to.equal('');
      expect(toCamelCase(undefined)).to.equal('');
    });

    it('should handle a string that is just a separator', function () {
      expect(toCamelCase('_')).to.equal('');
      expect(toCamelCase('__--__')).to.equal('');
    });
  });
});

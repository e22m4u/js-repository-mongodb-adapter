import {expect} from 'chai';
import {modelNameToCollectionName} from './model-name-to-collection-name.js';

describe('modelNameToCollectionName', function () {
  it('should correctly pluralize and remove the "Model" suffix for standard names', function () {
    expect(modelNameToCollectionName('userModel')).to.equal('users');
    expect(modelNameToCollectionName('UserModel')).to.equal('users');
    expect(modelNameToCollectionName('user_model')).to.equal('users');
    expect(modelNameToCollectionName('USER_MODEL')).to.equal('users');
    expect(modelNameToCollectionName('articleModel')).to.equal('articles');
    expect(modelNameToCollectionName('ArticleModel')).to.equal('articles');
    expect(modelNameToCollectionName('article_model')).to.equal('articles');
    expect(modelNameToCollectionName('ARTICLE_MODEL')).to.equal('articles');
  });

  it('should just pluralize names that do not have the "Model" suffix', function () {
    expect(modelNameToCollectionName('user')).to.equal('users');
    expect(modelNameToCollectionName('User')).to.equal('users');
    expect(modelNameToCollectionName('USER')).to.equal('users');
    expect(modelNameToCollectionName('article')).to.equal('articles');
    expect(modelNameToCollectionName('Article')).to.equal('articles');
    expect(modelNameToCollectionName('ARTICLE')).to.equal('articles');
  });

  it('should correctly handle already pluralized names with the "Model" suffix', function () {
    expect(modelNameToCollectionName('usersModel')).to.equal('users');
    expect(modelNameToCollectionName('UsersModel')).to.equal('users');
    expect(modelNameToCollectionName('users_model')).to.equal('users');
    expect(modelNameToCollectionName('USERS_MODEL')).to.equal('users');
    expect(modelNameToCollectionName('articlesModel')).to.equal('articles');
    expect(modelNameToCollectionName('ArticlesModel')).to.equal('articles');
    expect(modelNameToCollectionName('articles_model')).to.equal('articles');
    expect(modelNameToCollectionName('ARTICLES_MODEL')).to.equal('articles');
  });

  it('should correctly handle already pluralized names', function () {
    expect(modelNameToCollectionName('users')).to.equal('users');
    expect(modelNameToCollectionName('Users')).to.equal('users');
    expect(modelNameToCollectionName('USERS')).to.equal('users');
    expect(modelNameToCollectionName('articles')).to.equal('articles');
    expect(modelNameToCollectionName('Articles')).to.equal('articles');
    expect(modelNameToCollectionName('ARTICLES')).to.equal('articles');
  });

  it('should correctly handle different pluralization rules (like y -> ies)', function () {
    expect(modelNameToCollectionName('companyModel')).to.equal('companies');
    expect(modelNameToCollectionName('CompanyModel')).to.equal('companies');
    expect(modelNameToCollectionName('company_model')).to.equal('companies');
    expect(modelNameToCollectionName('COMPANY_MODEL')).to.equal('companies');
  });

  it('should correctly handle exceptions from pluralize (like status -> statuses)', function () {
    expect(modelNameToCollectionName('statusModel')).to.equal('statuses');
    expect(modelNameToCollectionName('StatusModel')).to.equal('statuses');
    expect(modelNameToCollectionName('status_model')).to.equal('statuses');
    expect(modelNameToCollectionName('STATUS_MODEL')).to.equal('statuses');
  });

  it('should handle edge cases where removing "Model" leaves a short word', function () {
    expect(modelNameToCollectionName('myModel')).to.equal('myModels');
    expect(modelNameToCollectionName('MyModel')).to.equal('myModels');
    expect(modelNameToCollectionName('my_model')).to.equal('myModels');
    expect(modelNameToCollectionName('MY_MODEL')).to.equal('myModels');
    expect(modelNameToCollectionName('doModel')).to.equal('doModels');
    expect(modelNameToCollectionName('DoModel')).to.equal('doModels');
    expect(modelNameToCollectionName('do_model')).to.equal('doModels');
    expect(modelNameToCollectionName('DO_MODEL')).to.equal('doModels');
  });

  it('should remove the "Model" suffix case-insensitively', function () {
    expect(modelNameToCollectionName('Usermodel')).to.equal('users');
    expect(modelNameToCollectionName('USERMODEL')).to.equal('users');
  });

  it('should handle names that contain "Model" but not at the end', function () {
    expect(modelNameToCollectionName('remodelAction')).to.equal(
      'remodelActions',
    );
    expect(modelNameToCollectionName('RemodelAction')).to.equal(
      'remodelActions',
    );
    expect(modelNameToCollectionName('remodel_action')).to.equal(
      'remodelActions',
    );
    expect(modelNameToCollectionName('REMODEL_ACTION')).to.equal(
      'remodelActions',
    );
  });
});

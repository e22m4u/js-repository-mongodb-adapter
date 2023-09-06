const path = require('path');

module.exports = {
  extension: ['js'],
  spec: 'src/**/*.spec.js',
  require: [path.join(__dirname, 'mocha.setup.js')],
}

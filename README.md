## @e22m4u/js-repository-mongodb-adapter

*English | [Русский](README-ru.md)*

MongoDB adapter for [@e22m4u/js-repository](https://www.npmjs.com/package/@e22m4u/js-repository)

## Installation

```bash
npm install @e22m4u/js-repository-mongodb-adapter
```

## Configuration

All parameters are optional:

| name     | default value         |
|----------|-----------------------|
| protocol | `'mongodb'`           |
| host     | `'127.0.0.1'`         |
| port     | `27017`               |
| database | `'database'`          |
| username | `undefined`           |
| password | `undefined`           |

Example:

```js
import {Schema} from '@e22m4u/js-repository';

const schema = new Schema();

// define datasource
schema.defineDatasource({
  name: 'myMongo', // datasource name
  adapter: 'mongodb', // adapter name
  // configuration
  host: '127.0.0.1',
  port: 27017,
  database: 'myDatabase',
});

// define model
schema.defineModel({
  name: 'user', // model name
  datasource: 'myMongo', // datasource name (see above)
  properties: { // model fields
    name: 'string',
    surname: 'string',
  },
});

// get repository by model name and create a record
const userRep = schema.getRepository('user');
const user = await userRep.create({name: 'John', surname: 'Doe'});

console.log(user);
// {
//   id: '64f3454e5e0893c13f9bf47e',
//   name: 'John',
//   surname: 'Doe',
// }
```

## Testing

Start `mongo:latest` container using `setup.sh` script.

```bash
./setup.sh
```

Run tests

```bash
npm run test
```

## License

MIT

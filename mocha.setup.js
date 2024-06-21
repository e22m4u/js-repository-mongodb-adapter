import url from 'url';
import dotenv from 'dotenv';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

process.env['NODE_ENV'] = 'test';
const dirname = url.fileURLToPath(new URL('.', import.meta.url));
const envFile = `${dirname}/${process.env['NODE_ENV']}.env`;
dotenv.config({path: envFile});

chai.use(chaiAsPromised);

import url from 'url';
import chai from 'chai';
import dotenv from 'dotenv';
import chaiSpies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';

process.env['NODE_ENV'] = 'test';
const dirname = url.fileURLToPath(new URL('.', import.meta.url));
const envFile = `${dirname}/${process.env['NODE_ENV']}.env`;
dotenv.config({path: envFile});

chai.use(chaiSpies);
chai.use(chaiAsPromised);

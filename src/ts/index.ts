import '../sass/styles.scss';

const APP_CONFIG = require('./config.json');

const { default: SPAHandler } = require('./handlers/SPAHandler.ts');

const spa = new SPAHandler(APP_CONFIG);
spa.init();

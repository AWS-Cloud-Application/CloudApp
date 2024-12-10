const StatsD = require('node-statsd');

const statsdClient = new StatsD({
    host: 'localhost',
    port: 8125
});

module.exports = statsdClient;

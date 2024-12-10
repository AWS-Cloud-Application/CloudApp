
const { checkDbConnection } = require('../databaseConfig/databaseConnect.js');

const healthCheck = async () => {
    return await checkDbConnection();
};

module.exports = { healthCheck };

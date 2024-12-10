const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConfig/databaseConnect');

const Image = sequelize.define('Image', {
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upload_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false
    }
});

module.exports = Image;

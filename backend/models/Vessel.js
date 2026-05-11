const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vessel = sequelize.define('Vessel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vesselName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vesselType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imoNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Vessel;

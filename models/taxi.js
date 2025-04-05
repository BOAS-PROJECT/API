'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Taxi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.CarMake, { foreignKey: 'makeId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Owner, { foreignKey: 'ownerId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Driver, { foreignKey: 'driverId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Taxi.init({
    type: DataTypes.ENUM('Private', 'Public'),
    cityId: DataTypes.INTEGER,
    makeId: DataTypes.INTEGER,
    ownerId: DataTypes.INTEGER,
    driverId: DataTypes.INTEGER,
    numberChassi: DataTypes.STRING,
    numberCartegrise: DataTypes.STRING,
    licensePlate: DataTypes.STRING,
    image: DataTypes.STRING,
    order: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    isAvailable: DataTypes.BOOLEAN,
    isOnline: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Taxi',
  });
  return Taxi;
};
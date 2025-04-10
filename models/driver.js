'use strict';
const { Model } = require('sequelize');
const io = require('../app');
module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //this.hasMany(models.Owner, { foreignKey: 'driverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'driverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Notification, { foreignKey: 'driverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.City, { foreignKey: 'cityId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Taxi, { foreignKey: 'driverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Driver.init({
    cityId: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    maritalStatus: DataTypes.STRING,
    numberPlate: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    birthday: DataTypes.STRING,
    quarter: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    availability: DataTypes.INTEGER,
    photo: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    token: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT 
  }, {
    sequelize,
    modelName: 'Driver',
    hooks: {
      afterUpdate: (driver, options) => {
        if (driver.changed('latitude') || driver.changed('longitude')) {
          io.emit('driverLocation', {
            driverId: driver.id,
            latitude: driver.latitude,
            longitude: driver.longitude
          });
        }
      }
    }
  });
  return Driver;
};
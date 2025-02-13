'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.CarMake, { foreignKey: 'makeId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Rating, { foreignKey: 'carId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'carId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.CarImage, { foreignKey: 'carId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }); 
    }
  }
  Car.init({
    cityId: DataTypes.INTEGER,
    makeId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    priceWithoutDriver: DataTypes.DOUBLE,
    priceWithDriver: DataTypes.DOUBLE,
    priceFuelwithDriver: DataTypes.DOUBLE,
    priceFuelWithoutDriver: DataTypes.DOUBLE,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    seats: DataTypes.INTEGER,
    fuel: DataTypes.STRING,
    caution: DataTypes.DOUBLE,
    transmission: DataTypes.STRING,
    licensePlate: DataTypes.STRING,
    isDriver: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    descriptionWithDriver: DataTypes.TEXT,
    descriptionWithoutDriver: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Car',
  });
  return Car;
};
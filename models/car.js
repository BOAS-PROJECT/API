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
    }
  }
  Car.init({
    makeId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    priceWithoutDriver: DataTypes.DOUBLE,
    priceWithDriver: DataTypes.DOUBLE,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    seats: DataTypes.INTEGER,
    transmission: DataTypes.STRING,
    licensePlate: DataTypes.STRING,
    isDriver: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Car',
  });
  return Car;
};
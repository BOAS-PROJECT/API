'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarMoving extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.CarMake, { foreignKey: 'makeId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'carMovingId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.CarMovingImage, { foreignKey: 'carMovingId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  CarMoving.init({
    cityId: DataTypes.INTEGER,
    makeId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    volume: DataTypes.DOUBLE,
    tonage: DataTypes.DOUBLE,
    price: DataTypes.DOUBLE,
    description: DataTypes.TEXT,
    priceHandling: DataTypes.DOUBLE,
    licensePlate: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CarMoving',
  });
  return CarMoving;
};
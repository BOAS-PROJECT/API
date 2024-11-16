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
      this.belongsTo(models.CarMake, { foreignKey: 'makeId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  CarMoving.init({
    makeId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    volume: DataTypes.DOUBLE,
    tonage: DataTypes.DOUBLE,
    price: DataTypes.DOUBLE,
    licensePlate: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CarMoving',
  });
  return CarMoving;
};
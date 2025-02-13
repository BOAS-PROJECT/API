'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Car, { foreignKey: 'carId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  CarImage.init({
    carId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CarImage',
  });
  return CarImage;
};
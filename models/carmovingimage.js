'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarMovingImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.CarMoving, { foreignKey: 'carmovingId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  CarMovingImage.init({
    carmovingId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CarMovingImage',
  });
  return CarMovingImage;
};
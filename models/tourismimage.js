'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TourismImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Tourism, { foreignKey: 'tourismId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  TourismImage.init({
    tourismId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TourismImage',
  });
  return TourismImage;
};
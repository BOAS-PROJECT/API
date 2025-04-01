'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pricing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Pricing.init({
    cityId: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    distance: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    priceMax1: DataTypes.DOUBLE,
    priceMax2: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Pricing',
  });
  return Pricing;
};
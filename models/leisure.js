'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Leisure extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.LeisureImage, { foreignKey: 'leisureId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'leisureId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Leisure.init({
    cityId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    address: DataTypes.STRING,
    details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Leisure',
  });
  return Leisure;
};
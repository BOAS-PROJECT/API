'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tourism extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.TourismImage, { foreignKey: 'tourismId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'tourismId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Tourism.init({
    cityId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    descriptions: DataTypes.TEXT,
    address: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tourism',
  });
  return Tourism;
};
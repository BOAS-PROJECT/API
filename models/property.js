'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.PropertyType, { foreignKey: 'typeId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.PropertyImage, { foreignKey: 'propertyId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'propertyId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Property.init({
    typeId: DataTypes.INTEGER,
    cityId: DataTypes.INTEGER,
    ownerId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DOUBLE,
    surface: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Property',
  });
  return Property;
};
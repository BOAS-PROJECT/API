'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pharmacy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, { foreignKey: 'cityId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Reservation, { foreignKey: 'pharmacyId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Pharmacy.init({
    cityId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pharmacy',
  });
  return Pharmacy;
};
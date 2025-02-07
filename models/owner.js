'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Owner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Property, { foreignKey: 'ownerId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      //this.hasMany(models.OwnerProperty, { foreignKey: 'ownerId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.hasMany(models.Driver, { foreignKey: 'ownerId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Owner.init({
    driverId: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    nationality: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    cni: DataTypes.STRING,
    rib: DataTypes.STRING,
    bank: DataTypes.STRING,
    contrat: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Owner',
  });
  return Owner;
};
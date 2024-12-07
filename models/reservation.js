'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'userId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Car, { foreignKey: 'carId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Driver, { foreignKey: 'driverId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.CarMoving, { foreignKey: 'carMovingId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Tourism, { foreignKey: 'tourismId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.PaymentMethod, { foreignKey: 'paymentMethodId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Leisure, { foreignKey: 'leisureId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Property, { foreignKey: 'propertyId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Reservation.init({
    userId: DataTypes.INTEGER,
    carId: DataTypes.INTEGER,
    driverId: DataTypes.INTEGER,
    carMovingId: DataTypes.INTEGER,
    pharmacyId: DataTypes.INTEGER,
    propertyId: DataTypes.INTEGER,
    tourismId: DataTypes.INTEGER,
    leisureId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    attachment: DataTypes.STRING,
    status: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    amount: DataTypes.DOUBLE,
    days: DataTypes.INTEGER,
    date: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};
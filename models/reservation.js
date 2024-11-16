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
    }
  }
  Reservation.init({
    userId: DataTypes.INTEGER,
    carId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    day: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    date: DataTypes.STRING,
    attachment: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};
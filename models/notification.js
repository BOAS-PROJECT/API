'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'userId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Driver, { foreignKey: 'driverId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      this.belongsTo(models.Reservation, { foreignKey: 'reservationId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Notification.init({
    userId: DataTypes.INTEGER,
    driverId: DataTypes.INTEGER,
    reservationId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};
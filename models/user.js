'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Reservation, { foreignKey: 'userId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  User.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    genre: DataTypes.ENUM('Homme', 'Femme'),
    city: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    photo: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
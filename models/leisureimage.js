'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeisureImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Leisure, { foreignKey: 'leisureId' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  LeisureImage.init({
    leisureId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LeisureImage',
  });
  return LeisureImage;
};
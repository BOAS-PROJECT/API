'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CarMovings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      makeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CarMakes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      volume: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      tonage: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      priceHandling: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CarMovings');
  }
};
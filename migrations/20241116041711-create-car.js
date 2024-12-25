'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      image: {
        type: Sequelize.STRING,
        allowNull: false
      },
      priceWithoutDriver: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      priceWithDriver: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      priceFuelwithDriver: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      priceFuelWithoutDriver: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      transmission: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isDriver: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fuel: {
        type: Sequelize.STRING,
        allowNull: false
      },
      caution: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      descriptionWithDriver: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      descriptionWithoutDriver: {
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
    await queryInterface.dropTable('Cars');
  }
};
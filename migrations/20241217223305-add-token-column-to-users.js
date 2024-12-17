'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'token', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null, // Token facultatif, peut être null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'token');
  }
};

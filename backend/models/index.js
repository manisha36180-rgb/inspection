const User = require('./User');
const Vessel = require('./Vessel');
const Report = require('./Report');

// User - Vessel (Created By)
User.hasMany(Vessel, { foreignKey: 'createdBy', as: 'vessels' });
Vessel.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Vessel - Report
Vessel.hasMany(Report, { foreignKey: 'vesselId', as: 'reports' });
Report.belongsTo(Vessel, { foreignKey: 'vesselId', as: 'vessel' });

// User - Report (Created By)
User.hasMany(Report, { foreignKey: 'createdBy', as: 'createdReports' });
Report.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Report (Approved By)
User.hasMany(Report, { foreignKey: 'approvedBy', as: 'approvedReports' });
Report.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

module.exports = {
  User,
  Vessel,
  Report
};

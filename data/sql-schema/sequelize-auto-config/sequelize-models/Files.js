/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('files', {
		fileId: {
			type: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
			field: 'FileId'
		},
		userId: {
			type: DataTypes.UUIDV4,
			allowNull: false,
			references: {
				model: 'Users',
				key: 'UserId'
			},
			field: 'UserId'
		},
		fileContainer: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'FileContainer'
		},
		fileDirectory: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'FileDirectory'
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'Filename'
		},
		dateCreated: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: '(getdate())',
			field: 'DateCreated'
		}
	}, {
		tableName: 'Files'
	});
};

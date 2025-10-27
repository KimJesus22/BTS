const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  real_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  biography_es: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  biography_en: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  birth_place: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  debut_date: {
    type: DataTypes.DATE,
    defaultValue: new Date('2013-06-13')
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  weverse: {
    type: DataTypes.STRING,
    allowNull: true
  },
  achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'members',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['role'] },
    { fields: ['followers'] }
  ]
});

// Virtual para edad
Member.prototype.getAge = function() {
  return Math.floor((new Date() - this.birth_date) / (365.25 * 24 * 60 * 60 * 1000));
};

// Método para actualizar estadísticas
Member.prototype.updateStats = function(newStats) {
  if (newStats.followers !== undefined) this.followers = newStats.followers;
  if (newStats.likes !== undefined) this.likes = newStats.likes;
  if (newStats.views !== undefined) this.views = newStats.views;
  return this.save();
};

// Método estático para buscar por nombre
Member.findByName = function(name) {
  return this.findOne({
    where: {
      name: {
        [sequelize.Op.iLike]: name
      }
    }
  });
};

module.exports = Member;
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  real_name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  biography: {
    es: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  birth_date: {
    type: Date,
    required: true
  },
  birth_place: {
    type: String,
    required: true,
    trim: true
  },
  debut_date: {
    type: Date,
    default: new Date('2013-06-13')
  },
  social_media: {
    instagram: String,
    twitter: String,
    weverse: String
  },
  achievements: [{
    title: String,
    year: Number,
    description: String
  }],
  stats: {
    followers: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
memberSchema.index({ name: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ 'stats.followers': -1 });

// Virtual para edad
memberSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.birth_date) / (365.25 * 24 * 60 * 60 * 1000));
});

// Método estático para buscar por nombre
memberSchema.statics.findByName = function(name) {
  return this.findOne({ name: new RegExp(name, 'i') });
};

// Método de instancia para actualizar estadísticas
memberSchema.methods.updateStats = function(newStats) {
  Object.assign(this.stats, newStats);
  return this.save();
};

module.exports = mongoose.model('Member', memberSchema);
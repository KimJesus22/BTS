import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const AdminGamificationDashboard = () => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const palette = getCurrentPalette();

  useEffect(() => {
    // Simular carga de datos de analytics
    const fetchAnalytics = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Datos simulados de gamificación
      setAnalyticsData({
        totalUsers: 1250,
        activeUsers: 890,
        totalPoints: 456780,
        achievementsUnlocked: 3420,
        challengesCompleted: 1250,
        avgEngagement: 78.5,
        retentionRate: 85.2,
        topAchievements: [
          { name: 'Primer Perfil', count: 1250, percentage: 100 },
          { name: 'Explorador de Perfiles', count: 890, percentage: 71.2 },
          { name: 'Maestro de Biografías', count: 650, percentage: 52.0 },
          { name: 'Jugador de Equipo', count: 420, percentage: 33.6 },
          { name: 'Completar Departamento', count: 280, percentage: 22.4 }
        ],
        userEngagement: {
          daily: [65, 72, 68, 75, 82, 78, 85],
          weekly: [78, 82, 79, 85, 88, 85, 90],
          monthly: [75, 78, 82, 79, 85, 88, 85]
        },
        challengeCompletion: {
          weekly: 68.5,
          monthly: 72.3,
          quarterly: 65.8
        },
        departmentStats: [
          { name: 'Ventas', users: 180, avgPoints: 1250, completionRate: 78.5 },
          { name: 'Marketing', users: 150, avgPoints: 1180, completionRate: 82.1 },
          { name: 'Desarrollo', users: 200, avgPoints: 1350, completionRate: 75.3 },
          { name: 'RRHH', users: 120, avgPoints: 1100, completionRate: 88.7 },
          { name: 'Finanzas', users: 95, avgPoints: 1080, completionRate: 79.2 }
        ]
      });

      setLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  const MetricCard = ({ title, value, change, icon, color }) => (
    <motion.div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: palette.text }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs período anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: color + '20' }}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </motion.div>
  );

  const ChartPlaceholder = ({ title, height = '200px' }) => (
    <div
      className="rounded-lg border-2 border-dashed p-4 text-center"
      style={{
        height,
        borderColor: palette.borderLight,
        backgroundColor: palette.surface
      }}
    >
      <div className="text-lg mb-2" style={{ color: palette.textSecondary }}>
        📊
      </div>
      <p style={{ color: palette.textMuted }}>{title}</p>
      <p className="text-sm" style={{ color: palette.textMuted }}>
        Gráfico interactivo aquí
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: palette.primary }}></div>
        <p style={{ color: palette.textSecondary }}>Cargando métricas de gamificación...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: palette.text }}>
          {t('admin.gamification.title')}
        </h1>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 rounded border"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            color: palette.text
          }}
        >
          <option value="week">{t('admin.timeRange.week')}</option>
          <option value="month">{t('admin.timeRange.month')}</option>
          <option value="quarter">{t('admin.timeRange.quarter')}</option>
          <option value="year">{t('admin.timeRange.year')}</option>
        </select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('admin.metrics.totalUsers')}
          value={analyticsData.totalUsers}
          change={12.5}
          icon="👥"
          color={palette.primary}
        />
        <MetricCard
          title={t('admin.metrics.activeUsers')}
          value={analyticsData.activeUsers}
          change={8.3}
          icon="🎯"
          color={palette.success}
        />
        <MetricCard
          title={t('admin.metrics.totalPoints')}
          value={analyticsData.totalPoints}
          change={15.7}
          icon="⭐"
          color={palette.accent}
        />
        <MetricCard
          title={t('admin.metrics.avgEngagement')}
          value={`${analyticsData.avgEngagement}%`}
          change={5.2}
          icon="📈"
          color={palette.secondary}
        />
      </div>

      {/* Gráficos de engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title={t('admin.charts.userEngagement')} />
        <ChartPlaceholder title={t('admin.charts.challengeCompletion')} />
      </div>

      {/* Logros más populares */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: palette.text }}>
          {t('admin.achievements.popular')}
        </h2>
        <div className="space-y-3">
          {analyticsData.topAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: palette.surfaceElevated }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="font-medium" style={{ color: palette.text }}>
                    {achievement.name}
                  </p>
                  <p className="text-sm" style={{ color: palette.textSecondary }}>
                    {achievement.count} {t('admin.achievements.unlocks')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: palette.primary }}>
                  {achievement.percentage}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estadísticas por departamento */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: palette.text }}>
          {t('admin.departments.stats')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${palette.border}` }}>
                <th className="text-left p-2" style={{ color: palette.textSecondary }}>
                  {t('admin.departments.name')}
                </th>
                <th className="text-center p-2" style={{ color: palette.textSecondary }}>
                  {t('admin.departments.users')}
                </th>
                <th className="text-center p-2" style={{ color: palette.textSecondary }}>
                  {t('admin.departments.avgPoints')}
                </th>
                <th className="text-center p-2" style={{ color: palette.textSecondary }}>
                  {t('admin.departments.completionRate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.departmentStats.map((dept, index) => (
                <motion.tr
                  key={dept.name}
                  style={{ borderBottom: `1px solid ${palette.borderLight}` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="p-3 font-medium" style={{ color: palette.text }}>
                    {dept.name}
                  </td>
                  <td className="p-3 text-center" style={{ color: palette.text }}>
                    {dept.users}
                  </td>
                  <td className="p-3 text-center font-bold" style={{ color: palette.primary }}>
                    {dept.avgPoints}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${dept.completionRate}%`,
                            backgroundColor: palette.success
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: palette.text }}>
                        {dept.completionRate}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones basadas en datos */}
      <div className="p-6 rounded-lg border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: palette.text }}>
          {t('admin.recommendations.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded border-l-4" style={{ backgroundColor: palette.surfaceElevated, borderLeftColor: palette.primary }}>
            <h3 className="font-semibold mb-2" style={{ color: palette.text }}>
              {t('admin.recommendations.newChallenge')}
            </h3>
            <p className="text-sm" style={{ color: palette.textSecondary }}>
              {t('admin.recommendations.newChallengeDesc')}
            </p>
          </div>
          <div className="p-4 rounded border-l-4" style={{ backgroundColor: palette.surfaceElevated, borderLeftColor: palette.success }}>
            <h3 className="font-semibold mb-2" style={{ color: palette.text }}>
              {t('admin.recommendations.incentives')}
            </h3>
            <p className="text-sm" style={{ color: palette.textSecondary }}>
              {t('admin.recommendations.incentivesDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGamificationDashboard;
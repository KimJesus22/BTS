import React, { memo, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';
import Input from './Input';

// Formulario optimizado con memoización
const FormularioRegistro = memo(({
  onSubmit,
  loading = false,
  error = null,
  initialData = {}
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const palette = getCurrentPalette();

  // Estado del formulario memoizado
  const [formData, setFormData] = useState({
    username: initialData.username || '',
    email: initialData.email || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || ''
  });

  // Estado de errores memoizado
  const [errors, setErrors] = useState({});

  // Memoizar validaciones del formulario
  const validationRules = useMemo(() => ({
    username: (value) => {
      if (!value || value.length < 3) {
        return t('validation.usernameMinLength', 'El nombre de usuario debe tener al menos 3 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return t('validation.usernameAlphanumeric', 'El nombre de usuario solo puede contener letras, números y guiones bajos');
      }
      return null;
    },
    email: (value) => {
      if (!value) {
        return t('validation.emailRequired', 'El email es requerido');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t('validation.emailInvalid', 'El email no es válido');
      }
      return null;
    },
    password: (value) => {
      if (!value || value.length < 6) {
        return t('validation.passwordMinLength', 'La contraseña debe tener al menos 6 caracteres');
      }
      return null;
    },
    confirmPassword: (value) => {
      if (value !== formData.password) {
        return t('validation.passwordMismatch', 'Las contraseñas no coinciden');
      }
      return null;
    }
  }), [formData.password, t]);

  // Memoizar si el formulario es válido
  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => value.trim() !== '') &&
           Object.values(errors).every(error => !error);
  }, [formData, errors]);

  // Callback memoizado para manejar cambios
  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validar campo en tiempo real
    const error = validationRules[field]?.(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [validationRules]);

  // Callback memoizado para envío del formulario
  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    // Validar todos los campos antes de enviar
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && isFormValid) {
      // Preparar datos para envío (excluir confirmPassword)
      const { confirmPassword, ...submitData } = formData;
      onSubmit?.(submitData);
    }
  }, [formData, validationRules, isFormValid, onSubmit]);

  // Memoizar estilos del formulario
  const formStyle = useMemo(() => ({
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: palette.surface,
    borderRadius: '8px',
    boxShadow: `0 2px 10px ${palette.shadow}20`
  }), [palette]);

  // Memoizar animaciones del formulario
  const formVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.1 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }), []);

  return (
    <motion.form
      style={formStyle}
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      noValidate
    >
      <motion.h2
        variants={itemVariants}
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: palette.text
        }}
      >
        {t('auth.register', 'Registrarse')}
      </motion.h2>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.username', 'Nombre de usuario')}
          type="text"
          value={formData.username}
          onChange={handleInputChange('username')}
          error={errors.username}
          required
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.email', 'Email')}
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.firstName', 'Nombre')}
          type="text"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.lastName', 'Apellido')}
          type="text"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.password', 'Contraseña')}
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
          disabled={loading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label={t('auth.confirmPassword', 'Confirmar contraseña')}
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={errors.confirmPassword}
          required
          disabled={loading}
        />
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          style={{
            color: palette.error,
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}
        >
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!isFormValid || loading}
        >
          {loading ? t('auth.registering', 'Registrando...') : t('auth.register', 'Registrarse')}
        </Button>
      </motion.div>
    </motion.form>
  );
});

FormularioRegistro.displayName = 'FormularioRegistro';

export default FormularioRegistro;
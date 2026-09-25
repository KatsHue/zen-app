const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

const registerValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('El nombre debe tener entre 2 y 60 caracteres.'),
  body('email').trim().isEmail().withMessage('Correo electrónico no válido.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir al menos un número.'),
  handleValidation,
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('Correo electrónico no válido.').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  handleValidation,
];

const { ACTIVITY_LEVELS, RENAL_STAGES, DIALYSIS_MODALITIES, GOAL_KEYS } = require('../models/Profile');

const profileValidators = [
  body('sex').optional().isIn(['male', 'female']).withMessage('Sexo no válido.'),
  body('age').optional().isInt({ min: 10, max: 119 }).withMessage('La edad debe estar entre 10 y 119 años.'),
  body('heightCm')
    .optional()
    .isFloat({ min: 100, max: 259 })
    .withMessage('La estatura debe estar entre 100 y 259 cm.'),
  body('activityLevel')
    .optional()
    .isIn(ACTIVITY_LEVELS)
    .withMessage('Nivel de actividad no válido.'),
  body('renalEnabled').optional().isBoolean().withMessage('Valor no válido.'),
  body('renalStageId').optional().isIn(RENAL_STAGES).withMessage('Estadio renal no válido.'),
  body('dialysisModality')
    .optional()
    .isIn(DIALYSIS_MODALITIES)
    .withMessage('Modalidad de diálisis no válida.'),
  body('activeGoalKey').optional().isIn(GOAL_KEYS).withMessage('Meta no válida.'),
  body('proteinGPerKg')
    .optional()
    .isFloat({ min: 1.0, max: 3.0 })
    .withMessage('La proteína objetivo debe estar entre 1.0 y 3.0 g/kg.'),
  handleValidation,
];

const weightValidators = [
  body('weightKg')
    .isFloat({ min: 20, max: 400 })
    .withMessage('El peso debe estar entre 20 y 400 kg.'),
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha debe tener formato YYYY-MM-DD.'),
  handleValidation,
];

const dailyLogValidators = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha debe tener formato YYYY-MM-DD.'),
  body('kcalConsumed')
    .optional()
    .isFloat({ min: 0, max: 20000 })
    .withMessage('Las kcal deben estar entre 0 y 20,000.'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Las notas no pueden superar 2000 caracteres.'),
  handleValidation,
];

const measurementValidators = [
  body('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('El mes debe tener formato YYYY-MM.'),
  body('chestCm').optional().isFloat({ min: 0, max: 300 }).withMessage('Medida de pecho no válida.'),
  body('waistCm').optional().isFloat({ min: 0, max: 300 }).withMessage('Medida de cintura no válida.'),
  body('hipCm').optional().isFloat({ min: 0, max: 300 }).withMessage('Medida de cadera no válida.'),
  body('abdomenCm').optional().isFloat({ min: 0, max: 300 }).withMessage('Medida de abdomen no válida.'),
  handleValidation,
];

module.exports = {
  registerValidators,
  loginValidators,
  profileValidators,
  weightValidators,
  dailyLogValidators,
  measurementValidators,
};
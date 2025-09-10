import Joi from 'joi';

// User validation schemas
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  college: Joi.string().min(2).max(100).required().messages({
    'string.min': 'College name must be at least 2 characters long',
    'string.max': 'College name must not exceed 100 characters',
    'any.required': 'College name is required'
  }),
  studentId: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Student ID must be at least 3 characters long',
    'string.max': 'Student ID must not exceed 20 characters',
    'any.required': 'Student ID is required'
  }),
  branch: Joi.string().valid(
    'Computer Engineering',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Automobile Engineering'
  ).required().messages({
    'any.only': 'Please select a valid branch',
    'any.required': 'Branch is required'
  }),
  semester: Joi.string().valid('1', '2', '3', '4', '5', '6').optional(),
  userType: Joi.string().valid('student', 'admin').default('student')
});

export const userLoginSchema = Joi.object({
  emailOrStudentId: Joi.string().required().messages({
    'any.required': 'Email or Student ID is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Notice validation schemas
export const noticeCreateSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  content: Joi.string().min(10).max(5000).required().messages({
    'string.min': 'Content must be at least 10 characters long',
    'string.max': 'Content must not exceed 5000 characters',
    'any.required': 'Content is required'
  }),
  type: Joi.string().valid('general', 'important', 'urgent', 'announcement', 'maintenance').default('general'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  targetAudience: Joi.string().valid('all', 'students', 'admins', 'specific_branch').default('all'),
  targetBranch: Joi.string().when('targetAudience', {
    is: 'specific_branch',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  isPinned: Joi.boolean().default(false),
  expiresAt: Joi.date().greater('now').optional(),
  attachments: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()).default([])
});

// Material validation schemas
export const materialCreateSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  type: Joi.string().valid('pdf', 'video', 'document', 'image', 'audio').required().messages({
    'any.only': 'Type must be one of: pdf, video, document, image, audio',
    'any.required': 'Type is required'
  }),
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid URL',
    'any.required': 'URL is required'
  }),
  description: Joi.string().max(1000).optional(),
  subjectId: Joi.string().required().messages({
    'any.required': 'Subject ID is required'
  }),
  subjectName: Joi.string().required().messages({
    'any.required': 'Subject name is required'
  }),
  branch: Joi.string().required().messages({
    'any.required': 'Branch is required'
  }),
  semester: Joi.string().required().messages({
    'any.required': 'Semester is required'
  }),
  subjectCode: Joi.string().required().messages({
    'any.required': 'Subject code is required'
  }),
  tags: Joi.array().items(Joi.string()).default([])
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }
    
    req.body = value;
    next();
  };
};

// Query parameter validation
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Query validation failed',
        details: errorMessages
      });
    }
    
    req.query = value;
    next();
  };
};

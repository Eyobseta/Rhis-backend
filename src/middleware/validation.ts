import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    next();
  };
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const checkinSchema = Joi.object({
  mood: Joi.number().integer().min(1).max(5).required(),
  conflictLevel: Joi.number().integer().min(1).max(5).required(),
  communicationQuality: Joi.number().integer().min(1).max(5).required(),
});

export const relationshipSchema = Joi.object({
  partnerEmail: Joi.string().email().optional(),
});
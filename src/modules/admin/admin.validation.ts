import Joi from "joi";
import { ApplicationStatus } from "../../common";

export const approveApplicationValidation = Joi.object({
    notes: Joi.string().optional().max(500),
    id: Joi.string().required()
});

export const rejectApplicationValidation    = Joi.object({
    reason: Joi.string().required().max(500).messages({
        'string.empty': 'Rejection reason is required',
        'any.required': 'Rejection reason is required'
    }),
    id: Joi.string().required()
});

export const getApplicationsValidation =Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().valid(...Object.values(ApplicationStatus)).optional(),
        search: Joi.string().optional().allow("").max(100), 
});

import Joi from "joi";
import { ApplicationStatus } from "../../common";

export const approveApplicationValidation = {
    body: Joi.object({
        notes: Joi.string().optional().max(500)
    })
};

export const rejectApplicationValidation = {
    body: Joi.object({
        reason: Joi.string().required().max(500).messages({
            'string.empty': 'Rejection reason is required',
            'any.required': 'Rejection reason is required'
        })
    })
};

export const getApplicationsValidation = {
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().valid(...Object.values(ApplicationStatus)).optional()
    })
};

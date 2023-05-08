import Joi from 'joi'

export default {
    validateRegisterClientSchema(body){
        const schema = Joi.object().keys({
            clientName: Joi.string().optional(),
            clientAbbrevation: Joi.string().optional(),
            clientCountry: Joi.string().optional(),
            clientEmail: Joi.string().email(),
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
      },
      
      validateRegisterClientAdminSchema(body){
        const schema = Joi.object().keys({
            company: Joi.string().optional(),
            name: Joi.string().optional(),
            password: Joi.string().optional(),
            email: Joi.string().email(),
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
      },
    validateEditProfileSchema(body){
        const schema = Joi.object().keys({
            name: Joi.string().optional(),
            phoneNumber: Joi.string().optional()
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
      },

      validateSetupParametersSchema(body){
        const schema = Joi.object().keys({
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            country: Joi.string().optional(),
            abbreviation: Joi.string().optional(),
            second_email: Joi.string().optional(),
            localCurrency: Joi.string().optional(),
            FXAllowed: Joi.array().optional()
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
      },

      validateRegisterSupervisorTelerSchema(body){
        const schema = Joi.object().keys({
            company: Joi.string().optional(),
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().optional(),
            employeeType: Joi.string().optional(),
        });
        const { error, value } = Joi.validate(body, schema);
        if (error && error.details) {
            return { error };
        }
        return { value };
      },
}
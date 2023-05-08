import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service.js";
import staffService from "../../services/staff.service.js";
import UserModel from "../../models/user.model";
import staffModel from "../../models/staff.model.js";
import companyModel from "../../models/company.model.js";
import { getJWTToken, randomValueHex, getEncryptedPassword, decode, decodeToken } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import { sendEmail } from "../../libraries/mail";
import mongoose from "mongoose";
export default {
    // async test(req, res){
    //     res.status(200).json({"conneted":'true'})
    // },
    
    async test(req, res){
        const email =  "admin@admin.com"
        const hash = await getEncryptedPassword("admin");
        const user = new staffModel({email:email, password:hash})
        await user.save()
        return res.status(200).json({"admin":'created'});
    },
    // async verifyToken(req, res) {
    //     const token = req.body.token
    //     try {
    //         if(token){
    //         const decoded = await decode(token);
    //         const user = await UserModel.findById(decoded)
    //         return res.json({user:user})    
    //         } else {
    //             res.json({message : 'Invalid Token'})
    //         }
    //     } catch (error) {

    //     }
    // },
    async loaduser(req, res) {
        try {
            // const user = req.user;
            const token = req.headers.x_auth;
            if (token) {
                const decoded = await decode(token);
                const user = await staffModel.findById(decoded)
                let company 
                if(user.company){
                    company = await companyModel.findById(user.company)
                }
                let userResponce;
                userResponce = {
                    userData: user,
                    company:company,
                    token: token
                }
                let result = makeApiResponce('LoggedIn Successfully', 1, OK, userResponce);
                return res.json(result);
            } else {
                res.status(400).json({ message: 'Invalid Token' })
            }
            // if (user) {
            //     return res.status(200).json({ success: true, data: user, token });
            // }

            // return res.status(400).json({ success: false, message: "Invalid Attempt" });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    },
    async login(req, res) {
        try {
            // VALIDATE THE REQUEST
            const { error, value } = userService.validateLoginSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // FETCH THE USER
            const userQuery = { email: req.body.email_address };

            let user = await staffModel.findOne(userQuery);
            if (!user) {
                let result = makeApiResponce('Please check your email and password', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const matched = await bcryptjs.compare(req.body.password, user.password)
            if (!matched) {
                let result = makeApiResponce('Please check your email and password', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            if (user.accountType==="teller") {
                let result = makeApiResponce('Tellers are not allowd to access admin panel', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            if (user.statusBit == false) {
                let result = makeApiResponce('User not verified.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            } else {
                const token = await getJWTToken({ id: user._id });
                let userResponce;
                userResponce = {
                    userData: user,
                    token: token
                }
                let result = makeApiResponce('LoggedIn Successfully', 1, OK, userResponce);
                return res.json(result);
            }


        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async getLoginUserProfile(req, res) {
        return res.json(req.currentUser);
    },



    async passwordReset(req, res) {
        try {

            const findUser = await UserModel.findOne({ email: req.body.email });
            if (!findUser) {
                let result = makeApiResponce('Please double-check the email you entered is correct.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            const hash = await getEncryptedPassword(req.body.newPassword);
            findUser.password = hash;
            await findUser.save();

            let userResponce = {};

            let result = makeApiResponce('Password Update Successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async forgotPassword(req, res) {
        try {
            const randomForgotOTP = await randomValueHex("6");
            const findUser = await UserModel.findOne({ email: req.body.email });
            if (!findUser) {
                let result = makeApiResponce('Please double-check the email you entered is correct.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // UPDATE THE USER
            const hash = await getEncryptedPassword(randomForgotOTP);
            findUser.password = hash;
            findUser.otp = randomForgotOTP;
            await findUser.save();

            const passwordLink = `
        <p>Here is your new password <span style="font-weight:bold">${randomForgotOTP}</span> login with and then change your password</a></p>
        <p><a href="http://localhost:3000/confirm-password">Enter the reset password code here</a></p>`;
            // node mailer
            const mailResponce = await sendEmail({
                html: passwordLink,
                subject: "Forgot Password",
                email: req.body.email,
            });

            let userResponce = {};
            let result = makeApiResponce('Password Update Successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async verifyOTP(req, res) {
        try {
            // FETCH THE USER
            const userQuery = { email: req.body.email, otp: req.body.otp };
            let user = await UserModel.findOne(userQuery);
            if (!user) {
                let result = makeApiResponce('Invalid otp', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            user.statusBit = true;
            await user.save();

            const token = await getJWTToken({ id: user._id });
            let userResponce;
            userResponce = {
                userData: user,
                token: token
            }
            let result = makeApiResponce('Verify OTP Successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    /////////// user crud /////////////////

    async listing(req, res) {
        try {
            await UserModel.find({ "userType": "admin" }, function (err, users) {
                if (err) {
                    let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
                    return res.status(INTERNAL_SERVER_ERROR).json(result)
                } else {
                    let userRecord = [];
                    users.forEach((doc) => {
                        userRecord.push({
                            id: doc._id,
                            firstName: doc.firstName,
                            lastName: doc.lastName,
                            email: doc.email,
                            userType: doc.userType,
                            statusBit: doc.statusBit
                        });
                    });
                    let couponResponce = userRecord;
                    let result = makeApiResponce('User Listing', 1, OK, couponResponce);
                    return res.json(result);
                }
            })

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async add(req, res) {
        try {

            const randomOtp = await randomValueHex("6");

            // VALIDATE THE REQUEST
            // const {error, value} = userService.validateAddUserSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }

            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new UserModel();
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.userType = req.body.userType;
            user.statusBit = req.body.statusBit;
            user.otp = randomOtp;
            const hash = await getEncryptedPassword('12345678');
            user.password = hash;
            await user.save();
            let userResponce = {
                id: user._id
            }

            let result = makeApiResponce('User Created Successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },


    async update(req, res) {
        try {

            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('Coupon not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            // const {error, value} = userService.validateUpdateUserSchema(req.body);
            // if(error && error.details){
            //     let result = makeApiResponce(error.message, 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }

            findUser.firstName = req.body.firstName;
            findUser.lastName = req.body.lastName;
            findUser.userType = req.body.userType;
            findUser.statusBit = req.body.statusBit;
            await findUser.save();

            let userResponce = {
                id: findUser._id
            }

            let result = makeApiResponce('User updated successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async editProfile(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            const { error, value } = staffService.validateEditProfileSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            findUser.name = req.body.name;
            findUser.phoneNumber = req.body.phoneNumber;
            await findUser.save();

            let userResponce = {
                userData: findUser
            }

            let result = makeApiResponce('User updated successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR,err);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async detail(req, res) {
        try {

            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            let userResponce = {
                id: findUser._id,
                firstName: findUser.firstName,
                lastName: findUser.lastName,
                email: findUser.email,
                userType: findUser.userType,
                statusBit: findUser.statusBit
            }
            let result = makeApiResponce('User Detail', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async delete(req, res) {
        try {
            const findUser = await UserModel.findById(req.params.id);
            if (!findUser) {
                let result = makeApiResponce('User not found.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const deleteUser = await UserModel.deleteOne({ _id: req.params.id });
            if (!deleteUser) {

                let result = makeApiResponce('Network Error please try again.', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            let userResponce = {};
            let result = makeApiResponce('User Delete Successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    // SUPER ADMIN ACTIONS 
    async registerClient(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            // VALIDATE THE REQUEST
            const { error, value } = staffService.validateRegisterClientSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new companyModel()
            user.companyName = req.body.clientName;
            user.abbrevation = req.body.clientAbbrevation;
            user.country = req.body.clientCountry;
            user.email = req.body.clientEmail;
            await user.save();

            let userResponce = {}

            let result = makeApiResponce('New client created cuccessfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async registerClientAdmin(req, res) {
                   
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const company = await companyModel.findOne({companyName: req.body.company})
            if(!company){
                let result = makeApiResponce(`No company with name "${req.body.company}" exists` , 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const pre_admin = await staffModel.findOne({accountType:'admin',company:company});
            if (pre_admin) {
                let result = makeApiResponce('only 1 admin per client in allowed', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const pre_email = await staffModel.findOne({email:req.body.email});
            if (pre_email) {
                let result = makeApiResponce(`Email already registered for role of ${pre_email.accountType}`, 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // VALIDATE THE REQUEST
            const { error, value } = staffService.validateRegisterClientAdminSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const user = new staffModel()
            user.name = req.body.name;
            user.email = req.body.email;
            user.country = req.body.country;
            user.accountType = 'admin';
            const hash = await getEncryptedPassword(req.body.password);
            user.company = company
            user.password = hash;
            await user.save();

            let userResponce = {}

            let result = makeApiResponce('New client created cuccessfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async setupClientParameters(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // Extra security
            // if(findUser.accountType!="superadmin" || findUser.accountType!="admin"){
            //     let result = makeApiResponce('Only admins can perform this task', 1, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }
            // VALIDATE THE REQUEST
            const { error, value } = staffService.validateSetupParametersSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const company = await companyModel.findOne({companyName: req.body.name})
            if(!company){
                let result = makeApiResponce(`No company with name "${req.body.name}" exists` , 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            company.name = req.body.name;
            company.email = req.body.email;
            company.country = req.body.country;
            company.abbrevation = req.body.abbreviation;
            company.localCurrency = req.body.localCurrency;
            company.FXAllowed = req.body.FXAllowed;
            company.second_email = req.body.second_email;
            await company.save();
            let userResponce = {}

            let result = makeApiResponce('Clent parameters updated successfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async registerSupervisorTeler(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const company = await companyModel.findOne({companyName: req.body.company})
            if(!company){
                let result = makeApiResponce(`No company with name "${req.body.company}" exists` , 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const pre_email = await staffModel.findOne({email:req.body.email});
            if (pre_email) {
                let result = makeApiResponce(`Email already registered for role of ${pre_email.accountType}`, 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // VALIDATE THE REQUEST
            const { error, value } = staffService.validateRegisterSupervisorTelerSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new staffModel()
            user.company = company;
            user.name = req.body.name;
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            user.accountType = req.body.employeeType;
            user.email = req.body.email;
            await user.save();

            let userResponce = {}

            let result = makeApiResponce('New client created cuccessfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async registerCustomer(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const company = await companyModel.findOne({companyName: req.body.client})
            if(!company){
                let result = makeApiResponce(`No company with name "${req.body.client}" exists` , 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const pre_email = await UserModel.findOne({email:req.body.email});
            if (pre_email) {
                let result = makeApiResponce(`Email already registered for role of ${pre_email.accountType}`, 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // VALIDATE THE REQUEST
            const { error, value } = userService.validateRegisterCustomerSchema(req.body);
            if (error && error.details) {
                let result = makeApiResponce(error.details[0].message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new UserModel()
            user.clientID = company;
            user.firstName = req.body.first_name;
            user.lastName = req.body.last_name;
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            user.accountType = req.body.employeeType;
            user.email = req.body.email;
            await user.save();

            let userResponce = {}

            let result = makeApiResponce('New client created cuccessfully', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

    async loadCustomerList(req, res) {
        try {
            const decoded_id = await decode(req.headers.x_auth);
            const findUser = await staffModel.findById(decoded_id);
            if (!findUser) {
                let result = makeApiResponce('Unauthorized Attempt', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const company = await companyModel.findById(findUser.company)
            // if(!company){
            //     let result = makeApiResponce(`No company with name "${req.body.client}" exists` , 0, BAD_REQUEST)
            //     return res.status(BAD_REQUEST).json(result);
            // }
            
            let customerList = await UserModel.find({clientID:findUser.company})
            console.log(customerList)
            let userResponce = {
                customerList,
            }
            let result = makeApiResponce('Customer list loaded', 1, OK, userResponce);
            return res.json(result);

        } catch (err) {
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },

};


import express from 'express';
import userController from '../../controllers/admin/user.controller';
import passport from 'passport'; 

export const userRouter =  express.Router();
userRouter.get('/test', userController.test);
userRouter.get('/loaduser', userController.loaduser);
userRouter.post('/login', userController.login);
userRouter.post('/forgotPassword', userController.forgotPassword);
userRouter.post('/passwordReset',  userController.passwordReset);
userRouter.post('/verifyOTP', userController.verifyOTP);
userRouter.post('/editProfile', userController.editProfile);
userRouter.post('/registerClient', userController.registerClient);
userRouter.post('/registerClientAdmin', userController.registerClientAdmin);
userRouter.post('/setupClientParameters', userController.setupClientParameters);
userRouter.post('/registerSupervisorTeler', userController.registerSupervisorTeler);
userRouter.post('/registerCustomer', userController.registerCustomer);
userRouter.get('/loadCustomerList', userController.loadCustomerList);
// userRouter.post('/verifyToken', userController.verifyToken);
userRouter.get('/getLoginUserProfile', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.getLoginUserProfile);

userRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.listing);
// userRouter.get('/test', userController.test);
userRouter.post('/add', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.add);
userRouter.post('/update/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.update);
userRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.detail);
userRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), userController.delete);



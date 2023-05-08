import express from 'express';
import appController from '../../controllers/mobile/app.controller';
import passport from 'passport'; 
import upload from "../../libraries/multer";

export const appRouter =  express.Router();


appRouter.get('/testLink', appController.testLink);


appRouter.post('/login', appController.login);
appRouter.post('/signup', appController.signup);
appRouter.post('/checkEmail', appController.checkEmail);
appRouter.post('/verifyOTP', appController.verifyOTP);
appRouter.post('/resendVerifyOTP', appController.resendVerifyOTP);
appRouter.post('/forgotPassword', appController.forgotPassword);
appRouter.post('/contactUs', appController.contactUs);
appRouter.post('/logout', appController.logout);
appRouter.get('/getLoginUserProfile', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.getLoginUserProfile);
appRouter.put('/changePassword/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.changePassword);
appRouter.put('/updatePhoneNumber/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updatePhoneNumber);
appRouter.put('/updateAccountDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateAccountDetail);
appRouter.put('/updateLocation/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateLocation);
appRouter.delete('/deleteAccount/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.deleteAccount);
appRouter.get('/getAllServices', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.getAllServices);
appRouter.get('/createCart', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.createCart);

appRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listing);
appRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.add);
appRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.update);
appRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.detail);
appRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.delete);

//Customer Side Apis
appRouter.post('/placeOrder', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.placeOrder);
appRouter.get('/dashboard', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.dashboard);
appRouter.get('/listOfProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfProjects);
appRouter.get('/orderDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.orderDetail);

//Contractor Side Apis
appRouter.get('/listOfCompanies', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfCompanies);
appRouter.get('/contractorDashboard', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.contractorDashboard);
appRouter.get('/listOfActiveContractorProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfActiveContractorProjects);
appRouter.get('/listOfAvailableContractorProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfAvailableContractorProjects);
appRouter.get('/listOfCompletedContractorProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfCompletedContractorProjects);
appRouter.post('/changeProjectRequestStatus/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.changeProjectRequestStatus);
appRouter.post('/changeProjectOrderStatus/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.changeProjectOrderStatus);
appRouter.get('/listOfStaff/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfStaff);
appRouter.get('/listOfScheduledContractorProjects', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfScheduledContractorProjects);




appRouter.get('/listOfNotifications', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfNotifications);
appRouter.post('/addNotification', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.addNotification);
appRouter.get('/notificationDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.notificationDetail);

appRouter.post('/assignProjectToUser', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.assignProjectToUser);
appRouter.get('/listOfContractors', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfContractors);

appRouter.post('/addCustomerStripeCard', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.addCustomerStripeCard);
appRouter.get('/listOfCustomerStripeCards', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listOfCustomerStripeCards);
appRouter.get('/customerStripeCardDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.customerStripeCardDetail);

appRouter.get('/getUserAllStatusBit/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.getUserAllStatusBit);
appRouter.put('/updateUserStatusBit/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateUserStatusBit);

appRouter.put('/updateStaff/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.updateStaff);
appRouter.get('/listofTransactions', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), appController.listofTransactions);

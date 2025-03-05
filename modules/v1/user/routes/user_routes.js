const express = require('express')
const middleware = require("../../../../middleware/headerValidator")

const router = express.Router()

const userController = require('../controller/user_controllers');

router.post('/register', userController.register);

router.post('/otp-verification', userController.otp_verification);

router.post('/resend-user-otp', userController.resend_user_otp);

router.post('/login', userController.login);

router.post('/update-password', userController.updatePassword);

router.post('/logout', userController.logout);

router.post('/userlist', userController.userList);

router.post('/userlist_by_id', userController.userListById);

router.post('/edituser', userController.editUser);

router.post('/deleteuser', userController.deleteuser);

router.post('/active_inactive', userController.active_inactive); 

router.post('/add_update_points', userController.addUpdatePoints); 

router.post('/get_points_details', userController.getPointsDetails); 

router.post('/add_scratch_card', userController.addUpdatescratchCard); 

router.post('/get_contacts_details', userController.getContactDetails); 

router.post('/get_contacts_details', userController.getContactDetails); 
router.post('/privacy_policy', userController.PrivacyPolicy); 


router.post("/encryption_demo", async (req, res) => {
    middleware.encryptiondemo(req.body, res);
});

router.post("/decryption_demo", async (req, res) => {
    middleware.decryptiondemo(req.body, res);
});


module.exports = router;


// NZfXak3FsK7gL7Y75rpA

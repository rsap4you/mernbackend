var express = require('express');
var path = require('path');
var GLOBALS = require('../../../config/constant');
var api_model = require('../api_document/api_model');
const { log } = require('winston');

app = express()
app.set('view engine', 'ejs');

exports.index = function (req, res) {
   var message = '';
   res.render(path.join(__dirname + '/views/index.ejs'), { message: message, GLOBALS: GLOBALS });
};

exports.login = function (req, res) {
   console.log("Loaded");
   if (req.method == "POST") {
      console.log("Submitted");
      // console.log(req.body.password)
      // console.log(process.env.API_PASSWORD);
      if (req.body.password == process.env.API_PASSWORD) {
         // use below 3 line for set the session
         req.session.user = process.env.API_PASSWORD;
         // console.log(req.session.user);
         req.session.save();
         res.redirect('/v1/api_document/dashboard');
      } else {
         res.render(path.join(__dirname + '/views/index.ejs'), { message: 'Please enter valid password.', GLOBALS: GLOBALS });
      }
   } else {
      res.render(path.join(__dirname + '/views/index.ejs'), { message: '', GLOBALS: GLOBALS });
   }
};

exports.dashboard = function (req, res, next) {
   console.log(req.session.user);
   if (req.session.user == null) {
      res.redirect("/v1/api_document/login");
      return;
   } else {
      res.render(path.join(__dirname + '/views/api_doc.ejs'), { GLOBALS: GLOBALS });
   }
};

// exports.user_list = async (req, res) => {
//    if (req.session.user == null) {
//       res.redirect("/v1/api_document/login");
//       return;
//    }
//    await api_model.apiuserList(async (response) => {
//       console.log("a", response);
//       res.render(path.join(__dirname + '/views/user_list.ejs'), { data: response, GLOBALS: GLOBALS })
//    });
// };

exports.user_list = async function (req, res) {
   if (req.session.user == null) {
      res.redirect("/v1/api_document/login");
      return;
   }

   try {
      const response = await api_model.apiuserList();
      res.render(path.join(__dirname + '/views/user_list.ejs'), { data: response, GLOBALS: GLOBALS });
   } catch (error) {
      console.error(error);
      // Handle the error appropriately
      res.status(500).send("An error occurred");
   }
};

exports.code = function (req, res) {
   if (req.session.user == null) {
      res.redirect("/v1/api_document/login");
      return;
   }
   res.render(path.join(__dirname + '/views/reference_code.ejs'), { GLOBALS: GLOBALS });
};

exports.enc_dec = function (req, res) {
   if (req.session.user == null) {
      res.redirect("/v1/api_document/login");
      return;
   }
   res.render(path.join(__dirname + '/views/enc_dec.php'), {})
};

exports.logout = function (req, res) {
   req.session.destroy(function (err) {
      res.redirect("/v1/api_document/login");
   });
};
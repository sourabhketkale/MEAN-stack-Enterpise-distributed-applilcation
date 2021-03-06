/**
 * Routes file for Login
 */
var mq_client = require('../rpc/client');
var ejs = require("ejs");

exports.login = function (req, res) {
    if (req.session.user) {
        console.log('validated user');
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("profileHome", {
            user: req.session.user
        });
    } else {
        res.render('login', {
            title: 'Log in to Medair',
            alertClass: '',
            msg: ''
        });
    }
};

//Check login - called when '/checklogin' POST call given from AngularJS module in login.ejs
exports.checkLogin = function (req, res) {
    res.render("refugeeHome");

    if (req.session.user) {
        console.log('validated user');
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.send({"statusCode": 200});
    } else {
        var json_responses;
        var uid = req.param("uid");
        var pass = req.param("password");
        console.log("uid is: "+uid);
        if (!module.parent)
            console.log('authenticating %s:%s', uid, pass);
        var msg_payload = {"uid": uid, "password": pass};
        mq_client.make_request('checkLogin_queue', msg_payload, function (err, results) {
            console.log(results);
            if (err) {
                throw err;
            }
            else {
                if (results.statusCode === 200) {
                    console.log("valid Login");
                    req.session.user = results.uid;
                    res.send(results);
                }
                else {
                    console.log("Invalid Login");
                    res.send(results);
                }
            }
        });
    }
};

//Redirects to the homepage
exports.redirectToHomepage = function (req, res) {
    //Checks before redirecting whether the session is valid
    if (req.session.user) {
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        var uType = req.session.userType;
        if (uType === 'Organization') {
            res.render("OrgHome", {
                user: req.session.user,
                userType: req.session.userType
            });
        } else if (uType === 'Refugee') {
            res.render("RefugeeHome", {
                user: req.session.user,
                userType: req.session.userType
            });
        }
    } else {
        res.redirect('/');
    }
};

//Logout the user - invalidate the session
exports.logout = function (req, res) {
    req.session.destroy();
    res.redirect('/');
};

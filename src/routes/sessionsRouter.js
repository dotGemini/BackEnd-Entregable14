import { Router } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import { validarToken } from '../utils.js';
import { MailController } from '../controller/mailController.js';
import userModel from '../dao/models/usersModel.js';
import { changeUserRole } from '../controller/userController.js';

const router = Router();
const mailController = new MailController();

router.use(cookieParser());

router.post('/register', passport.authenticate('register', { failureRedirect: '/register' }), async (req, res) => {
    res.send({ status: "success", message: "User registered" });
})

router.post('/login', passport.authenticate('login', { failureRedirect: '/login'}), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: "error", error: "Incorrect credentials" });

    req.session.user = {
        name: `${req.user.first_name} ${req.user.last_name}`,
        email: req.user.email,
        age: req.user.age,
        admin: req.user.admin
    }
    
    const token = jwt.sign(req.user, "CoderKeyFeliz", {expiresIn: "24h"});
    res.cookie('coderCookieToken', token, { httpOnly: true }).send({ status: "success", payload: req.session.user, message: "asd" });
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ status: "error", error: "Couldn't logout" });
        res.redirect('/login');
    })
})

router.get('/github', passport.authenticate('github', {scope: ['user:email']}), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), async (req, res) =>{
    req.session.user = req.user;
    res.redirect('/')
});

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.send(req.user);
});

router.get('/send-recover-mail/:email', async (req, res) => {
    await mailController.sendEmail(req.params.email);
    res.send({ message: 'Mail sent!' })
});

router.get('/restore-pass/:token', validarToken, (req, res) => {
    res.render('restore-pass', { token: req.params.token });
})

router.post('/pass-change/:token', validarToken, async (req, res) => {
    if(!req.params.token){
        res.redirect('/send-recover-mail/:email')
    }
    const { password } = req.body;
    const { email } = req;
    const hashedPassword = createHash(password);
    await userModel.updateOne({email: email}, {$set: {password: hashedPassword}});
    res.send({ message: 'Password changed!' });
});

router.post("/premium/:uid", changeUserRole);

export default router;
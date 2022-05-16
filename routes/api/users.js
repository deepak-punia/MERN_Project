const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const { JsonWebTokenError } = require("jsonwebtoken");

//@route     POST api/users
//@desc      Register User
//@access    Public
router.post(
	"/",
	[
		check("name", "Name is required").not().isEmpty(),
		check("password", "Not a valid Password").isLength({ min: 6 }),
		check("email", "Please include valid emmail").isEmail(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "User already exists." }] });
			}
			const avatar = gravatar.url(email, {
				s: "200",
				r: "pg",
				d: "mn",
			});
			user = new User({
				name,
				email,
				avatar,
				password,
			});
			const salt = await bcrypt.genSalt(8);
			user.password = await bcrypt.hash(password, salt);

			let userData = await user.save();

			const payload = {
				user: {
					id: userData.id,
				},
			};
			jwt.sign(
				payload,
				config.get("jwtSecret"),
				{
					expiresIn: 360000,
				},
				(err, token) => {
					if (err) {
						throw err;
					} else {
						res.json({ token });
					}
				}
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server Error.");
		}
	}
);

module.exports = router;

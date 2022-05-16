const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

//@route     GET api/auth
//@desc      Test route
//@access    Public
router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

//@route     POST api/Auth
//@desc      Auth User and Get Token
//@access    Public
router.post(
	"/",
	[
		check("password", "Password is Required").exists(),
		check("email", "Please include valid emmail").isEmail(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ errors: [{ msg: "User not found." }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: "Invalid Password" }] });
			}

			const payload = {
				user: {
					id: user.id,
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

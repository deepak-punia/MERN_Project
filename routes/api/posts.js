const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Posts = require("../../models/Posts");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const request = require("request");

//@route     POST api/posts
//@desc      Create a Post
//@access    Private
router.post(
	"/",
	[check("text", "text is required").not().isEmpty()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ erros: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id).select("-passowrd");
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});
			const post = await newPost.save();
			res.json(post);
		} catch (err) {
			console.log(err.message);
			res.status(500).json("SERVER Error");
		}
	}
);

//@route     GET api/posts
//@desc      Get all Posts
//@access    Private
router.get("/", auth, async (req, res) => {
	try {
		const posts = await Posts.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.log(err.message);
		res.status(500).json("SERVER Error");
	}
});

//@route     GET api/posts/:id
//@desc      Get post by id
//@access    Private
router.get("/:id", auth, async (req, res) => {
	try {
		const post = await Posts.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: "Post Not Found." });
		}
		res.json(post);
	} catch (err) {
		console.log(err.message);
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post Not Found." });
		}
		res.status(500).json("SERVER Error");
	}
});

//@route     DELETE api/posts/:id
//@desc      Delete a post by id
//@access    Private
router.delete("/:id", auth, async (req, res) => {
	try {
		const post = await Posts.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post Not Found." });
		}

		//Check user is owner of post
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User is not authorized" });
		}
		await post.remove();
		res.json({ msg: "post is removed" });
	} catch (err) {
		console.log(err.message);
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post Not Found." });
		}
		res.status(500).json("SERVER Error");
	}
});

//@route     PUT api/posts/like/:id
//@desc      Like a post
//@access    Private
router.put("/like/:id", auth, async (req, res) => {
	try {
		const post = await Posts.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: "Post Not Found." });
		}
		// Check if post is already liked by user
		if (
			post.like.filter((like) => like.user.toString() === req.user.id).length >
			0
		) {
			return res.status(400).json({ msg: "Post already liked." });
		}
		post.like.unshift({ user: req.user.id });
		await post.save();

		res.json(post.like);
	} catch (err) {
		1;
		console.log(err.message);
		res.status(500).json("SERVER Error");
	}
});

//@route     PUT api/posts/unlike/:id
//@desc      UnLike a post
//@access    Private
router.put("/unlike/:id", auth, async (req, res) => {
	try {
		const post = await Posts.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: "Post Not Found." });
		}
		// Check if post is already liked by user
		if (
			post.like.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({ msg: "Post is not liked." });
		}
		const removedIndex = post.like
			.map((like) => like.user.toString())
			.indexOf(req.user.id);
		post.like.splice(removedIndex, 1);
		await post.save();

		res.json(post.like);
	} catch (err) {
		1;
		console.log(err.message);
		res.status(500).json("SERVER Error");
	}
});

//@route     POST api/posts/comment/:id
//@desc      Command on a post
//@access    Private
router.post(
	"/comment/:id",
	[check("text", "text is required").not().isEmpty()],
	auth,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ erros: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id).select("-passowrd");
			const post = await Post.findById(req.params.id);
			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};
			post.comments.unshift(newComment);
			await post.save();
			res.json(post.comments);
		} catch (err) {
			console.log(err.message);
			res.status(500).json("SERVER Error");
		}
	}
);

//@route     Delete api/posts/comment/:id/:commend_id
//@desc      Delete Command on a post
//@access    Private
router.delete(
	"/comment/:id/:comment_id",

	auth,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id);
			const comment = post.comments.find(
				(comment) => comment.id === req.params.comment_id
			);

			if (!comment) {
				return res.status(404).json({ msg: "Comment Not Found" });
			}

			if (comment.user.toString() !== req.user.id) {
				return res.status(404).json({ msg: "User not authorized" });
			}
			const removedIndex = post.comments
				.map((comment) => comment.user.toString())
				.indexOf(req.user.id);
			post.comment.splice(removedIndex, 1);
			await post.save();

			res.json(post.comments);
		} catch (err) {
			console.log(err.message);
			res.status(500).json("SERVER Error");
		}
	}
);

module.exports = router;

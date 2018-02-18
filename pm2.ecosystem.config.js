module.exports = {
	apps: [
		{
			name: "checker",
			cwd: "/home/ubuntu/fb_group_scraper/",
			script: "/home/ubuntu/fb_group_scraper/server/index.js",
			watch: false,
			env: {
				"NODE_ENV": "production"
			}
		}, {
			name: "scraper",
			cwd: "/home/ubuntu/fb_group_scraper/",
			script: "/home/ubuntu/fb_group_scraper/scraper.js",
			interpreter: "/usr/lib/node_modules/casperjs/bin/casperjs.js",
			watch: false,
			env: {
				"NODE_ENV": "production"
			}
		}
	]
}

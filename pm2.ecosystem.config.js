module.exports = {
	apps: [
		{
			name: "scraper_checker",
			cwd: "/home/ubuntu/fb_group_scraper/",
			script: "/home/ubuntu/fb_group_scraper/server/index.js",
			watch: true,
			env: {
				"NODE_ENV": "production"
			}
		}, {
			name: "fb_group_scraper",
			cwd: "/home/ubuntu/fb_group_scraper/",
			script: "/home/ubuntu/fb_group_scraper/scraper.js",
			interpreter: "/usr/lib/node_modules/casperjs/bin/casperjs.js",
			watch: true,
			env: {
				"NODE_ENV": "production"
			}
		}
	]
}

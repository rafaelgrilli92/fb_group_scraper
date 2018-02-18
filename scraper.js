const fs = require('fs');
const credentials = require('./config.facebook.json');
const casper = require("casper").create({
	verbose: true,
	waitTimeout: 30000,
	viewportSize: {
		width: 1024,
		height: 768
	}
});


/** 
 * VARIABLES
*/
const groupUrl = 'https://www.facebook.com/groups/brasileirosemsydney';
var isSignedIn = false;

/** 
 ***********************************************************************
 * ERROR HANDLERS
 ***********************************************************************
*/
function init() {
	signIn.call(this);
	initScraper.call(this);
	setTimeout(this.run.bind(this, init), 60000)
}
casper.on('error', handleErrors);
casper.on('remote.error', handleErrors);
casper.on('timeout', handleErrors);
casper.on('resource.timeout', handleErrors);
casper.on('step.timeout', handleErrors);
casper.on('waitFor.timeout', handleErrors);
casper.on('exit', handleErrors);

function handleErrors(error) {
	const filePathName = 'logs/error_' + Date.now();
	casper.capture(filePathName + '.png');
	fs.write(filePathName + '.txt', error || 'No error', 'w');
}
/**************************************************************************/



/** 
 ***********************************************************************
 * INITIAL METHOD
 ***********************************************************************
*/
function init() {
	if (!isSignedIn)
		signIn.call(this);

	initScraper.call(this);
	setTimeout(this.run.bind(this, init), 60000)
}
/**************************************************************************/



/** 
 ***********************************************************************
 * SIGN METHOD
 ***********************************************************************
*/
function signIn() {
	this.start(groupUrl, function() {
			this.echo('Starting Login process...')
	});

	this.waitForSelector('#login_form', function() {
		this.echo('Trying to login...');
		this.fill('#login_form', {
				'email' : credentials.email,
				'pass' : credentials.password
		}, true);
	});

	this.waitWhileSelector('#login_form', function() {
		this.echo('Login form has gone')
	});

	this.waitForSelector("#bluebarRoot", function() {
		isSignedIn = true;
		this.echo('Login succeeded');
	});
}
/**************************************************************************/

/** 
 ***********************************************************************
 * SCRAPER METHOD
 ***********************************************************************
*/
function initScraper() {
	this.thenOpen(groupUrl, function() {
		this.echo('Opening the group page...')
	});

	this.waitForSelector('.userContentWrapper', function() {
		this.echo('Group page completely loaded');
	});

	this.then(function() {
		this.echo('Starting scraping...')
		const postsList = this.evaluate(getData)

		// Write posts on file
		postsList.forEach(function(post) {
			fs.write('posts.json', JSON.stringify(postsList), 'w');
		})
	});
}
/**************************************************************************/

/** 
 ***********************************************************************
 * GET DATA METHOD
 ***********************************************************************
*/
function getData() {
	const posts = document.querySelectorAll('.userContentWrapper > div:first-child')
	return [].map.call(posts, function(post) {
		const contentElement = post.querySelector('.userContent[id]');
		if (!contentElement)
			return null;

		// Content text
		const exposedText = post.querySelector('.text_exposed_root')
		if (exposedText)
			exposedText.className = 'text_exposed';

		const content = contentElement.innerText;

		// Post Link
		const permalinkElement = post.querySelector('a[href*="permalink"]:first-child');
		const postLink = permalinkElement.getAttribute('href');
		const postId = postLink.split('/').slice(-2)[0];

		// Date Time
		const postedOn = permalinkElement.querySelector('*[data-utime]').getAttribute('data-utime');

		// Author
		const authorElement = post.querySelector('a.profileLink') || post.querySelector('span.fwn.fcg > span.fwb > a');
		const authorName = authorElement ? authorElement.textContent : '?';
		const authorProfileLink = authorElement ? authorElement.getAttribute('href') : '?';

		const post = { 
			id: postId,
			postedOn: postedOn,
			content: content,
			author: {
				name: authorName,
				_profile: authorProfileLink
			},
			_link: postLink
		};

		return post;
	});
}
/**************************************************************************/


casper.start().then(function() {
	this.echo("Starting App");
});

casper.run(init);
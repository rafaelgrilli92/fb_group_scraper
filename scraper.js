const casper = require('casper').create();
const fs = require('fs');
const credentials = require('./config.fb.json');

casper.on('remote.message', function(msg) {
	this.echo(msg);
})

casper.on('remote.error', function(error) {
	this.echo(error, 'error');
});

//'https://www.facebook.com/groups/reactjsbrasil?query=*'

const url = 'https://www.facebook.com/groups/brasileirosemsydney?sorting_setting=RECENT_ACTIVITY'

casper.start('https://www.facebook.com');

casper.waitForSelector('#login_form', function() {
	casper.echo('Trying to login...');
	this.fill('#login_form', {
			'email' : credentials.email,
			'pass' : credentials.password
	}, true);
});

casper.waitWhileSelector('#login_form');

casper.thenOpen(url);

casper.waitForSelector('.userContentWrapper', function(){
		this.echo('Page is completely loaded');
});

casper.then(function() {
	const postsList = this.evaluate(function() {
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
			//console.log(post.innerHTML)
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
	})

	postsList.forEach(function(post) {
		fs.write('posts.json', JSON.stringify(postsList), 'w');
	})
});

casper.run();
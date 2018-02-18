const fs = require('fs');
const cmd = require('node-cmd');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.aws.json');
const lambda = new AWS.Lambda();

function checkPostsToSave() {
	console.log('Scrapper script compelted');

	console.log('Checking if posts file was created.');
	const postsPath = './posts.json';
	if (fs.existsSync(postsPath)) {
		console.log('Reading posts file...')
		const posts = fs.readFileSync(postsPath, { encoding: 'utf8' });
		console.log('Posts file reading completed.')

		console.log('Deleting posts file...');
		fs.unlinkSync(postsPath);
		console.log('Posts file deletion completed.')

		console.log('Invoking lambda to save the posts...');
		const params = {
			FunctionName: 'posts',
			InvocationType: 'RequestResponse',
			LogType: 'Tail',
			Payload: JSON.stringify({
				httpMethod: 'POST',
				body: posts
			})
		};

		lambda.invoke(params, function(error, res) {
			if (error)
				console.error(error);
			else if (res && res.StatusCode !== 200) {
				const response = JSON.parse(res);
				console.error(response.Payload || response);
			}			
			else 
				console.log('Posts successfully saved.');
			
			console.log('Waiting for 60 seconds...');
		});
	}
	else {
		console.log('Posts file not found.')
		console.log('Waiting for 60 seconds...');
	}
}

function runScraper() {
	console.log('Scrapper is running...');
	cmd.get('casperjs scraper.js');
}

setInterval(checkPostsToSave, 60000);
runScraper();
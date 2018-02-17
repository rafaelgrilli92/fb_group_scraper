const fs = require('fs');
const cmd = require('node-cmd');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.aws.json');
const lambda = new AWS.Lambda();

function savePosts() {
	console.log('Saving posts...')
	const postsPath = './posts.json';
	if (!fs.existsSync(postsPath)) {
		console.log('Posts file not found')
		return runScraper();
	}

	const posts = fs.readFileSync(postsPath, { encoding: 'utf8' });
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
		res = JSON.parse(res.Payload);
		if (error || res.statusCode !== 200)
			console.error('Error: ' + error || res.body);
		else 
			console.log('Successfully Saved');
		
		console.log('Waiting...');
		setTimeout(runScraper, 30000);
	});
}

function runScraper() {
	console.log('Running scrapper...');
	cmd.get('casperjs scraper.js', savePosts);
}

runScraper();
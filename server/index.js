const fs = require('fs');
const cmd = require('node-cmd');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.aws.json');
const lambda = new AWS.Lambda();

function checkPostsToSave() {
	console.log('Checking if there is a posts file...');
	const postsPath = './posts.json';
	if (!fs.existsSync(postsPath)) {
		console.log('Posts file not found.')
		console.log('Waiting for 15 seconds to check again...');
		return setTimeout(checkPostsToSave, 15000);
	}

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
		
		console.log('Waiting for 40 seconds...');
		return setTimeout(checkPostsToSave, 40000);
	});
}

checkPostsToSave();
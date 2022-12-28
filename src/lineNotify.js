const {lineChannelAccessToken, lineNotifyAPI} = require('./config.js');
const request = require('request');

const send_line_notify = (message) => {
	request(
		{
			method:'post',
			url: lineNotifyAPI, 
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': `Bearer ${lineChannelAccessToken}`,
				},
			body: 'message='+message,
		},(error, response, body)=>{
		console.log(error);
		console.log(response);
		//console.log(body);
	});
};

module.exports = {
	send_line_notify
};
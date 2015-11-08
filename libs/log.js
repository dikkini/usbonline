var winston = require('winston');

function getLogger(module) {
	var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

	return new winston.Logger({
		transports : [
			new winston.transports.Console({
				colorize:   true,
				level:      'debug',
				label:      path,
				timestamp:	true
			}),
			new winston.transports.File({
				filename: 	'usbonline.log',
				json: 		false,
				maxsize: 	50000000,
				level:      'debug',
				timestamp:	true
			})
		]
	});
}

module.exports = getLogger;
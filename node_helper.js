var NodeHelper = require('node_helper');
var isOnline = require('is-online');
var goodreads = require('goodreads');
var fs = require('fs');

module.exports = NodeHelper.create({
	
	socketNotificationReceived: function(notification, payload) {
		if (notification == 'SEND_CONFIG') {
			this.config = payload;
			this.gr = new goodreads.client({'key': payload.key, 'secret': payload.secret});
			this.sendSocketNotification('CONFIG_RECV');
		}
		if (notification == 'GET_BOOKS'){
			var fileName = this.path + "/goodreads.json";
			var self = this;
			isOnline(function(err, online) {
				if (online) {
					var shelfOptions = {
						'userID':self.config.userID,
						'shelf':self.config.shelf,
						'page':self.config.page,
						'per_page':self.config.per_page
					};
				
					self.gr.getSingleShelf(shelfOptions, function(json) {
						fs.writeFile(fileName, JSON.stringify(json), function(err){
						});
						self.sendSocketNotification('BOOKS', json);	
					});		
					return;
				}

				fs.readFile(fileName, function(err, data){
					if (err) {
						self.sendSocketNotification('NO_BOOKS');
						return;
					}

					self.sendSocketNotification('BOOKS', JSON.parse(data));
				})
			});
		}
	}
});

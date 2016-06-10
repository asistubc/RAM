Module.register('goodreads',{

	// Default module config.
	defaults: {
		key: '',
		secret: '',
		userID: '',
		shelf: '',
		page: 1,
		per_page: 200,
		updateInterval: 60 * 1000
	},

	start: function() {
		 this.loaded = false;
		 this.unloadable = false;
		 this.books = null;
		 this.currentBook = 0;

		 this.sendSocketNotification('SEND_CONFIG', this.config);
	},
	// Override dom generator.
	getDom: function() {
		var div = document.createElement('div');
		div.className = 'dimmed medium';

		if (this.unloadable) {
			div.innerHTML = 'Error: Must initialize with internet access';
			return div;
		}

		if (!this.loaded) {
			var img = document.createElement('img');
			img.src = this.data.path + '/RAM.gif';
			return img;
		}

		var book = this.books[this.currentBook];

		var title = document.createElement('div');
		title.innerHTML = book.title;
		title.className = 'bright large';

		var author = document.createElement('div');
		author.innerHTML = 'by ' + book.authors[0].author[0].name;
		author.className = 'dimmed medium';

		div.appendChild(title);
		div.appendChild(author);
		this.currentBook = (this.currentBook + 1) % this.books.length;
		return div;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification == 'CONFIG_RECV') {
			this.sendSocketNotification('GET_BOOKS');	
		}
		if (notification == 'BOOKS') {
			this.processBooks(payload);
		}
		if (notification == 'NO_BOOKS') {
			this.unloadable = true;
			this.updateDom(3000);
		}
	},

	processBooks: function(json) {
		this.books = json.GoodreadsResponse.books[0].book;

		this.loaded = true;
		this.updateDom(3000);

		var self = this;
		setInterval(function() {
			self.updateDom(3000);	 
		}, this.config.updateInterval);
	}
});

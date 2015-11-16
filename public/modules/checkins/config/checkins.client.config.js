'use strict';

// Configuring the Articles module
angular.module('checkins').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Checkins', 'checkins', 'dropdown', '/checkins(/create)?');
		Menus.addSubMenuItem('topbar', 'checkins', 'List Checkins', 'checkins');
		Menus.addSubMenuItem('topbar', 'checkins', 'New Checkin', 'checkins/create');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('admins').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Admins', 'admins', 'dropdown', '/admins(/create)?');
		Menus.addSubMenuItem('topbar', 'admins', 'List Admins', 'admins');
		Menus.addSubMenuItem('topbar', 'admins', 'New Admin', 'admins/create');
	}
]);
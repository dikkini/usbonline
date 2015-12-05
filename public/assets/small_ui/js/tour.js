function runTour() {
	var steps = [{
		content: '<p>Step 1. Connect flash drive to your computer and press this button to detect it</p>',
		element: '#refreshFlashDrives',
		placement: 'right center'
	}, {
		content: '<p>Step 2. Connected flash drive will appear in this list. Now, click on the element of list to choose flash drive.</p>',
		element: '#flash-drives-list',
		placement: 'right center'
	}, {
		content: '<p>Step 3. (optional) If you want to format your flash drive, you can check this checkbox</p>',
		element: '#formatFlashDriveCb',
		placement: 'right center'
	}, {
		content: '<p>It is a progress of capacity for chosen flash drive. Percents it is a filled space capacity.</p>',
		element: '#flashDriveProgressBar',
		placement: 'right center'
	}, {
		content: '<p>Step 4. (optional) Now you can hide menu until we will be ready to burn loaders to your flash drive.</p>',
		element: '#menu-toggle',
		placement: 'right center'
	}, {
		content: '<p>Step 5. Click to this button to add new loader</p>',
		element: '#addLoaderBtn',
		placement: 'right center'
	}, {
		content: '<p>Step 6. Choose loader type which you want to burn onto your chosen flash drive</p>',
		element: '#lts',
		placement: 'right center'
	}, {
		content: '<p>Step 7. You have to choose ISO file, if you don\'t have it, you can go to loader type website by pressing this button and download it  </p>',
		element: '#lal',
		placement: 'right center'
	}, {
		content: '<p>Step 8. Choose ISO file from your filesystem </p>',
		element: '#lac',
		placement: 'right center'
	}, {
		content: '<p>Here will be progress of burning loaders to flash drive</p>',
		element: '#burnprogr',
		placement: 'right center'
	}, {
		content: '<p>This is showing status of burning</p>',
		element: '#burnprogr',
		placement: 'right center'
	}, {
		content: '<p>If you want to delete loader or cancel burning press this button</p>',
		element: '#lar',
		placement: 'right center'
	}, {
		content: '<p>Step 9. Now, you can burn this loader to flash drive by pressing this button or add more loaders. Good luck!</p>',
		element: '#burnBtn',
		placement: 'right center'
	}];

	var tour = new Tour({
		steps: steps,
		orphan: true
	});

	// Initialize the tour
	tour.init();

	if (tour.ended()) {
		// decide what to do
		tour.restart();
	} else {
		tour.start();
	}
}


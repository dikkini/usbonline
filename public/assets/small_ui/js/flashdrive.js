function getFlashDriveFilledSpace(selectedFlashDrive) {
	var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
	var flashDriveFreeSpace = parseInt(selectedFlashDrive.FreeSpace);
	return flashDriveFullSize - flashDriveFreeSpace;
}

function isoSizeToPerc(selectedFlashDrive, size) {
	var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
	return Math.round((parseInt(size) * 100) / flashDriveFullSize);
}

function calcFlashDriveSize(widthInPerc) {
	var $progressBar = $("#flashDriveSizeBarGreen");

	if (widthInPerc > 80 && widthInPerc < 98) {
		$.growlUI('Error', 'Your flash drive has more than 80% capacity filled. Be carefully.');
	} else if (widthInPerc > 98) {
		$.growlUI('Error', 'Your flash drive has more than 98% capacity filled. We can\'t burn this loader.');
		return false;
	}
	$progressBar.width(widthInPerc+"%");
	$progressBar.text(widthInPerc+"%");
	return true;
}
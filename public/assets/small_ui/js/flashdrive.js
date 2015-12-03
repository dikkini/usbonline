function getFlashDriveFilledSpace(selectedFlashDrive) {
	var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
	var flashDriveFreeSpace = parseInt(selectedFlashDrive.FreeSpace);
	return flashDriveFullSize - flashDriveFreeSpace;
}

function isoSizeToPerc(selectedFlashDrive, size) {
	var flashDriveFullSize = parseInt(selectedFlashDrive.FullSize);
	return Math.round((parseInt(size) * 100) / flashDriveFullSize);
}
// Fetches the right JSON stache of images from the local storage and converts to object
// Sends for appending to the gallery.
function FGFetchImagesFromLocalStorage(key, appendImagesToGallery) {
  appendImagesToGallery(JSON.parse(localStorage.getItem(key)));
}

// Converts the object to a JSON string and sets the key value pair in the local storage.
function FGSetToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Constructs the image URL from different information stored in the array.
// The elements are an img inside of an a so that the pictures can be navigated with a keyboard.
function FGCreateImageElement({ farm, server, id, secret, title }) {
  var img = document.createElement('img');
  img.src = `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;
  img.alt = title;
  img.className = 'flickrGalleryImage';

  var a = document.createElement('a');
  a.className = 'flickrGalleryImageContainer';
  a.appendChild(img);
  a.href = img.src;
  a.target = 'blank';
  return a;
}

// Creates a message showing that the images are being loaded.
function FGMessageLoading(appendMessageToParent) {
  const loading = createMessageElement('Content is loading...', 'flickrGalleryMessages');
  appendMessageToParent(loading, 'flickrGalleryMessageLoading');
}

// Creates a message if there has been a problem during the fetching of the API.
function FGMessageProblemFetchingAPI(messageError, appendMessageToParent) {
  const APIProblem = createMessageElement(
    'The images can not be retrieved at this moment, try again later. Message error: ' +
      messageError +
      '.',
    'flickrGalleryMessages'
  );
  appendMessageToParent(APIProblem, 'flickrGalleryMessageNoImages');
}

// Creates a message if the user tries to get more pictures than there exist of a searchWord.
function FGMessageNoMoreImages(pageNumber, appendMessageToParent) {
  let message = 'There are no more images in this category';
  if (pageNumber === 1) {
    message = 'There are no images for this category';
  }
  const noMoreResults = createMessageElement(message, 'flickrGalleryMessages');
  appendMessageToParent(noMoreResults, 'flickrGalleryMessageNoImages');
}

// Creates a p element with the given message and classname
function createMessageElement(message, className) {
  const node = document.createElement('p');
  node.className = className;
  node.innerText = message;
  return node;
}

(() => {
  //IIFE so as to not pollute the global scope

  document.getElementById('flickrGallery').innerHTML = `

  <form class="flickrGallerySearchBar" onsubmit="return false;">
      <input type="text" autocomplete="off" id="searchWord" name="searchWord" placeholder="Search for images">
      <input  type="submit" value="Search" class="searchGallerySubmit" id="searchGallerySubmit" />
  </form>

  <div id="flickrGalleryImagesWrapper">
      <div id="flickrGalleryImages"></div>
  </div>

`;

  // ------------------- VARIABLES AND CONSTANTS

  let searchWord = 'bonsai'; // The first searchword, what the user will see when they first arrive at the page.
  let flickrImageApiUrl; // The url to be constructed every time the user wants to search for something new.
  const NBR_OF_SEARCHES = '100'; // How many images will be fetched per batch.
  const API_KEY = '62f8270fe091f989d341dadb7dc0711e'; // My private API KEY.
  let loadingTime; // To show the loading text if the api takes to long to fetch.
  let ApiIsFetchingRightNow; // So that no more pages can be fetched if there is a fetching going on at the same time.

  let pageNbr = 1; // Holds the pagenumber so that we can update the boolean pageNbrTooBig and fetch the right page with teh KEYurl.
  let pageNbrTooBig = false; // If we are fetching a page number larger than the total amount of pages for this category, do not continue fetching pages for this category.
  let nbrOfLoadingMessages = 0; // Number of Loading messages that have been printed out so that they can be taken away if they are redundant.
  let nbrOfOtherMessages = 0; // Number of Other messages that have been printed out so that they can be taken away if they are redundant.

  const wrapper = document.getElementById('flickrGalleryImagesWrapper');
  const content = document.getElementById('flickrGalleryImages');

  // ------------------- EVENT LISTENERS

  // Calls the function whenever the page loads
  window.addEventListener('load', getFlickrGalleryImages);

  // Scroll event listener. Calls upon the function that controlls the endless scroller.
  wrapper.addEventListener('scroll', () =>
    FGScroller(wrapper, content, ApiIsFetchingRightNow, nextPage)
  );

  // Gets the onclick event everytime a new searchword is submitted
  document.getElementById('searchGallerySubmit').onclick = changeSearchWord;

  // ------------------- FUNCTIONS THAT REMOVE FROM THE HTML

  // Empties the contents of the Gallery in its entirety.
  function resetGalleryContent() {
    content.innerHTML = '';
    pageNbr = 1;
    pageNbrTooBig = false;
    nbrOfLoadingMessages = 0;
    nbrOfOtherMessages = 0;
  }

  // When called upon removes all loading messages and stops if there are any on timeout.
  // Also removes unncessary other messages if they are redundant.
  function removeMessages() {
    stopLoadingTimeMessage();
    if (nbrOfLoadingMessages > 0) {
      nbrOfLoadingMessages--;
      removeChildWithId('flickrGalleryMessageLoading');
    }
    if (nbrOfOtherMessages > 1) {
      nbrOfOtherMessages--;
      removeChildWithId('flickrGalleryMessageNoImages');
    }
  }

  // Removes a childNode with a specific given id
  function removeChildWithId(idName) {
    content.removeChild(document.getElementById(idName));
  }

  // ------------------- FUNCTIONS THAT TALK TO THE ELEMENT CREATORS

  // Checks if we have fetched more pages of content than there is content for this searchword
  function areThereImagesToShow(data) {
    if (data.photos.page > data.photos.pages) {
      FGMessageNoMoreImages(data.photos.page, appendMessageToParent);
      nbrOfOtherMessages++;
      pageNbrTooBig = true;
      return false;
    }
    return true;
  }

  // Calls for problemFetchingApi to be written out and and keeps the counter at the right balance.
  function callUponMessageProblemFetchingAPI(message) {
    FGMessageProblemFetchingAPI(message, appendMessageToParent);
    nbrOfOtherMessages++;
  }

  // Calls for the loading message to be written out and keeps the counter at the right balance.
  function callUponMessageLoading() {
    FGMessageLoading(appendMessageToParent);
    nbrOfLoadingMessages++;
  }

  // ------------------- FUNCTIONS THAT ADD TO THE HTML

  function appendMessageToParent(messageNode, idName) {
    messageNode.id = idName;
    content.appendChild(messageNode);
  }

  // Takes an array and puts out images to the specified HTML div.
  function appendImagesToGallery(array) {
    array.forEach(element => {
      const image = FGCreateImageElement(element);
      content.appendChild(image);
    });
  }

  // ------------------- FUNCTIONS THAT CONTROLL TIMEOUT

  // Sets a timer before the user can see the "loading" message if the APIs take too long to fetch.
  function setLoadingTimeMessage() {
    loadingTime = setTimeout(callUponMessageLoading, 1000);
  }

  // Cancels the loadingTime function from being shown.
  function stopLoadingTimeMessage() {
    clearTimeout(loadingTime);
  }

  // ------------------- FUNCTIONS THAT FETCH THE API OR CACHED IMAGES

  // Resets the page every time a new searchword is entered. If the searchWord is an empty string, nothing happens.
  function changeSearchWord() {
    searchWord = document.getElementById('searchWord').value;
    if (searchWord !== '') {
      resetGalleryContent();
      getFlickrGalleryImages();
    }
  }

  // Increases the page number counter and calls to get gets the next batch of pictures of the same type.
  function nextPage() {
    if (!pageNbrTooBig) {
      pageNbr += 1;
      getFlickrGalleryImages();
    }
  }

  // Tries to fetch the given information from the local storage via the unique API url given as a key.
  // OR tries to fetch the api that changes depending on what the user has entered to search.
  // Staches the array fetched for that given API Url if it did not exist priorly.
  function getFlickrGalleryImages() {
    ApiIsFetchingRightNow = true;
    flickrImageApiUrl =
      'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' +
      API_KEY +
      '&text=' +
      searchWord +
      '&sort=relevance&per_page=' +
      NBR_OF_SEARCHES +
      '&page=' +
      pageNbr +
      '&format=json&nojsoncallback=1';

    // Tries to firs see if this batch of images exist in the local storage
    if (localStorage.getItem(flickrImageApiUrl)) {
      FGFetchImagesFromLocalStorage(flickrImageApiUrl, appendImagesToGallery);
      ApiIsFetchingRightNow = false;
      return;
    }

    // If this batch is not in the local storage, tries to fetch it from the given APIurl
    setLoadingTimeMessage();
    fetch(flickrImageApiUrl)
      .then(response => {
        if (200 > response.status > 299) {
          callUponMessageProblemFetchingAPI(response.status);
        }
        return response.json();
      })

      .then(data => {
        removeMessages();
        if (areThereImagesToShow(data)) {
          const array = data.photos.photo;
          FGSetToLocalStorage(flickrImageApiUrl, array);
          appendImagesToGallery(array);
        }
      })

      .catch(function (error) {
        console.warn('Something went wrong while fetching the API. ', error);
        removeMessages();
        callUponMessageProblemFetchingAPI('Undefined');
      })

      .finally(() => {
        ApiIsFetchingRightNow = false;
      });
  } // function getFlickrGalleryImages
})();

// This is the scroll event function.
// If we are near the bottom of our image gallery, get more pictures.
function FGScroller(wrapper, content, ApiIsFetchingRightNow, nextPage) {
  if (wrapper.scrollTop + wrapper.offsetHeight + 10 > content.offsetHeight) {
    // If there are no other fetchings right now.
    if (!ApiIsFetchingRightNow) {
      nextPage();
    }
  }
}

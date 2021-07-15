/**
 * @SOURCE
 * https://medium.com/@djave_co_23356/a-super-simple-vuex-localstorage-plugin-de7820828b10
 * https://www.mikestreety.co.uk/blog/vue-js-using-localstorage-with-the-vuex-store
 */

let debouncedUpdate = debounce((state) => {
  localStorage.setItem('muralappen', JSON.stringify(state));
}, 200)

/**
 * Checks if localstorage is available.
 *
 * @return boolean
 */
let localStorageAvailable = () => {
  var test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

let setupLocalStorage = (store) => {
  let previous = localStorage.getItem('muralappen');
  if (previous) {
    store.replaceState(JSON.parse(previous));
  }
}

const VuexLocalStorage = (store) => {
  if (!localStorageAvailable) {
    return false
  }

  setupLocalStorage(store)

  store.subscribe((mutation, state) => {
    debouncedUpdate(state);
  })
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @SOURCE https://davidwalsh.name/javascript-debounce-function
 *
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
}

export default VuexLocalStorage

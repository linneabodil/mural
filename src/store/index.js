import Vue from 'vue'
import Vuex from 'vuex'
import VuexLocalStorage from "../plugins/VuexLocalStorage.js"

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [VuexLocalStorage],
  state: {
    filters: {
      grayScale: false,
      flipHorizontal: false,
      showBreadths: false,
      rotate: 0,
      zoom: 0,
    },
    image: {
      lowres: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
      url: 'https://www.borastapeter.com/sites/borastapeter.com/files/storage/product-images/MagicForestMural_Image_Tile_Item_7481.jpg'
    },
    settings: {
      overlaySize: {
        height: 265,
        width: 180
      },
      laminate: false,
    },
    translations: {
      controls_header: 'Dina väggmått',
      app_header: 'Anpassa din tapet',
      input_height_label: 'Höjd (cm)*',
      input_width_label: 'Bredd (cm)*',
      order_button_text: 'Beställ tapet',
      order_button_description: 'Beställ dina tapet i dag, hämta dem hos närmaste återförsäljare inom 1-2 vardagar, oftast i morgon.',
      controls: {
        breadths: {
          showBreadths: 'Visa våder',
          hideBreadths: 'Utan våder'
        }
      },
      supplement: {
        header: 'Tillägg',
        laminate_description: 'Laminera tapeten för extra hållbarhet'
      }
    },
    wallpaper: {
      collection: "Graceful Stories 7291",
      lamination_price: 3000,
      length: 300,
      pattern_height: 265,
      pattern_width: 360,
      price: 29500,
      roll_length: 265,
      roll_width: 45,
      sku: 887,
      title: 'Nocturne Mural',
      width: 75
    },
    cuttings: {
      cutFromX: 0,
      cutToX: 0,
      cutFromY: 0,
      cutToY: 0,
    }
  },
  getters: {
    getOverlaySize: state => state.settings.overlaySize,
    getFilters: state => state.filters,
    getWallpaperData: state => state.wallpaper,
    getImageData: state => state.image,
    getTranslations: state => state.translations,
    getNumBreadths: (state) => {
      let wallpaperData = state.wallpaper
      const numBreadths = wallpaperData.pattern_width / wallpaperData.roll_width
      return Math.ceil(numBreadths)
    }
  },
  mutations: {
    INITIALIZE_STORE(state) {
      // Check if the ID exists
      if(localStorage.getItem('muralappen')) {
        // Replace the state object with the stored item
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('muralappen')))
        );
      }
    },
    LOAD_IMAGE_DATA (state, imageData) {
      if (imageData) {
        state.image.url = imageData.mural.Image

        state.wallpaper.collection = imageData.mural.collection
        state.wallpaper.pattern_height = toCentimeter(imageData.mural.pattern_height)
        state.wallpaper.pattern_width = toCentimeter(imageData.mural.pattern_width)
        state.wallpaper.repeatsize = toCentimeter(imageData.mural.repeatsize)
        state.wallpaper.roll_length = toCentimeter(imageData.mural.roll_length)
        state.wallpaper.roll_width = toCentimeter(imageData.mural.roll_width)
        state.wallpaper.sku = imageData.mural.sku
        state.wallpaper.title = imageData.mural.title
      }
    },
    STORE_SETTINGS_DATA (state, data) {
      state.translations = data.translations
      state.wallpaper.price = data.prices.mural_price
      state.wallpaper.lamination_price = data.prices.lamination_price
    },
    SET_OVERLAY_SIZE (state, value) {
      state.settings.overlaySize[value.type] = value.size
    },
    UPDATE_FILTERS (state, name) {
      let f = state.filters

      switch (name) {
        case 'breadths':
          f.showBreadths = !f.showBreadths
          break;
        case 'flip':
          f.flipHorizontal = !f.flipHorizontal
          break;
        case 'grayScale':
          f.grayScale = !f.grayScale
          break;
        case 'rotate':
          f.rotate += 90
          f.rotate = f.rotate % 360
          break;
        case 'zoomIn':
          f.zoom += 10
          break;
        case 'zoomOut':
          if (f.zoom > 0) f.zoom -= 10
          break;
      }
    },
    STORE_CUTTINGS_DATA (state, data) {
      state.cuttings = data
    },
    STORE_LAMINATION(state, data) {
      state.settings.laminate = data
    },
    SEND_ORDER_TO_CART (state) {
      // Wall width/height
      document.querySelector("#edit-line-item-fields-field-mural-wall-width-und-0-value").value = state.settings.overlaySize.width;
      document.querySelector("#edit-line-item-fields-field-mural-wall-height-und-0-value").value = state.settings.overlaySize.height;
      // Cuttings
      document.querySelector("#edit-line-item-fields-field-mural-cut-from-x-und-0-value").value = state.cuttings.cutFromX;
      document.querySelector("#edit-line-item-fields-field-mural-cut-to-x-und-0-value").value = state.cuttings.cutToX;
      document.querySelector("#edit-line-item-fields-field-mural-cut-from-y-und-0-value").value = state.cuttings.cutFromY;
      document.querySelector("#edit-line-item-fields-field-mural-cut-to-y-und-0-value").value = state.cuttings.cutToY;
      // Laminate boolean
      document.querySelector("#edit-line-item-fields-field-mural-lamination-und-1").checked = state.settings.laminate;
      // Customized boolean
      document.querySelector("#edit-line-item-fields-field-mural-has-customization-und-1").checked = true;
    }
  },
  actions: {
    loadImageData ({ commit }, nid) {
      fetch('/api/mural/' + nid)
      .then(response => response.json())
      .then(
        imageData => commit('LOAD_IMAGE_DATA', imageData.murals[0])
      )
    },
    loadSettingsData ({ commit }, langCode) {
      let endpoint = '/api/murals/settings'

      if (langCode !== 'sv') endpoint = '/' + langCode + endpoint

      fetch(endpoint)
      .then(response => response.json())
      .then(
        settings => commit('STORE_SETTINGS_DATA', settings),
      )
    },
    setOverlaySize ({ commit }, value) {
      commit('SET_OVERLAY_SIZE', value)
    },
    updateFilters ({ commit }, name) {
      commit('UPDATE_FILTERS', name)
    },
    setCuttingsData({ commit }, data) {
      commit('STORE_CUTTINGS_DATA', data)
    },
    setLamination({ commit }, data) {
      commit('STORE_LAMINATION', data)
    },
    sendOrder({ commit }) {
      commit('SEND_ORDER_TO_CART')
    }
  }
});

function toCentimeter(value) {
  // Parse value to get rid of unit
  let num = parseFloat(value)
  return num * 100
}

<template>
  <div class="controls single-product">
    <v-hover disabled >
        <span class="controls__close"
        :class="{'hidden-sm-and-down': !hideOnMobile}"
        @click="closeApp">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M19.688 18L34.65 3.039a1.192 1.192 0 0 0 0-1.687 1.19 1.19 0 0 0-1.689 0l-14.96 14.963L3.041 1.35A1.194 1.194 0 1 0 1.35 3.038l14.963 14.963L1.349 32.963a1.194 1.194 0 1 0 1.692 1.687l14.96-14.963 14.96 14.963a1.19 1.19 0 0 0 1.69 0 1.192 1.192 0 0 0 0-1.687L19.687 18.001z" stroke="#DE8A83" fill="#DE8A83" fill-rule="evenodd"/></svg>
        </span>
    </v-hover>
    <small class="single-product__sub-title hidden-sm-and-down">{{ wallpaper.collection }} {{ wallpaper.sku }}</small>
    <h2 class="single-product__title heading hidden-sm-and-down">{{ wallpaper.title }}</h2>
    <h3 class="controls__sub-title"
    :class="{'hidden-sm-and-down': !hideOnMobile}">
    {{ t.controls_header }}</h3>
    <div class="d-flex controls__mesure">

      <div class="controls__icon-wrapper"
      :class="{'hidden-sm-and-down': !hideOnMobile, 'size-error': minWidthError || maxWidthError}">
        <div class="controls__icon-container">
          <span class="controls__icon-up-down controls__icon-up-down--rotate"></span>
        </div>
        <div class="input-field">
          <v-text-field
            @input="validateWidth()"
            suffix="cm"
            type="number"
            v-model.number="overlayWidth"
            background-color="transparent"
            filled
          />
          <p class="input-field__label input-field__label--width">{{ t.input_width_label }}</p>
        </div>
      </div>

      <div class="controls__icon-wrapper"
      :class="{'hidden-sm-and-down': !hideOnMobile, 'size-error': minHeightError || maxHeightError}">
        <div class="controls__icon-container">
          <span class="controls__icon-up-down"></span>
        </div>
        <div class="input-field">
          <v-text-field
            @input="validateHeight()"
            class="ml-2"
            suffix="cm"
            type="number"
            v-model.number="overlayHeight"
            background-color="transparent"
            filled
          />
          <p class="input-field__label input-field__label--height">{{ t.input_height_label }}</p>
        </div>
      </div>
    </div>

    <div class="controls__error-box"
    v-show="sizeError"
    :class="{'hidden-sm-and-down': !hideOnMobile, 'size-error': sizeError}">
      <p v-show="maxHeightError">
        OBS! Mönstrets maxhöjd är {{wallpaper.pattern_height}}cm <br><br>
        Din vägg är högre än mönstret, men vi hjälper dig att göra en anpassning som passar just din vägg. <br><br>
        Kontakta oss på <a href="mailto:order@borastapeter.com">order@borastapeter.com</a> så återkommer vi med mer detaljer.
      </p>
      <p v-show="minHeightError">
        Din vägg är för låg.
      </p>
      <p v-show="maxWidthError">
        Din vägg är för bred.
      </p>
      <p v-show="minWidthError">
        Din vägg är för smal.
      </p>
    </div>

    <div v-if="laminationAvaliable">
      <h3 class="controls__sub-title mt-12 mb-3"
      :class="{'hidden-sm-and-down': hideOnMobile}">{{ t.supplement.header }}</h3>
      <div class="d-flex flex-row">
        <div class="controls__checkbox"
        :class="{'hidden-sm-and-down': hideOnMobile}">
          <label for="mural-app-laminate" @click="toggleLaminate()" class="controls__label">
            <input :checked="laminate" type="checkbox" name="checkbox" id="mural-app-laminate" value="value">
            {{ t.supplement.laminate_description }}
          </label>
        </div>
      </div>
    </div>

    <div v-show="!sizeError" class="controls__price mt-0 mt-md-4 mb-5"
      :class="{'hidden-sm-and-down': hideOnMobile}">
      <h2 class="controls__price-total">{{ totalPrice|toDecimals }} kr</h2>
      <h4 class="controls__price-sqm"> ( {{ wallpaper.price|toDecimals }} kr/m<sup>2</sup> )</h4>
    </div>

    <v-btn style="height: 5rem"
      block
      depressed
      color="#1D5E3C"
      text-color="white"
      class="white--text order btn js-buy-mural"
      @click="sendOrder()"
      :class="{'hidden-sm-and-down': hideOnMobile, 'size-error': sizeError}"
      :disabled="sizeError"
      >
      {{ t.order_button_text }}
    </v-btn>

    <p class="single-product__buying-info single-product__buying-info--small mt-4"
    :class="{'hidden-sm-and-down': hideOnMobile}">{{ t.order_button_description }}</p>

    <div class="d-flex flex-row justify-space-between" v-if="optionsAvaliable">
      <v-card flat>
        <v-btn small @click="applyFilter('zoomIn')" outlined block>
          <v-icon left>mdi-plus</v-icon> Förstora
        </v-btn>
        <v-btn small @click="applyFilter('rotate')" outlined block>
          <v-icon left>mdi-rotate-right</v-icon> 90°
        </v-btn>
        <v-btn small @click="applyFilter('grayScale')" outlined block>
          <v-icon left>mdi-invert-colors</v-icon> Gråskala
        </v-btn>
      </v-card>
      <v-card flat>
        <v-btn small @click="applyFilter('zoomOut')" outlined block>
          <v-icon left>mdi-minus</v-icon> Förminska
        </v-btn>
        <v-btn small @click="applyFilter('flip')" outlined block>
          <v-icon left>mdi-rotate-right</v-icon> Spegelvänd
        </v-btn>
        <v-btn small @click="applyFilter('breadths')" outlined block>
          <v-icon left>mdi-view-column</v-icon>Visa våder
        </v-btn>
      </v-card>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    hideOnMobile: {
      default: false
    }
  },
  data() {
    return {
      overlayHeight: 0,
      overlayWidth: 0,
      wallpaper: {},
      borders: {},
      laminate: false,
      optionsAvaliable: false,
      laminationAvaliable: false,
      maxHeightError: false,
      minHeightError: false,
      minWidthError: false,
      maxWidthError: false
    }
  },
  computed: {
    img() {
      return this.$store.getters.getImageData
    },
    t() {
      return this.$store.getters.getTranslations
    },
    totalPrice() {
      let wallpaperPrice = parseInt(this.wallpaper.price)

      if (this.laminate) {
        wallpaperPrice += parseInt(this.wallpaper.lamination_price)
      }

      let square = (this.overlayWidth / 100) * (this.overlayHeight / 100)
      let price = square * wallpaperPrice

      return price
    },
    sizeError() {
      let errors = [this.maxHeightError, this.minHeightError, this.maxWidthError, this.minWidthError]
      let hasErrors = false

      if (errors.includes(true)) {
        hasErrors = true
      }
      return hasErrors
    }
  },
  filters: {
    toDecimals(value) {
      return (value / 100).toFixed(2)
    }
  },
  methods: {
    applyFilter(name) {
      this.$store.dispatch('updateFilters', name)
    },
    closeApp() {
      // Remove class from body
      let body = document.getElementsByTagName('body')
      let classList = body[0].className

      classList = classList.replace(' mural-modal--body', '')
      body[0].className = classList

      // Remove class from html
      let html = document.getElementsByTagName('html')
      classList = html[0].className

      classList = classList.replace(' mural-modal--html-no-overflow', '')
      html[0].className = classList

      // Remove class from wrapper div
      let el = document.getElementById('mural-modal-wrapper')
      el.className = 'mural-modal'

      // Add class to borders to add opacity
      let borders = this.borders;
      for (let i = 0; i < borders.length; i++) {
        borders[i].classList.add('mural-start-view')
      }
    },
    validateWidth() {
      // Validate that input-width is wider than min-width and narrower than min-width
      let minWidth = this.wallpaper.roll_width
      let maxWidth = 2000

      if (this.overlayWidth < minWidth) {
        this.minWidthError = true
        this.updateOverlaySize('width', minWidth)
      }
      else if (this.overlayWidth > maxWidth) {
        this.maxWidthError = true
        this.updateOverlaySize('width', maxWidth)
      }
      else {
        this.maxWidthError = false
        this.minWidthError = false
        this.updateOverlaySize('width', this.overlayWidth)
      }
    },
    validateHeight() {
      // Validate that input-height is lower than max-height and higher than min-height
      let maxHeight = this.wallpaper.pattern_height
      let minHeight = 100

      if (this.overlayHeight > maxHeight) {
        this.maxHeightError = true
        this.updateOverlaySize('height', maxHeight)
      }
      else if (this.overlayHeight < minHeight) {
        this.minHeightError = true
        this.updateOverlaySize('height', minHeight)
      }
      else {
        this.maxHeightError = false
        this.minHeightError = false
        this.updateOverlaySize('height', this.overlayHeight)
      }
    },
    updateOverlaySize(name, value) {
      this.$store.dispatch('setOverlaySize', {'type': name, 'size': value})
    },
    toggleLaminate() {
      this.laminate = !this.laminate
      this.$store.dispatch('setLamination', this.laminate)
    },
    sendOrder() {
      this.$store.dispatch('sendOrder');
      this.closeApp();
      /*global jQuery*/
      /*eslint no-undef: "error"*/
      let jquery = jQuery

      jquery('.js-buy-mural').click(function() {
        let submit = jquery('.js-product-form .form-submit');
        submit.trigger('mousedown');
      });
    }
  },
  mounted() {
    this.overlayHeight = this.$store.getters.getOverlaySize.height
    this.overlayWidth = this.$store.getters.getOverlaySize.width
    this.wallpaper = this.$store.getters.getWallpaperData
    this.borders = document.querySelectorAll(".mural-start-view")

    this.validateWidth()
    this.validateHeight()
  }
}
</script>

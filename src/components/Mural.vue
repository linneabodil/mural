<template>
  <div class="fluid pb-0 pt-0">
    <div class="mural-wrapper justify-md-space-between">
      <div class="mural-wrapper__image pt-0">
        <div class="d-flex justify-center">
          <h2 class="mural__title">{{ t.app_header }}</h2>
        </div>
        <MuralControls class="hidden-md-and-up" :hideOnMobile="true" />
          <v-row>
            <v-col class="ml-4 mr-6 pt-md-0"
              style="background-color: #EFF0F0;"
              :elevation="0"
              >
              <MuralImage />
            </v-col>

          <v-col cols="12" md="12" class="d-flex justify-center mt-md-0">
            <div class="toggle-switch toggle-switch__mural-app" :class="{'is-active': breadthStatus }">
              <span class="toggle-switch__label">{{ t.controls.breadths.hideBreadths }}</span>
                <button @click="applyFilter('breadths')" class="toggle-switch__switch">
                  <span> Toggle images style </span>
                </button>
              <span class="toggle-switch__label">{{ t.controls.breadths.showBreadths }}</span>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="d-flex justify-center mb-12 mb-md-0 pt-md-2">
            <p class="mural__description text-center">
              Denna fondtapet är {{ wallpaper.pattern_width }}cm bred och {{ wallpaper.roll_length }}cm hög och levereras uppdelad på {{ getNumBreadths }} stycken, {{ wallpaper.roll_width }}cm breda våder.
            </p>
          </v-col>
        </v-row>
      </div>
      <div class="pb-0 pt-0 controls__area">
        <v-card style="height:100%;"
        :elevation="0"
        >
          <MuralControls :key="overlaySize" class="controls--bottom" />
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import MuralImage from './MuralImage'
import MuralControls from './MuralControls'

export default {
  components: {
    MuralControls,
    MuralImage
  },
  computed: {
    breadthStatus() {
      return this.$store.getters.getFilters.showBreadths
    },
    getNumBreadths() {
      return this.$store.getters.getNumBreadths
    },
    t() {
      return this.$store.getters.getTranslations
    },
    wallpaper() {
      return this.$store.getters.getWallpaperData
    },
    overlaySize() {
      let overlaySize = this.$store.getters.getOverlaySize
      let key = ''

      // Update component if component is split to top and bottom
      if (window.innerWidth < 960) {
        key = overlaySize.width + overlaySize.height
      }
      return key
    }
  },
  methods: {
    applyFilter: function (name) {
      this.$store.dispatch('updateFilters', name)
    }
  }
}
</script>

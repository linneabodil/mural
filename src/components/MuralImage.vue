<template>
<div class="fluid">
  <div class="mural-rulers" v-resize="linePaddings">
    <div class="mural-box"></div>
    <div class="line-area line-area__width width">
      <div class="line line--no-after"></div>
      <!-- Empty span tags are instad och column gap so that grid displays correctly in IE11 -->
      <span></span>
      <p class="line-area__text">{{ overlaySize.width }} cm</p>
      <span></span>
      <div class="line line--no-before"></div>
    </div>
    <div class="line-area line-area__height height">
      <div class="line line--no-after"></div>
        <p class="line-area__text">{{ overlaySize.height }} cm</p>
      <div class="line line--no-before"></div>
    </div>

    <div class="mural-image" v-resize="imageHeight">
      <Dragable class="mural-image__image" />
      <Selection class="mural-image__selection" />
    </div>

  </div>
</div>
</template>

<script>

import Dragable from './Dragable'
import Selection from './Selection'

export default {
  components: {
    Dragable,
    Selection
  },
  data() {
    return {
      filters: {},
      overlaySize: {},
      wallpaper: {},
      image: {}
    }
  },
  watch: {
    'overlaySize.width'() {
      this.$nextTick(() => {
        this.linePaddings()
        this.imageHeight()
      })
    },
    'overlaySize.height'() {
      this.$nextTick(() => {
        this.linePaddings()
        this.imageHeight()
      })
    }
  },
  methods: {
    linePaddings() {
      // Add padding to lines to make them follow the selection
      let selection = document.querySelector(".km-selection")
      let mural = document.querySelector(".mural-image")

      let widthLine = document.querySelector(".line-area__width");
      let heightLine = document.querySelector(".line-area__height");

      if (selection) {
        widthLine.style.padding = "0"
        heightLine.style.padding = "0"

        // Add padding to width line
        let xPadding = (mural.offsetWidth - selection.offsetWidth) - 4
        xPadding /= 2
        widthLine.style.padding = "0 " + xPadding + "px";

        // Add padding to height line
        let yPadding = (mural.offsetHeight - selection.offsetHeight) - 4
        yPadding /= 2
        heightLine.style.padding = yPadding + "px 0";
      }
    },
    imageHeight() {
      // Set height equal to width
      let mural = document.querySelector(".mural-image")

      if (mural) {
        let muralWidth = mural.getBoundingClientRect().width
        mural.style.height = muralWidth + "px"
      }
    }
  },
  mounted () {
    this.filters = this.$store.getters.getFilters
    this.overlaySize = this.$store.getters.getOverlaySize
    this.wallpaper = this.$store.getters.getWallpaperData
    this.image = this.$store.getters.getImageData

    this.$nextTick(() => {
      this.linePaddings()
      this.imageHeight()
    })
  }
}
</script>

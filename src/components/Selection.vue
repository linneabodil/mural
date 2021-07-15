<template>
  <div class="mural-selection" v-resize="edgeSize">
    <div class="mural-selection__item mural-start-view" :style="`${xBorderSize}`"></div>
    <div class="mural-selection__inner" :style="`${innerSelectionSize}`">
      <div class="mural-selection__item mural-start-view" :style="`${yBorderSize}`">
        <div class="mural-selection__item mural-edge mural-edge__top mural-start-view"></div>
      </div>
      <div class="mural-selection__item mural-selection__item--selection" :style="`${selectionSize}`">
        <canvas class="km-selection" id="breadths"></canvas>
      </div>
      <div class="mural-selection__item mural-selection__item--no-background" :style="`${yBorderSize}`">
        <div class="mural-selection__item mural-edge mural-edge__bottom mural-start-view"></div>
      </div>
    </div>
    <div class="mural-selection__item mural-start-view" :style="`${xBorderSize}`"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlaySize: {},
      wallpaper: {},
      filters: {},
      selection: {},
      mural: {}
    }
  },
  watch: {
    'overlaySize.width'() {
      this.$nextTick(() => {
        this.clearBreadths();
        this.edgeSize();
      });
    },
    'overlaySize.height'() {
      this.$nextTick(() => {
        this.clearBreadths();
        this.edgeSize();
      });
    },
    'filters.showBreadths'() {
      this.clearBreadths();
    }
  },
  computed: {
    innerSelectionSize() {
      // Set size of selection, including borders top/bottom
      let heightResult = "height: "
      let height = 100

      let widthResult = "width: "
      let width = 100

      if (this.overlaySize.width > this.wallpaper.pattern_height) {
        height = (this.overlaySize.height / this.overlaySize.width) * 100;
      }
      heightResult += height + "%;"

      if (this.overlaySize.width < this.wallpaper.pattern_height) {
        width = (this.overlaySize.width / this.wallpaper.pattern_height) * 100;
      }
      widthResult += width + "%;"

      return heightResult + widthResult;
    },
    xBorderSize() {
      // Borders left and right
      let styleResult = "height: 100%; width: ";
      let border = 0;

      if (this.overlaySize.width <= this.wallpaper.pattern_height) {
        let percent = 1 - (this.overlaySize.width / this.wallpaper.pattern_height);
        border = (percent * 100) / 2
      }

      styleResult += "calc(" + border + "% + 1px);"
      return styleResult;
    },
    yBorderSize() {
      // Borders up and down
      let styleResult = "height: "
      let border = 0;

      // Add height to edges top/bottom when selection is smaller than maxheight
      if (this.overlaySize.width <= this.wallpaper.pattern_height) {
        let percent = 1 - (this.overlaySize.height / this.wallpaper.pattern_height);
        border = (percent * 100) / 2
      }

      return styleResult + border + "%"
    },
    selectionSize() {
      // Set height on selection, when inputs are lower than size of pattern
      let styleResult = "height: "
      let height = 100

      if (this.overlaySize.width <= this.wallpaper.pattern_height) {
        let percent = this.overlaySize.height / this.wallpaper.pattern_height;
        height = percent * 100
      }

      return styleResult + height + "%"
    }
  },
  methods: {
    clearBreadths() {
      let canvas = document.getElementById('breadths');

      if (canvas.getContext) {
        let ctx = canvas.getContext("2d");

        this.$nextTick(() => {
          ctx.canvas.width = ctx.canvas.offsetWidth;
          this.drawBreadths(ctx)
        })
      }
    },
    drawBreadths(ctx) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'hotpink';

      if (window.innerWidth < 960) {
        ctx.lineWidth = 1;
      }

      let selection = document.querySelector(".km-selection");
      let selectionWidth = selection.getBoundingClientRect().width;

      let cmToPx = selectionWidth / this.overlaySize.width;

      // Number and size of breadths
      let num = this.overlaySize.width / this.wallpaper.roll_width;
      let breadthWidth = this.wallpaper.roll_width * cmToPx;

      if (this.filters.showBreadths) {
         // Draw lines on canvas
        for (let j = 0, i = breadthWidth; j < num - 1; j++) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1000);
          ctx.stroke();
          i += breadthWidth
        }
      }
    },
    edgeSize() {
      // Edges to hide image outside of selection
      let edges = document.querySelectorAll(".mural-edge")
      let diff = 0

      if (edges) {
        let selection = this.selection;
        let mural = this.mural;

        diff += (mural.offsetHeight - selection.offsetHeight) - 4;
        diff /= 2
        for (let i = 0; i < edges.length; i++) {
          edges[i].style.height = diff + "px"
        }

        let edgeTop = document.querySelector(".mural-edge__top")
        edgeTop.style.top = "-" + diff + "px"
      }
    }
  },
  mounted() {
    this.overlaySize = this.$store.getters.getOverlaySize;
    this.wallpaper = this.$store.getters.getWallpaperData;
    this.filters = this.$store.getters.getFilters;
    this.selection = document.querySelector(".km-selection")
    this.mural = document.querySelector(".mural-image")
    this.$nextTick(() => {
      this.clearBreadths();
      this.edgeSize();
    })
  }
}
</script>

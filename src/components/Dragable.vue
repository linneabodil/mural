<template>
  <div class="mural-dragable" v-resize="onResize" :style="`${breadthWidth}`">
    <figure id="jsFigure" class="figure mural-dragable__item">
      <div
        class="km-image"
        :class="{bw: filters.grayScale, hf: filters.flipHorizontal}"
        :style="{ backgroundImage: 'url(' + image.url + ')' }"
        :alt="image.alt"
        :aspect-ratio="image.ratio">
      </div>
    </figure>
  </div>
</template>

<script>

export default {
  data() {
    return {
      filters: {},
      overlaySize: {},
      wallpaper: {},
      image: {},
      active: false,
      dragItem: {},
      container: {},
      selection: {},
      currentX: 0,
      currentY: 0,
      initialX: 0,
      initialY: 0,
      offsetX: 0,
      offsetY: 0,
      cuttingsData: {},
      repeat_height: false
    }
  },
  watch: {
    'overlaySize.width'() {
      this.$nextTick(() => {
        this.imageSize()
        this.figureSize()
        this.validatePosition(this.offsetX, this.offsetY)
      })
    },
    'overlaySize.height'() {
      this.$nextTick(() => {
        this.imageSize()
        this.figureSize()
        this.validatePosition(this.offsetX, this.offsetY)
      })
    }
  },
  computed: {
    breadthWidth() {
      let result = 100
      let ratio = (this.wallpaper.roll_width / this.wallpaper.pattern_width) * 100

      let percent = (this.wallpaper.roll_width / this.overlaySize.width) * 100

      // Keep ratio if selection smaller than patternsize
      if (percent > ratio) percent = ratio

      result += percent

      return "width: " + result + "%;"
    }
  },
  methods: {
    onResize() {
      this.$nextTick(() => {
        this.imageSize()
        this.figureSize()
        this.validatePosition(this.offsetX, this.offsetY)
      });
    },
    dragStart(event) {
      if (event.type === "touchstart") {
        this.initialX = event.touches[0].clientX - this.offsetX;
        this.initialY = event.touches[0].clientY - this.offsetY;
      } else {
        this.initialX = event.clientX - this.offsetX;
        this.initialY = event.clientY - this.offsetY;
      }

      if (event.target === this.selection) {
        this.active = true;
      }
    },
    drag(event) {
      if (this.active) {
        event.preventDefault();

        this.mural.classList.add("drag-active");

        let movingX = this.currentX;
        let movingY = this.currentY;

        if (event.type === "touchmove") {
          movingX = event.touches[0].clientX - this.initialX;
          movingY = event.touches[0].clientY - this.initialY;
        } else {
          movingX = event.clientX - this.initialX;
          movingY = event.clientY - this.initialY;
        }

        this.validatePosition(movingX, movingY)
      }
    },
    validatePosition(movingX, movingY) {
      // Check that image stays inside of selection
      let container = document.querySelector(".mural-image");
      let containerRect = container.getBoundingClientRect();

      let selection = this.selection;
      let selectionRect = selection.getBoundingClientRect();

      let dragItem = this.dragItem;
      let dragItemRect = dragItem.getBoundingClientRect();

      let leftLimit = selectionRect.left - containerRect.left;
      let rightLimit = leftLimit + selectionRect.width;
      let rightEdge = movingX + dragItemRect.width;

      // Prevent item from going outside of selection (left/right)
      if (movingX > leftLimit) movingX = leftLimit;
      if (rightEdge < rightLimit) movingX = rightLimit - dragItemRect.width;

      let topLimit = selectionRect.top - containerRect.top;
      let bottomLimit = topLimit + selectionRect.height;
      let bottomEdge = movingY + dragItemRect.height;

      // Prevent item from going outside of selection (top/bottom)
      if (movingY > topLimit) movingY = topLimit;
      if (bottomEdge < bottomLimit) movingY = bottomLimit - dragItemRect.height;

      this.offsetX = movingX;
      this.offsetY = movingY;

      this.setTranslate(movingX, movingY, this.dragItem);
      this.setCuttingsData(containerRect, selectionRect, dragItemRect);
    },
    dragEnd() {
      this.mural.classList.remove("drag-active");

      this.initialX = this.currentX;
      this.initialY = this.currentY;

      this.active = false;
      this.$store.dispatch('setCuttingsData', this.cuttingsData);
    },
    setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    },
    setCuttingsData(container, selection, dragItem) {
      let x = selection.left - dragItem.left;
      let y = selection.top - dragItem.top;

      let cutFromX = x / dragItem.width;
      let cutToX = cutFromX + (selection.width / dragItem.width);

      let cutFromY = y / dragItem.height;
      let cutToY = cutFromY + (selection.height / dragItem.height);

      this.cuttingsData = {
        cutFromX: cutFromX.toFixed(2),
        cutToX: cutToX.toFixed(2),

        cutFromY: cutFromY.toFixed(2),
        cutToY: cutToY.toFixed(2)
      }
    },
    imageSize() {
      // Set background-size on image to make it scale inside of container
      let image = document.querySelector(".km-image")

      if (image) {

        // If wallpaper does not have repeatable height
        if (!this.repeat_height) {
          image.style.backgroundSize = "contain"
        }

        // If wallpaper has repeatable height
        else {
          let width = this.wallpaper.pattern_width + this.wallpaper.roll_width
          let ratio = (width / this.wallpaper.pattern_height) * 100;
          let percent = ratio

          if (this.overlaySize.width > this.overlaySize.height) {
            percent = (this.wallpaper.pattern_width / this.overlaySize.width) * 100;

            // Keep max background-size to avoid zooming in
            if (percent > ratio) percent = ratio
          }

          // Resize to compensate for extra breadth-width
          let breadth = 1 - (this.wallpaper.roll_width / this.overlaySize.width)
          if (this.overlaySize.width > this.wallpaper.pattern_height) {
            percent *= breadth
          }
          // TODO: fix math for width-input < 350

          image.style.backgroundSize = percent + "%"
        }
      }
    },
    figureSize() {
      // Set height on image container
      let figure = this.dragItem
      let percent = 1
      let figureHeight = 0
      let figureWidth = 100

      if (figure) {
        let selection = document.querySelector(".mural-selection__inner");
        let selectionHeight = selection.getBoundingClientRect().height

        if (this.overlaySize.width > this.overlaySize.height) {
          percent = this.wallpaper.pattern_height / this.overlaySize.height
          figureHeight = selectionHeight * percent
        }

        if (this.overlaySize.width <= this.wallpaper.pattern_height) {
          let mural = document.querySelector(".mural-selection")
          let muralHeight = mural.getBoundingClientRect().height
          figureHeight = muralHeight
        }

        // ***

          // For patterns with extra wide pattern width
          let originalFigureWidth = this.wallpaper.pattern_width - this.wallpaper.roll_width
          let wallpaperWidth = this.wallpaper.pattern_width + this.wallpaper.roll_width

          let ratio = 1 + (this.wallpaper.pattern_height / originalFigureWidth)

          /*
            INFO:
            Detta funkar på den breda tapeten "Carnation Garden Mural",
            när inmatat bredd är under 250 och över 475.
          */

        if (this.overlaySize.width < wallpaperWidth) {
            console.log(ratio)
            if (ratio < 2) {
              // Show full pattern width plus one breadth, gives extra width to dragelement
              figureWidth = ratio * 100
            }
          }

        // ***

        // Minus 4px to match the border on the selection
        figure.style.height = "calc(" + figureHeight + "px - 4px)"
        figure.style.width = figureWidth + "%"
      }
    },
    hideBorders() {
      // Show opacity on borders from start, remove after first drag-event
      let borders = document.querySelectorAll(".mural-start-view")
      for (let i = 0; i < borders.length; i++) {
        borders[i].classList.remove("mural-start-view")
      }
    }
  },
  mounted() {
    this.filters = this.$store.getters.getFilters
    this.overlaySize = this.$store.getters.getOverlaySize
    this.wallpaper = this.$store.getters.getWallpaperData
    this.image = this.$store.getters.getImageData

    this.dragItem = document.querySelector(".mural-dragable__item");
    this.container = document.querySelector(".mural-image__selection");
    this.selection = document.querySelector(".km-selection");
    this.mural = document.querySelector(".mural-image");

    this.container.addEventListener("touchstart", this.dragStart, false);
    this.container.addEventListener("touchend", this.dragEnd, false);
    this.container.addEventListener("touchend", this.hideBorders, false);
    this.container.addEventListener("touchmove", this.drag, false);

    this.container.addEventListener("mousedown", this.dragStart, false);
    this.container.addEventListener("mouseup", this.dragEnd, false);
    this.container.addEventListener("mouseup", this.hideBorders, false);
    this.container.addEventListener("mousemove", this.drag, false);

    window.addEventListener('mouseup', this.dragEnd, false)

    this.$nextTick(() => {
      this.imageSize();
      this.dragItem.style.transform = "translate3d(0px, 0px, 0px)";
    });
  }
}

</script>

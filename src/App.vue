<template>
  <v-app id="mural-app">
    <Mural />
  </v-app>
</template>

<script>
import Mural from './components/Mural.vue'

export default {
  name: 'App',
  components: {
    Mural
  },
  data: () => ({
    //
  }),
  methods: {
    getNidFromDrupal: function () {
      /*global Drupal*/
      /*eslint no-undef: "error"*/
      let nid = Drupal.settings.currentPath
      return nid.replace('node/', '')
    },
  },
  beforeCreate() {
    this.$store.commit('INITIALIZE_STORE')
  },
  mounted () {
    const langCode = 'sv'
    this.$store.dispatch('loadImageData', this.getNidFromDrupal())
    this.$store.dispatch('loadSettingsData', langCode)
  }
}
</script>

<style lang="scss">

@import './scss/main.scss';

</style>

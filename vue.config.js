module.exports = {
  "lintOnSave": process.env.NODE_ENV !== 'production',
  "transpileDependencies": [
    "vuetify"
  ],
  "filenameHashing": false,
  "publicPath": process.env.NODE_ENV === 'production'
    ? ''
    : ''
}

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Amplify from 'aws-amplify'
import '@aws-amplify/ui-vue'
import awsconfig from './aws-exports'
import './assets/css/styles.css'

Amplify.configure(awsconfig)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

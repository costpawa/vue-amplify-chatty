<template>
  <div id="app">
    <div class="app-header">
      <div class="app-logo">
        <img src="https://aws-amplify.github.io/images/Logos/Amplify-Logo-White.svg" alt="AWS Amplify">
      </div>
      <h1>Welcome to the Amplify Framework</h1>
    </div>
    <div class="app-body">
      <amplify-authenticator>
        <div class="welcome">
          <h1>Hey, {{ user.username }}!</h1>
          <amplify-sign-out></amplify-sign-out>
        </div>
      </amplify-authenticator>
      <div v-if="user">
        <div class="form-body">
          <form v-on:submit.prevent autocomplete="off">
            <div class="input">
              <input type="text" class="message-input" v-model="form.message" autocomplete="off" placeholder="Enter your message" />
            </div>
            <button @click="sendMessage">Send</button>
            <button @click="deleteAll">Delete All</button>
          </form>
        </div>
        <div>
          <div v-if="loading" class="loading">Loading...</div>
          <div v-if="!loading" class="chatty-container">
            <div class="chatty">
              <div v-for="message of sorted" :key="message.id">
                <div v-bind:class="[(user.username === message.user) ? 'me' : 'others']">
                  <div class="message-container">
                    <div class="message-user">
                      {{ message.user }}
                      <span
                        class="message-time"
                        :title="$options.filters.formatDateTime(message.createdAt)"
                      >
                        {{ message.createdAt | formatTime }}
                      </span>
                    </div>
                    <div class="message-text">{{ message.message }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components'
import { DataStore, Predicates } from '@aws-amplify/datastore'
import { Chatty } from './models'
import moment from 'moment'
import Vue from 'vue'

Vue.filter('formatTime', (value) => {
  if(!value) return;
  return moment(String(value)).format('HH:mm:ss')
})
Vue.filter('formatDateTime', (value) => {
  if(!value) return;
  return moment(String(value)).format('YYYY-MM-DD HH:mm:ss')
})

export default ({
  name: 'App',
  data: () => ({
    user: {},
    form: {},
    messages: [],
    loading: false,
  }),

  created() {
    this.subscription = DataStore.observe(Chatty).subscribe(msg => {
      console.log(`${msg.model.name} - ${msg.opType}`, msg.element)
      this.loadMessages()
    })

    onAuthUIStateChange((state, user) => {
      switch(state) {
        case AuthState.SignedIn: {
          this.user = user
          console.log(user)
          this.loadMessages()
          break
        }
      }
    })
  },

  computed: {
    sorted() {
      let messages = [...this.messages]
      return messages.sort((a, b) => -a.createdAt.localeCompare(b.createdAt))
    }
  },

  methods: {
    moment: () => moment(),
    loadMessages() {
      try {
        this.loading = true
        DataStore.query(Chatty, Predicates.ALL).then(messages => {
          this.loading = false
          this.messages = messages
        })
      } catch(err) {
        console.log('Error loading messages', err)
      } finally {
        this.loading = false
      }
    },
    sendMessage() {
      const { message } = this.form
      if(!message) return;
      DataStore.save(
        new Chatty({
          user: this.user.username,
          message: message,
          createdAt: new Date().toISOString(),
        })
      )
      .then(() => {
        console.log('message created')
        this.form = { message: '' }
      })
      .catch(err => {
        console.log(err)
      })
    },
    async deleteAll() {
      await DataStore.delete(Chatty, Predicates.ALL)
      .then(() => this.loadMessages())
      .catch((err) => {
        console.log('Error deleting all messages', err)
      })
    }
  },
})
</script>

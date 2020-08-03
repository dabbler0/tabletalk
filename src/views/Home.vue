<template>
  <div class="home">
    <div style="position: absolute;left:0;top:0;z-index:9999;background:white;">
      <input placeholder="room id" v-model="roomId"/>
      <input placeholder="display name" v-model="displayName"/>
      <button id="join" @click="join()">Join</button>
      <div v-if="manager">
        {{manager.connectionState}}, {{manager.roomState}}
      </div>

      <div ref="remote">
      </div>
    </div>
  </div>
</template>

<script>
import JitsiManager from '@/jitsi-manager.js'
// import scenes from '@/three-manager.js'

export default {
  name: 'Home',
  data () {
    return {
      roomId: '',
      displayName: '',
      manager: null
    }
  },
  methods: {
    join () {
      this.manager.joinRoom(this.roomId, this.displayName)
    }
  },
  created () {
    this.manager = new JitsiManager()
    window.manager = this.manager
    this.manager.connect()

    /*

    const scene = new scenes.Scene(window.innerWidth, window.innerHeight)
    const sceneElement = scene.element()

    console.log(sceneElement)

    sceneElement.style.position = 'absolute'
    sceneElement.style.top = '0px'
    sceneElement.style.left = '0px'
    */

    // document.body.appendChild(sceneElement)

    this.manager.on('remoteVideo', (video) => {
      // console.log('ADDING NEW REMOTE VIDEO')
      // scene.addVideo(video)
      this.$refs.remote.appendChild(video)
    })
    this.manager.on('remoteAudio', (audio) => {
      document.body.appendChild(audio)
    })

    this.manager.collectTracks()
  }
}
</script>

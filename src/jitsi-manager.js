/* global JitsiMeetJS */
class JitsiManager {
  constructor () {
    JitsiMeetJS.init()

    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR)

    this.connectionState = 'unconnected'
    this.connection = null

    this.tracks = []
    this.remoteTracks = [] // TODO debugging only.

    this.roomState = 'no-room'
    this.room = null

    this.listeners = {
      remoteVideo: [],
      remoteAudio: [],
      localVideo: [],
      localAudio: [],
      connectionStateChange: [],
      roomStateChange: []
    }

    this.config = {
      hosts: {
        domain: 'tabletalk.anthonybau.com',
        muc: 'conference.tabletalk.anthonybau.com'
      },

      bosh: 'https://tabletalk.anthonybau.com/http-bind',

      clientNode: 'https://jitsi.org/jitsi-meet',

      p2p: {
        enabled: false
      }
    }
  }

  addEventListener (e, f) {
    this.listeners[e].push(f)
  }

  on (e, f) {
    this.addEventListener(e, f)
  }

  removeEventListener (e, f) {
    this.listeners[e] = this.listeners[e].filter((x) => x !== f)
  }

  collectTracks () {
    JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] })
      .then((tracks) => {
        tracks.forEach((track) => {
          this.addLocalTrack(track)
        })
      })
  }

  addLocalTrack (track) {
    this.tracks.push(track)
    this.emitLocalTrack(track)

    if (this.roomState === 'in-room') {
      this.room.addTrack(track)
    }
  }

  emitLocalTrack (track) {
    if (track.getType() === 'audio') {
      const audioElement = document.createElement('audio')
      track.attach(audioElement)

      this.listeners.localAudio.forEach((f) => {
        f(audioElement)
      })
    } else if (track.getType() === 'video') {
      const videoElement = document.createElement('video')
      track.attach(videoElement)

      this.listeners.localVideo.forEach((f) => {
        f(videoElement)
      })
    }
  }

  connect () {
    this.connection = new JitsiMeetJS.JitsiConnection(null, null, this.config)

    this.connectionStateChange('connection-pending')

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => {
        console.log('ESTABLISHED')
        this.connectionStateChange('connected')
      }
    )

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => {
        console.log('FAILED')
        this.connectionStateChange('unconnected')
        this.connection = null
      }
    )

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      () => {
        this.connectionStateChange('unconnected')
        this.connection = null
      }
    )

    this.connection.connect()
  }

  connectionStateChange (newState) {
    this.connectionState = newState

    this.listeners.connectionStateChange.forEach((f) => {
      f(newState)
    })
  }

  joinRoom (roomId, displayName) {
    if (this.connectionState !== 'connected') {
      return false
    }

    if (this.roomState !== 'no-room') {
      return false
    }

    this.roomStateChange('room-pending')

    const room = this.connection.initJitsiConference(roomId, {
      openBridgeChannel: true // What is this?
    })

    room.setDisplayName(displayName)

    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
      this.roomStateChange('in-room')
      this.tracks.forEach((track) => {
        room.addTrack(track)
      })
    })

    room.on(JitsiMeetJS.events.conference.CONFERENCE_LEFT, () => {
      this.roomStateChange('no-room')
      this.room = null
    })

    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
      this.emitTrack(track)
    })

    this.room = room

    room.join()

    this.currentRoom = room

    return true
  }

  emitTrack (track) {
    if (track.isLocal()) {
      // this.emitLocalTrack(track)
    } else {
      this.emitRemoteTrack(track)
    }
  }

  roomStateChange (newState) {
    this.roomState = newState
    this.listeners.roomStateChange.forEach((f) => {
      f(newState)
    })
  }

  emitRemoteTrack (track) {
    this.remoteTracks.push(track) // TODO debugging only
    if (track.getType() === 'audio') {
      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      track.attach(audioElement)

      this.listeners.remoteAudio.forEach((f) => {
        f(audioElement)
      })
    } else if (track.getType() === 'video') {
      const videoElement = document.createElement('video')
      videoElement.autoplay = true
      track.attach(videoElement)

      this.listeners.remoteVideo.forEach((f) => {
        f(videoElement)
      })
    }
  }
}

export default JitsiManager

<template>
  <div class="hello">
    Test!
  </div>
</template>

<script>
import JitsiManager from '@/jitsi-setup.js'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  created () {
    const manager = new JitsiManager()
    manager.connect()
  }
}
</script>

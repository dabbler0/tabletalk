import * as THREE from 'three'

class Scene {
  constructor (width, height) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer()

    this.seats = 0
    this.tableRadius = 0
    this.participantSize = 10

    this.renderer.setSize(width, height)

    this.videos = []
    this.surfaces = []

    const animate = () => {
      requestAnimationFrame(animate)
      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  addVideo (video) {
    this.videos.push(video)
    this.reconstructScene()
  }

  reconstructScene () {
    // Remove existing surfaces
    this.surfaces.forEach((surface) => {
      this.scene.remove(surface)
    })

    this.surfaces = []

    // Add a new surface for each video
    this.setNumberOfSeats(this.videos.length + 1)
    console.log(`Rerendering with ${this.seats} seats`)
    this.videos.forEach((video, i) => {
      this.createVideoAtSeat(video, i + 1)
    })
  }

  setNumberOfSeats (seats) {
    this.seats = seats
    this.tableRadius = Math.max(7, 10 * this.seats)

    this.camera.position.x = this.tableRadius

    this.camera.lookAt(0, 0, 0)
  }

  createVideoAtSeat (video, i) {
    const geometry = new THREE.PlaneGeometry(this.participantSize,
      this.participantSize)

    const texture = new THREE.VideoTexture(video)

    const material = new THREE.MeshBasicMaterial({
      map: texture
    })

    const mesh = new THREE.Mesh(geometry, material)

    const radians = i * Math.PI * 2 / this.seats

    mesh.position.x = this.tableRadius * Math.cos(radians)
    mesh.position.z = this.tableRadius * Math.sin(radians)

    mesh.lookAt(0, 0, 0)

    this.scene.add(mesh)
  }

  element () {
    return this.renderer.domElement
  }
}

export default {
  Scene
}

import { useState } from 'react'
import './App.css'
import * as THREE from 'three'
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {Canvas, extend, useFrame, useLoader, useThree} from '@react-three/fiber'
import { Suspense } from 'react'
import circleImg from './assets/circle.png'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'

// extend(THREE)
extend(OrbitControls)

function CameraControls() {
  const {camera,gl:{domElement}} = useThree()
  const controlsRef = useRef()
  useFrame(()=>controlsRef.current.update())

  return(
    <OrbitControls
    ref = {controlsRef}
    args = {[camera, domElement]}
    autoRotate
    autoRotateSpeed={-0.2}
    />
  )
}

function Points() {
  const texture = useLoader(THREE.TextureLoader,circleImg)
  const count = 100
  const sep = 1
  const bufferRef = useRef()

  let t = 0
  let f = 0.002
  let a = 3

  const graph = useCallback((x,z)=>{
    return Math.sin(f*(x**2+z**2+t))*a
  })

  let positions=useMemo(()=>{
    let positions = []    

    for (let xi =0;xi<count;xi++) {
      for (let zi=0;zi<count;zi++) {
        let x = sep*(xi-count/2)
        let z = sep*(zi-count/2)
        let y = graph(x,z)
        positions.push(x,y,z)
      }
    }
    return new Float32Array(positions)
  },[count,sep])

  useFrame(()=>{
    t+=15
    const positions = bufferRef.current.array
    let i = 0
    for (let xi =0;xi<count;xi++) {
      for (let zi=0;zi<count;zi++) {
        let x = sep*(xi-count/2)
        let z = sep*(zi-count/2)
        positions[i+1] = graph(x,z)
        i+=3
      }
    }
    bufferRef.current.needsUpdate = true
  })
  return(
    <points>
      <bufferGeometry attach='geometry'>
        <bufferAttribute 
        // attachObject={['attributes','position']}
        attach='attributes-position'
        ref={bufferRef}
        array={positions}
        count={positions.length/3}
        itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach='material' 
        map={texture}
        color={0x00aaff}
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  )
}

function AnimationCanvas() {
  return(
    <Canvas
    // colorManagement={false}
    camera={{position:[100,10,0],fov:75}}
    >
      <Suspense fallback={null/*<div>Loading...</div>*/}>
      <Points/>
      </Suspense>
      <CameraControls/>

    </Canvas>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Suspense fallback={null}>
        <AnimationCanvas/>
      </Suspense>
    </div>
  )
}

export default App

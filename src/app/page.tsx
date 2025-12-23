"use client"; // <-- make the file client side so that anime.js and three.js can use the DOM
import { Canvas } from "@react-three/fiber"; // for 
import { OrbitControls, DragControls, Text, Billboard } from "@react-three/drei"; // for camera control
import { useState } from 'react'; // for manipulating what exist in the scene


type SphereProperty = {
    // x, y, z
    position?: [number, number, number],
    // radius, segmentsWidth segmentsHeight
    geometry?: [number, number, number],
    value?: number
}


function Sphere({position = [0, 0, 0], geometry = [5, 32, 32]}: SphereProperty) {
    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            // position={position}
            onPointerOver={() => {setHovered(true); document.body.style.cursor = 'pointer'}}
            onPointerLeave={() => {setHovered(false); document.body.style.cursor = 'auto'}}
        >
            <sphereGeometry args={geometry} />
            <meshStandardMaterial color={hovered ? "#aa00aa" : "#670067"} />
        </mesh>
    )
}


export default function TestGround() {
    const [spheres, setSpheres] = useState<SphereProperty[]>( [] )

    const spawnSphere = () => {
        const newSphere: SphereProperty = {
            position: [Math.random() * 32 - 16, Math.random() * 32 - 16, Math.random() * 32 - 16],
            geometry: [2, 32, 32],
            value: Math.round(Math.random() * 6767) / 100.0
        };

        setSpheres(prev => [...prev, newSphere]);
    }

    const [isDragging, setDragging] = useState(false);

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: "#222" }}>

            {/* button */}
            <div style={{position: 'absolute', top: '5%', left: '5%', zIndex: 10}}>
                <button onClick={spawnSphere} style={{padding: '10px 20px'}}> Spawn Sphere </button>
            </div>
 
            <Canvas camera={{ position: [0, 0, 25], fov: 100 }}>
                <ambientLight intensity={5} />
                <pointLight position={[0, 0, 0]} intensity={550} />

                {/* <Sphere geometry={[0.5, 8, 8]} /> */}
                {/* <Sphere position={[10, 0, 0]} /> */}

                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial color="#fff" />
                </mesh>

                <DragControls onDragStart={() => setDragging((true))} onDragEnd={() => setDragging((false))}>
                    <mesh position={[0, 10, 0]}>
                        <sphereGeometry args={[2, 16, 16]} />
                        <meshStandardMaterial color="#670043" />
                    </mesh>

                    {/* <Text fontSize={5}> Hello World </Text> */}
                </DragControls>

                {spheres.map((sphereProp, i) => (
                    <DragControls key={i} onDragStart={() => setDragging((true))} onDragEnd={() => setDragging((false))}>
                        <group key={i} position={sphereProp.position}>
                            <Sphere {...sphereProp} />
                            <Billboard>
                                <Text position={[0, 3.5, 0]} fontSize={2} anchorX="center" anchorY="middle">
                                    RM{sphereProp.value}
                                </Text>
                            </Billboard>
                        </group>
                    </DragControls>
                ))}

                <OrbitControls enablePan={!false} enableRotate={!isDragging}/>
            </Canvas>
        </div>
    );
}


// NOTE: 
// useState is used for manipulating the scene
// syntax :
// const [state, updateState] = useState<type>(initialValue)
// state => the current state
// updateItem => function that will be used to update the state

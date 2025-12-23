"use client"; // <-- make the file client side so that anime.js and three.js can use the DOM
import { Canvas, useThree  } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";


function CameraObj() {
    // useThree is for manipulating the 3D engine internals
    const { camera, size } = useThree();

    console.log("Cam Pos: ", camera.position);
    console.log("Canvas Size: ", size.width, " | ", size.height);
    return null;
}

export default function TestGround() {
    const handleButtonClick = () => {
        alert("67");
    }

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: "#222" }}>
            {/* button */}
            <div style={{position: 'absolute', top: '5%', left: '5%', zIndex: 10}}>
                <button onClick={handleButtonClick} style={{padding: '10px 20px'}}> Camera </button>
            </div>
 
            <Canvas camera={{ position: [0, 0, 25], fov: 100 }}>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={1500} />

                <CameraObj />

                {/* This is the Mesh */}
                <mesh position={[0, 0, 0]}>
                    {/* [radius, widthSegments, heightSegments] */}
                    <sphereGeometry args={[1, 32, 32]} />

                    <meshStandardMaterial color="#bb99cc" />
                </mesh>

                <OrbitControls enablePan={false} />
            </Canvas>
        </div>
    );
}

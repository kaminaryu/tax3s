"use client"; // <-- make the file client side so that anime.js and three.js can use the DOM
import { Canvas } from "@react-three/fiber"; // for 
import { OrbitControls, DragControls, Text, Billboard } from "@react-three/drei"; // for camera control
import { useRef, useState } from 'react'; // for manipulating what exist in the scene
import { CylinderGeometry, Matrix4, Vector3, Mesh, Quaternion } from "three";

// TODO: 
// 1. add new vector3 type so that i dont have to go insane by typing [number, number, number] everywhere
// 2. seperate ts into seperate files before i get permanent brain damages
//
// NOTE:
// 1. Dont ask why i use arrays to store position etc instead of Vector3, ts project is a mess and a testing ground lmaoaoaooa

type NodeProperty = {
    id: number,
    // x, y, z
    position: [number, number, number],
    // radius, segmentsWidth segmentsHeight
    geometry: [number, number, number],
    label: string,
    parentNode?: NodeProperty,
    childNodes: NodeProperty[],
    offsetFromParent: number[]
}

type LineProperty = {
    position?: [number, number, number],
    rotation?: [number, number, number],
    length?: number,
    radius?: number,
    segments?: [number, number]
}

// for company infos like name, revenues, Expenses etc
type CompanyProperty = {
    name: string,
    revenue: number,
    expenses: number
}


function Node({position = [0, 0, 0], geometry = [5, 32, 32]}: NodeProperty) {
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

function Line(property: LineProperty) {
    return (
        <mesh
            position = {property.position}
            rotation = {property.rotation}
        >
            <cylinderGeometry args={[property.radius, property.radius, property.length, 32]} />
            <meshStandardMaterial color="#670067" />
        </mesh>
    )
}



export default function TestGround() {
    // array of sphere properties (propeties)i
    const [rootNodesProperties, setRootNode] = useState<NodeProperty[]>( [] );

    const [leafNodesProperties, setLeafNode] = useState<NodeProperty[]>( [] );

    const [lines, setLines] = useState<LineProperty[]>( [] );

    const [isDragging, setDragging] = useState(false);

    const [companyProperties, setCompanyProperties] = useState<CompanyProperty>( {name: " ", revenue: 0, expenses: 0} );

    const leafNodePosRefs = useRef<(Mesh | null)[]>([]);

    const [nodeID, increaseNodeID] = useState(0);


    // the sphere creator, will put the properties inside the arr of spheres using useState ( propety handler )
    const spawnGraph = (companyName: string, companyRevenue: number, companyExpenses: number) => {
        // basicaly create a binary node with depth of 2

        let currentID = nodeID;

        // this is the root node
        const newRootNode: NodeProperty = {
            id: currentID++,
            position: [
                Math.random() * 32 - 16,
                Math.random() * 32 - 16,
                Math.random() * 32 - 16
            ],
            geometry: [2, 32, 32],
            label: companyName,
            childNodes: [],
            offsetFromParent: []
        };

        increaseNodeID(id => id + 1);

        // create two child notes
        for (let i: number = 0; i < 2; i++) {
            const childOffset: [number, number, number] = [10 * (i ? 1 : -1), -5, 0];

            const newLeafNode: NodeProperty = {
                id: currentID++,
                position: [
                    newRootNode.position[0] + childOffset[0],
                    newRootNode.position[1] + childOffset[1],
                    newRootNode.position[2] + childOffset[2],
                ],
                geometry: [1.5, 32, 32],
                label: "RM" + ((i % 2) ? companyRevenue : companyExpenses),
                parentNode: newRootNode,
                childNodes: [],
                offsetFromParent: [...childOffset]
            }

            increaseNodeID(currentID);

            newRootNode.childNodes[i] = newLeafNode;

            setLeafNode(prev => [...prev, newLeafNode]);
        }


        setRootNode(prev => [...prev, newRootNode]);
    }


    const updateChildNodes = (matrix: Matrix4, rootNode: NodeProperty) => {
        // console.log(node.childNodes[0].position);
        // console.log(node.position);
        var rootOffset = new Vector3;
        rootOffset.setFromMatrixPosition(matrix);


        // this is so scuffed but its 4am idc anymore, ill make it better later
        // NOTE: node.position should be renamed to initPosition
        for (let child of rootNode.childNodes) {
            child.position[0] = rootOffset.x + rootNode.position[0] + child.offsetFromParent[0];
            child.position[1] = rootOffset.y + rootNode.position[1] + child.offsetFromParent[1];
            child.position[2] = rootOffset.z + rootNode.position[2] + child.offsetFromParent[2];

            leafNodePosRefs.current[child.id]?.position.set(...child.position);

            // console.log("Oh fuh naw: ", updatedPos)
        }
    }


    const drawLine = () => {
        const newLine: LineProperty = {
            position: [0, 0, 0],
            rotation: [Math.PI / 4, 0, 0],
            length: 16,
            radius: 0.5,
            segments: [32, 32]
        };

        setLines(prev => [...prev, newLine]);
    }


    // main scene
    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: "#222" }}>

            {/* input forms */}
            <div style={{position: 'absolute', top: '5%', left: '5%', zIndex: 10}}>
                <label> Company Name: </label>
                <input type="text" onChange={(event) => setCompanyProperties( (prev) => ({...prev, name: event.target.value}) )}/>
                <br /> <br />

                <label> Yearly Revenue: </label>
                <input type="number" onChange={(event) => setCompanyProperties( (prev) => ({...prev, revenue: Number(event.target.value)}) )}/>
                <br /> <br />

                <label> Yearly Expenses: </label>
                <input type="number" onChange={(event) => setCompanyProperties( (prev) => ({...prev, expenses: Number(event.target.value)}) )}/>
                <br /> <br />

                <button onClick={() => spawnGraph(companyProperties.name, companyProperties.revenue, companyProperties.expenses)} style={{padding: '10px 20px'}}> Spawn Sphere </button>
                <button onClick={() => drawLine()} style={{padding: '10px 20px'}}> Spawn Line </button>
            </div>
 
            {/* the main canvas */}
            <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
                <ambientLight intensity={5} />
                <pointLight position={[0, 0, 0]} intensity={550} />

                {/* <Sphere geometry={[0.5, 8, 8]} /> */}
                {/* <Sphere position={[10, 0, 0]} /> */}

                {/* <mesh position={[0, 0, 0]}> */}
                {/*     <sphereGeometry args={[0.25, 16, 16]} /> */}
                {/*     <meshStandardMaterial color="#fff" /> */}
                {/* </mesh> */}
                {/**/}
                {/* <mesh position={[0, 5, 0]}> */}
                {/*     <cylinderGeometry args={[0.5, 0.5, 6, 32]} /> */}
                {/*     <meshStandardMaterial color="#543958" /> */}
                {/* </mesh> */}

                {/* <DragControls onDragStart={() => setDragging((true))} onDragEnd={() => setDragging((false))}> */}
                    {/* <mesh position={[0, 10, 0]}> */}
                    {/*     <sphereGeometry args={[2, 16, 16]} /> */}
                    {/*     <meshStandardMaterial color="#670043" /> */}
                    {/* </mesh> */}
                    {/**/}
                    {/* <Text fontSize={5}> Hello World </Text> */}
                {/* </DragControls> */}

                {/* the sphere properties will be mapped to the canvas (generator) */}
                { rootNodesProperties.map((nodeProperties, id) => (
                        <DragControls
                            key={id}
                            onDragStart={() => setDragging((true))}
                            onDragEnd={() => setDragging((false))}
                            onDrag={(matrix) => {
                                updateChildNodes(matrix, nodeProperties);
                            }}
                        >
                            <group position={nodeProperties.position}>
                                <Node {...nodeProperties} />
                                <Billboard>
                                    <Text position={[0, 3.5, 0]} fontSize={2} anchorX="center" anchorY="middle">
                                        {nodeProperties.label}
                                    </Text>
                                </Billboard>

                            </group>
                        </DragControls>
                    ))
                }

                { leafNodesProperties.map( (nodeProperties, id) => (
                    <DragControls
                        key={id}
                        onDragStart={() => setDragging((true))}
                        onDragEnd={() => setDragging((false))}
                        // onDrag={(matrix) => updateChildNodes(matrix, nodeProperties)}
                    >
                        <mesh position={nodeProperties.position} ref={(elem) => (leafNodePosRefs.current[nodeProperties.id] = elem)}>
                            <mesh onPointerEnter={() => setDragging(true)} onPointerLeave={() => setDragging(false)}>
                                <sphereGeometry args={nodeProperties.geometry} />
                                <meshStandardMaterial color="#543958" />
                            </mesh>
                            <Billboard>
                                <Text position={[0, 3.5, 0]} fontSize={2} anchorX="center" anchorY="middle">
                                    {nodeProperties.label}
                                </Text>
                            </Billboard>
                        </mesh>
                    </DragControls>
                    ))
                }

                { lines.map( (lineProp, i) => (
                        <DragControls key={i} onDragStart={() => setDragging((true))} onDragEnd={() => setDragging((false))}>
                                <Line {...lineProp} />
                        </DragControls>
                    )
                )}

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

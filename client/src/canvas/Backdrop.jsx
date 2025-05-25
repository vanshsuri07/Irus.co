import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";
import React, { useRef } from "react";

const Backdrop = () => {
  const shadows = useRef();
  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scae={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight
        amount={2}
        radius={1.2}
        intensity={1}
        ambient={0.1}
        position={[-1.5, 1.2, 0]} // LEFT side of T-shirt
      />

      <RandomizedLight
        amount={2}
        radius={1.2}
        intensity={1}
        ambient={0.1}
        position={[1.5, 1.2, 0]} // RIGHT side of T-shirt
      />
    </AccumulativeShadows>
  );
};

export default Backdrop;

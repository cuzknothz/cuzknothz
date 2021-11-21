import { Cloud } from '@/components/3D/Cloud';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { NextPage } from 'next';
import Head from 'next/head';
import React, { Suspense, useRef, useEffect } from 'react';
import { Provider, ReactReduxContext } from 'react-redux';
import OverLay from '../components/OverLay';
const HomePage: NextPage = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const onResize = () => {
    if (canvas.current) {
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
    }
  };
  useEffect(() => {
    window.addEventListener('resize', onResize);
  }, []);
  return (
    <>
      <Head>
        <title>Cuzknothz 🧊</title>
      </Head>
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <>
            <Canvas
              ref={canvas}
              // orthographic
              // gl={{ alpha: false }}
              camera={{ zoom: 100, position: [0, 0, 100] }}
              // frameloop="demand"
            >
              <Provider store={store}>
                <Suspense fallback={null}>
                  <Cloud />
                  {/* <Scene /> */}
                  {/* <Cuzknothz /> */}
                </Suspense>
                <OrbitControls />
              </Provider>
            </Canvas>
            <OverLay />
          </>
        )}
      </ReactReduxContext.Consumer>
    </>
  );
};

export default HomePage;

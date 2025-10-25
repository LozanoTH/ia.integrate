  const { useState, useEffect, useRef } = React;

        const WebGLCity = () => {
          const mountRef = useRef(null);
          const [stats, setStats] = useState({ fps: 0, objects: 0 });
          const [autoRotate, setAutoRotate] = useState(true);

          useEffect(() => {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e);
            scene.fog = new THREE.Fog(0x1a1a2e, 50, 300);

            const camera = new THREE.PerspectiveCamera(
              60,
              window.innerWidth / window.innerHeight,
              1,
              500
            );
            camera.position.set(100, 60, 100);

            const renderer = new THREE.WebGLRenderer({ 
              antialias: false,
              powerPreference: "high-performance"
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.BasicShadowMap;
            mountRef.current.appendChild(renderer.domElement);

            // Ocultar loading
            document.getElementById('loading').style.display = 'none';

            // Iluminación
            const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0x8888ff, 0.8);
            dirLight.position.set(80, 120, 50);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            dirLight.shadow.camera.left = -150;
            dirLight.shadow.camera.right = 150;
            dirLight.shadow.camera.top = 150;
            dirLight.shadow.camera.bottom = -150;
            scene.add(dirLight);

            // Suelo más grande
            const groundGeo = new THREE.PlaneGeometry(600, 600);
            const groundMat = new THREE.MeshLambertMaterial({ color: 0x0a0a15 });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

            // Materiales
            const buildingMats = [
              new THREE.MeshLambertMaterial({ color: 0x404050 }),
              new THREE.MeshLambertMaterial({ color: 0x383848 }),
              new THREE.MeshLambertMaterial({ color: 0x505060 }),
            ];

            const windowLitMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa });
            const windowDarkMat = new THREE.MeshBasicMaterial({ color: 0x001122 });
            const roadMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

            const windowGeo = new THREE.PlaneGeometry(0.8, 1.2);
            
            let objectCount = 0;

            // Crear edificio
            const createBuilding = (x, z) => {
              const width = 8 + Math.random() * 8;
              const depth = 8 + Math.random() * 8;
              const height = 15 + Math.random() * 40;

              const buildingGeo = new THREE.BoxGeometry(width, height, depth);
              const mat = buildingMats[Math.floor(Math.random() * buildingMats.length)];
              const building = new THREE.Mesh(buildingGeo, mat);
              
              building.position.set(x, height / 2, z);
              building.castShadow = true;
              building.receiveShadow = true;
              scene.add(building);
              objectCount++;

              const floors = Math.floor(height / 4);
              const windowsPerRowWidth = Math.floor(width / 2.5);
              const windowsPerRowDepth = Math.floor(depth / 2.5);
              
              for (let floor = 0; floor < floors; floor += 2) {
                // Cara frontal
                for (let col = 0; col < windowsPerRowWidth; col++) {
                  const isLit = Math.random() > 0.4;
                  const windowMat = isLit ? windowLitMat : windowDarkMat;
                  
                  const window1 = new THREE.Mesh(windowGeo, windowMat);
                  window1.position.set(
                    x - width / 2 + 2 + col * 2.5,
                    4 + floor * 4,
                    z + depth / 2 + 0.1
                  );
                  scene.add(window1);
                  objectCount++;
                }
                
                // Cara trasera
                for (let col = 0; col < windowsPerRowWidth; col++) {
                  const isLit = Math.random() > 0.4;
                  const windowMat = isLit ? windowLitMat : windowDarkMat;
                  
                  const window2 = new THREE.Mesh(windowGeo, windowMat);
                  window2.position.set(
                    x - width / 2 + 2 + col * 2.5,
                    4 + floor * 4,
                    z - depth / 2 - 0.1
                  );
                  window2.rotation.y = Math.PI;
                  scene.add(window2);
                  objectCount++;
                }
                
                // Cara derecha
                for (let col = 0; col < windowsPerRowDepth; col++) {
                  const isLit = Math.random() > 0.4;
                  const windowMat = isLit ? windowLitMat : windowDarkMat;
                  
                  const window3 = new THREE.Mesh(windowGeo, windowMat);
                  window3.position.set(
                    x + width / 2 + 0.1,
                    4 + floor * 4,
                    z - depth / 2 + 2 + col * 2.5
                  );
                  window3.rotation.y = Math.PI / 2;
                  scene.add(window3);
                  objectCount++;
                }
                
                // Cara izquierda
                for (let col = 0; col < windowsPerRowDepth; col++) {
                  const isLit = Math.random() > 0.4;
                  const windowMat = isLit ? windowLitMat : windowDarkMat;
                  
                  const window4 = new THREE.Mesh(windowGeo, windowMat);
                  window4.position.set(
                    x - width / 2 - 0.1,
                    4 + floor * 4,
                    z - depth / 2 + 2 + col * 2.5
                  );
                  window4.rotation.y = -Math.PI / 2;
                  scene.add(window4);
                  objectCount++;
                }
              }

              return { width, depth };
            };

            // Crear carretera
            const createRoad = (x, z, width, depth, isVertical = false) => {
              const roadGeo = new THREE.PlaneGeometry(width, depth);
              const road = new THREE.Mesh(roadGeo, roadMat);
              road.rotation.x = -Math.PI / 2;
              road.position.set(x, 0.02, z);
              scene.add(road);
              objectCount++;

              const lineGeo = new THREE.PlaneGeometry(
                isVertical ? 0.3 : width,
                isVertical ? depth : 0.3
              );
              const line = new THREE.Mesh(lineGeo, lineMat);
              line.rotation.x = -Math.PI / 2;
              line.position.set(x, 0.03, z);
              scene.add(line);
              objectCount++;
            };

            // Generar ciudad más grande
            const roadSpacing = 35;
            
            // Red de carreteras expandida
            for (let i = -4; i <= 4; i++) {
              createRoad(i * roadSpacing, 0, 8, 350, true);
              createRoad(0, i * roadSpacing, 350, 8, false);
            }

            // Más edificios
            for (let bx = -4; bx < 4; bx++) {
              for (let bz = -4; bz < 4; bz++) {
                const blockX = bx * roadSpacing;
                const blockZ = bz * roadSpacing;
                
                const buildingsInBlock = 1 + Math.floor(Math.random() * 2);
                for (let i = 0; i < buildingsInBlock; i++) {
                  const offsetX = (Math.random() - 0.5) * 15;
                  const offsetZ = (Math.random() - 0.5) * 15;
                  createBuilding(blockX + offsetX, blockZ + offsetZ);
                }
              }
            }

            // CARROS EN MOVIMIENTO
            const cars = [];
            const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff];
            
            const createCar = (x, z, direction) => {
              const carGroup = new THREE.Group();
              
              // Cuerpo del carro
              const bodyGeo = new THREE.BoxGeometry(2, 1, 4);
              const bodyMat = new THREE.MeshLambertMaterial({ 
                color: carColors[Math.floor(Math.random() * carColors.length)] 
              });
              const body = new THREE.Mesh(bodyGeo, bodyMat);
              body.position.y = 0.5;
              body.castShadow = true;
              carGroup.add(body);
              
              // Cabina
              const cabinGeo = new THREE.BoxGeometry(1.8, 0.8, 2);
              const cabinMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
              const cabin = new THREE.Mesh(cabinGeo, cabinMat);
              cabin.position.set(0, 1.2, -0.5);
              carGroup.add(cabin);
              
              // Faros
              const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
              const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
              const light1 = new THREE.Mesh(lightGeo, lightMat);
              light1.position.set(0.6, 0.5, 2.1);
              carGroup.add(light1);
              const light2 = new THREE.Mesh(lightGeo, lightMat);
              light2.position.set(-0.6, 0.5, 2.1);
              carGroup.add(light2);
              
              carGroup.position.set(x, 0.5, z);
              
              if (direction === 'horizontal') {
                carGroup.rotation.y = Math.PI / 2;
              }
              
              scene.add(carGroup);
              objectCount += 4;
              
              return {
                mesh: carGroup,
                direction: direction,
                speed: 0.15 + Math.random() * 0.1,
                lane: z
              };
            };

            // Crear carros en diferentes calles
            for (let i = 0; i < 12; i++) {
              const lane = (Math.floor(Math.random() * 9) - 4) * roadSpacing;
              const startPos = -150 + Math.random() * 300;
              const direction = Math.random() > 0.5 ? 'vertical' : 'horizontal';
              
              if (direction === 'vertical') {
                cars.push(createCar(lane, startPos, direction));
              } else {
                cars.push(createCar(startPos, lane, direction));
              }
            }

            // NUBES
            const clouds = [];
            const cloudMat = new THREE.MeshBasicMaterial({ 
              color: 0x666677, 
              transparent: true, 
              opacity: 0.6 
            });
            
            const createCloud = () => {
              const cloudGroup = new THREE.Group();
              
              for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
                const sphereGeo = new THREE.SphereGeometry(
                  3 + Math.random() * 4, 
                  6, 
                  6
                );
                const sphere = new THREE.Mesh(sphereGeo, cloudMat);
                sphere.position.set(
                  (Math.random() - 0.5) * 8,
                  (Math.random() - 0.5) * 2,
                  (Math.random() - 0.5) * 8
                );
                cloudGroup.add(sphere);
              }
              
              cloudGroup.position.set(
                (Math.random() - 0.5) * 400,
                60 + Math.random() * 40,
                (Math.random() - 0.5) * 400
              );
              
              scene.add(cloudGroup);
              objectCount += 5;
              
              return {
                mesh: cloudGroup,
                speed: 0.02 + Math.random() * 0.03,
                direction: Math.random() * Math.PI * 2
              };
            };

            for (let i = 0; i < 15; i++) {
              clouds.push(createCloud());
            }

            // AVIONES
            const planes = [];
            const planeMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
            
            const createPlane = () => {
              const planeGroup = new THREE.Group();
              
              // Fuselaje
              const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
              const body = new THREE.Mesh(bodyGeo, planeMat);
              body.rotation.z = Math.PI / 2;
              planeGroup.add(body);
              
              // Alas
              const wingGeo = new THREE.BoxGeometry(18, 0.3, 3);
              const wing = new THREE.Mesh(wingGeo, planeMat);
              wing.position.y = 0;
              planeGroup.add(wing);
              
              // Cola
              const tailGeo = new THREE.BoxGeometry(0.3, 3, 2);
              const tail = new THREE.Mesh(tailGeo, planeMat);
              tail.position.set(-3.5, 1, 0);
              planeGroup.add(tail);
              
              planeGroup.position.set(
                (Math.random() - 0.5) * 300,
                80 + Math.random() * 30,
                (Math.random() - 0.5) * 300
              );
              
              const angle = Math.random() * Math.PI * 2;
              planeGroup.rotation.y = angle;
              
              scene.add(planeGroup);
              objectCount += 3;
              
              return {
                mesh: planeGroup,
                speed: 0.4 + Math.random() * 0.3,
                angle: angle,
                radius: 100 + Math.random() * 50,
                centerX: planeGroup.position.x,
                centerZ: planeGroup.position.z,
                height: planeGroup.position.y
              };
            };

            for (let i = 0; i < 5; i++) {
              planes.push(createPlane());
            }

            // Variables de control
            let time = 0;
            let cameraAngle = 0;
            let cameraRadius = 120;
            let cameraHeight = 60;
            let targetAngle = 0;
            let targetRadius = 120;
            let targetHeight = 60;
            let isDragging = false;
            let previousTouch = { x: 0, y: 0 };
            let autoRotateActive = true;

            // Controles
            const onPointerDown = (e) => {
              isDragging = true;
              autoRotateActive = false;
              setAutoRotate(false);
              const x = e.touches ? e.touches[0].clientX : e.clientX;
              const y = e.touches ? e.touches[0].clientY : e.clientY;
              previousTouch = { x, y };
            };

            const onPointerMove = (e) => {
              if (!isDragging) return;
              e.preventDefault();
              
              const x = e.touches ? e.touches[0].clientX : e.clientX;
              const y = e.touches ? e.touches[0].clientY : e.clientY;
              
              const deltaX = x - previousTouch.x;
              const deltaY = y - previousTouch.y;
              
              targetAngle += deltaX * 0.01;
              targetHeight = Math.max(20, Math.min(120, targetHeight - deltaY * 0.2));
              
              previousTouch = { x, y };
            };

            const onPointerUp = () => {
              isDragging = false;
            };

            const onWheel = (e) => {
              e.preventDefault();
              targetRadius = Math.max(50, Math.min(200, targetRadius + e.deltaY * 0.05));
            };

            let lastPinchDistance = 0;
            const onTouchMove = (e) => {
              if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                  touch2.clientX - touch1.clientX,
                  touch2.clientY - touch1.clientY
                );
                
                if (lastPinchDistance > 0) {
                  const delta = lastPinchDistance - distance;
                  targetRadius = Math.max(50, Math.min(200, targetRadius + delta * 0.1));
                }
                lastPinchDistance = distance;
              } else {
                onPointerMove(e);
              }
            };

            const onTouchEnd = () => {
              lastPinchDistance = 0;
              onPointerUp();
            };

            const canvas = renderer.domElement;
            canvas.addEventListener('mousedown', onPointerDown);
            canvas.addEventListener('mousemove', onPointerMove);
            canvas.addEventListener('mouseup', onPointerUp);
            canvas.addEventListener('touchstart', onPointerDown);
            canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            canvas.addEventListener('touchend', onTouchEnd);
            canvas.addEventListener('wheel', onWheel, { passive: false });

            let frameCount = 0;
            let lastTime = performance.now();
            let fps = 60;

            const animate = () => {
              requestAnimationFrame(animate);
              frameCount++;

              const currentTime = performance.now();
              if (currentTime >= lastTime + 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                setStats({ fps, objects: objectCount });
              }

              if (autoRotateActive) {
                time += 0.0008;
                targetAngle = time;
              }

              cameraAngle += (targetAngle - cameraAngle) * 0.1;
              cameraRadius += (targetRadius - cameraRadius) * 0.1;
              cameraHeight += (targetHeight - cameraHeight) * 0.1;

              camera.position.x = Math.cos(cameraAngle) * cameraRadius;
              camera.position.z = Math.sin(cameraAngle) * cameraRadius;
              camera.position.y = cameraHeight + (autoRotateActive ? Math.sin(time * 1.5) * 8 : 0);
              camera.lookAt(0, 15, 0);

              // Animar carros
              cars.forEach(car => {
                if (car.direction === 'vertical') {
                  car.mesh.position.z += car.speed;
                  if (car.mesh.position.z > 180) car.mesh.position.z = -180;
                } else {
                  car.mesh.position.x += car.speed;
                  if (car.mesh.position.x > 180) car.mesh.position.x = -180;
                }
              });

              // Animar nubes
              clouds.forEach(cloud => {
                cloud.mesh.position.x += Math.cos(cloud.direction) * cloud.speed;
                cloud.mesh.position.z += Math.sin(cloud.direction) * cloud.speed;
                
                if (Math.abs(cloud.mesh.position.x) > 250) {
                  cloud.mesh.position.x = -cloud.mesh.position.x;
                }
                if (Math.abs(cloud.mesh.position.z) > 250) {
                  cloud.mesh.position.z = -cloud.mesh.position.z;
                }
              });

              // Animar aviones (vuelo circular)
              planes.forEach(plane => {
                plane.angle += plane.speed * 0.01;
                plane.mesh.position.x = plane.centerX + Math.cos(plane.angle) * plane.radius;
                plane.mesh.position.z = plane.centerZ + Math.sin(plane.angle) * plane.radius;
                plane.mesh.rotation.y = plane.angle + Math.PI / 2;
              });

              renderer.render(scene, camera);
            };

            animate();

            const handleResize = () => {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            return () => {
              window.removeEventListener('resize', handleResize);
              canvas.removeEventListener('mousedown', onPointerDown);
              canvas.removeEventListener('mousemove', onPointerMove);
              canvas.removeEventListener('mouseup', onPointerUp);
              canvas.removeEventListener('touchstart', onPointerDown);
              canvas.removeEventListener('touchmove', onTouchMove);
              canvas.removeEventListener('touchend', onTouchEnd);
              canvas.removeEventListener('wheel', onWheel);
              
              mountRef.current?.removeChild(renderer.domElement);
              
              scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                  if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                  } else {
                    object.material.dispose();
                  }
                }
              });
              
              renderer.dispose();
            };
          }, []);

          const toggleAutoRotate = () => {
            setAutoRotate(!autoRotate);
          };

          return React.createElement('div', { 
            style: { width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }
          },
            React.createElement('div', { ref: mountRef }),
            React.createElement('button', {
              onClick: toggleAutoRotate,
              style: {
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 24px',
                background: autoRotate ? 'rgba(0,255,0,0.2)' : 'rgba(100,100,100,0.2)',
                color: autoRotate ? '#00ff00' : '#fff',
                border: autoRotate ? '2px solid #00ff00' : '2px solid #666',
                borderRadius: '25px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }
            }, autoRotate ? '⏸ Pausa' : '▶ Auto')
          );
        };

        ReactDOM.render(React.createElement(WebGLCity), document.getElementById('root'));
    
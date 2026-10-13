import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/** Altura da onda em (x, z) no instante t. Soma de senoides: crista, curvatura e ondulacao lenta. */
function alturaOnda(x: number, z: number, t: number): number {
  return (
    0.85 * Math.sin(0.55 * x - 1.1 * t + 0.25 * z) +
    0.35 * Math.sin(1.25 * x - 1.9 * t + 0.6 * z + 1.3) +
    0.18 * Math.sin(2.4 * x - 2.8 * t - 0.9 * z)
  );
}

/** Surfista em pe sobre a prancha, montado com formas simples (sem modelos externos). */
function criarSurfista(): THREE.Group {
  const grupo = new THREE.Group();

  const prancha = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35 }),
  );
  prancha.scale.set(1.25, 0.035, 0.36);
  grupo.add(prancha);

  // Faixa colorida na prancha
  const faixa = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 8),
    new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.4 }),
  );
  faixa.scale.set(1.26, 0.036, 0.07);
  faixa.position.z = 0.0;
  grupo.add(faixa);

  const corpo = new THREE.Group();
  corpo.position.y = 0.05;
  grupo.add(corpo);

  const roupa = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.55 });
  const short = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.55 });
  const pele = new THREE.MeshStandardMaterial({ color: '#d6a27a', roughness: 0.6 });

  // Pernas levemente flexionadas
  for (const lado of [-1, 1]) {
    const perna = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 6, 12), short);
    perna.position.set(0.02, 0.22, lado * 0.12);
    perna.rotation.x = lado * 0.18;
    corpo.add(perna);
  }

  // Tronco
  const tronco = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.36, 8, 16), roupa);
  tronco.position.set(0.02, 0.62, 0);
  corpo.add(tronco);

  // Cabeca
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), pele);
  cabeca.position.set(0.04, 1.04, 0);
  corpo.add(cabeca);

  // Bracos abertos para equilibrio
  for (const lado of [-1, 1]) {
    const braco = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.5, 6, 10), roupa);
    braco.position.set(0.02, 0.86, lado * 0.32);
    braco.rotation.x = lado * 0.7;
    braco.rotation.z = -0.25;
    corpo.add(braco);
  }

  return grupo;
}

/** Cena 3D: mar com onda, surfista e sol. O scroll da pagina controla a animacao. */
export const SurfScene: React.FC<{ progressoRef: React.MutableRefObject<number> }> = ({ progressoRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [semWebGL, setSemWebGL] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setSemWebGL(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const cena = new THREE.Scene();
    cena.fog = new THREE.Fog(0x0b1d27, 9, 22);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    // Luz: sol quente vindo de tras, luz fria do ceu
    cena.add(new THREE.HemisphereLight(0x8fd3ff, 0x0b3d4d, 1.0));
    const sol = new THREE.DirectionalLight(0xffd9a0, 1.8);
    sol.position.set(-4, 6, -5);
    cena.add(sol);

    // Disco do sol ao fundo
    const disco = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 48),
      new THREE.MeshBasicMaterial({ color: 0xfde68a }),
    );
    disco.position.set(-2.5, 3.2, -14);
    cena.add(disco);

    // Malha da onda
    const SEG = 110;
    const geometria = new THREE.PlaneGeometry(22, 22, SEG, SEG);
    geometria.rotateX(-Math.PI / 2);
    const cores = new Float32Array(geometria.attributes.position.count * 3);
    geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    const agua = new THREE.Mesh(
      geometria,
      new THREE.MeshStandardMaterial({ vertexColors: true, color: 0x9fd3e6, roughness: 0.3, metalness: 0 }),
    );
    cena.add(agua);

    const surfista = criarSurfista();
    surfista.scale.setScalar(1.45);
    cena.add(surfista);

    const corFundo = new THREE.Color('0b5f78');
    const corCrista = new THREE.Color('#6fd6ea');
    const corTemp = new THREE.Color();

    const redimensionar = () => {
      const largura = container.clientWidth;
      const altura = container.clientHeight;
      renderer.setSize(largura, altura, false);
      camera.aspect = largura / Math.max(altura, 1);
      camera.updateProjectionMatrix();
    };
    redimensionar();
    window.addEventListener('resize', redimensionar);

    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = 0;
    let suavizado = progressoRef.current;
    let frame = 0;
    let rodando = true;

    const desenhar = () => {
      if (!rodando) return;
      const dt = reduzirMovimento ? 0 : 0.016;
      t += dt;
      // Suaviza o scroll para o movimento nao ficar "saltado"
      suavizado += (progressoRef.current - suavizado) * 0.08;
      const p = suavizado;

      // Onda: aparece e vai ficando mais alta conforme rola
      const posicoes = geometria.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posicoes.count; i++) {
        const x = posicoes.getX(i);
        const z = posicoes.getZ(i);
        const h = alturaOnda(x, z, t) * (0.7 + 0.6 * p);
        posicoes.setY(i, h);
        const k = THREE.MathUtils.clamp((h + 1.1) / 2.2, 0, 1);
        corTemp.lerpColors(corFundo, corCrista, k * k);
        cores[i * 3] = corTemp.r;
        cores[i * 3 + 1] = corTemp.g;
        cores[i * 3 + 2] = corTemp.b;
      }
      posicoes.needsUpdate = true;
      geometria.attributes.color.needsUpdate = true;
      geometria.computeVertexNormals();

      // Surfista: percorre a onda enquanto a pagina rola e acompanha a inclinacao
      // Em telas estreitas o surfista percorre menos distancia, para continuar visivel
      const amplitude = Math.max(1.4, Math.min(3.2, camera.aspect * 2.2));
      const x = THREE.MathUtils.lerp(-amplitude, amplitude, p);
      const escala = 0.7 + 0.6 * p;
      // A prancha tem ~1,8 de meia-extensao: apoia nas duas pontas e acompanha a inclinacao
      const alturaTraseira = alturaOnda(x - 1.8, 0, t) * escala;
      const alturaFrente = alturaOnda(x + 1.8, 0, t) * escala;
      // Apoia a prancha acima do ponto mais alto da onda sob ela, para a agua nao cobri-la
      const alturaMeio = alturaOnda(x, 0, t) * escala;
      const apoio = Math.max(alturaTraseira, alturaFrente, alturaMeio) + 0.06;
      surfista.position.set(x, apoio, 0);
      surfista.rotation.set(0, -0.25, Math.atan2(alturaFrente - alturaTraseira, 3.6));
      surfista.rotation.z += Math.sin(t * 2.2) * 0.04;

      // Camera: sobe e recua um pouco ao rolar, mostrando mais o mar
      // Em telas em pe a camera recua, para a cena caber inteira
      const recuo = camera.aspect < 1 ? 3.5 : 0;
      camera.position.set(0, 2.4 + p * 0.9, 7.2 + p * 1.2 + recuo);
      camera.lookAt(0, 0.5, 0);

      renderer.render(cena, camera);
      frame = requestAnimationFrame(desenhar);
    };
    frame = requestAnimationFrame(desenhar);

    return () => {
      rodando = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', redimensionar);
      geometria.dispose();
      agua.material instanceof THREE.Material && agua.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressoRef]);

  if (semWebGL) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f4c5c] via-[#0b2a36] to-[#0c0e13]" aria-hidden="true" />
    );
  }

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
};

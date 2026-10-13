import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  analyzeCanvasImage,
  findSimilarProducts,
  VisualAnalysisResult,
  VisualMatchResult
} from '../../utils/visualSearch';
import { ProductCategory, Product } from '../../types';
import {
  Camera,
  X,
  Upload,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Eye,
  Scale,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

// Exemplos rápidos para teste imediato
const PRESET_DEMO_SAMPLES = [
  {
    title: 'Camisa Azul Marinho',
    category: 'times' as ProductCategory,
    hex: '#1e3a8a',
    image: '/src/assets/images/football_jersey_blue_white_1791857253245.jpg'
  },
  {
    title: 'Camisa Rosa Choque',
    category: 'times' as ProductCategory,
    hex: '#ec4899',
    image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg'
  },
  {
    title: 'Polo Preta com Ouro',
    category: 'polo' as ProductCategory,
    hex: '#18181b',
    image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg'
  },
  {
    title: 'Bermuda Dry Fit Grafite',
    category: 'bermuda' as ProductCategory,
    hex: '#27272a',
    image: '/src/assets/images/bermuda_shorts_dark_grey_1791857254714.jpg'
  }
];

export const VisualSearchModal: React.FC = () => {
  const {
    isVisualSearchOpen,
    setIsVisualSearchOpen,
    products,
    setSelectedProduct,
    addToCart,
    isProductInComparison,
    toggleProductComparison,
    addToast
  } = useStore();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VisualAnalysisResult | null>(null);
  const [matches, setMatches] = useState<VisualMatchResult[]>([]);
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'todas'>('todas');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Iniciar câmera do dispositivo
  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Seu navegador não suporta acesso direto à câmera. Use o upload de foto abaixo.');
      return;
    }

    try {
      // Para stream existente se houver
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Erro ao acessar câmera:', err);
      setCameraError('Permissão para câmera negada ou dispositivo indisponível. Você pode carregar uma foto da galeria.');
      setCameraActive(false);
    }
  }, [facingMode]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Monitora abertura e fechamento do modal
  useEffect(() => {
    if (isVisualSearchOpen) {
      // Inicia a câmera automaticamente se não houver foto capturada
      if (!capturedImageUri) {
        startCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isVisualSearchOpen, startCamera, stopCamera, capturedImageUri]);

  // Alternar entre câmera frontal e traseira
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Processa a imagem carregada ou desenhada no canvas
  const processImageFromCanvas = (canvas: HTMLCanvasElement, imageUri: string) => {
    setIsAnalyzing(true);
    setCapturedImageUri(imageUri);
    stopCamera();

    setTimeout(() => {
      try {
        const analysis = analyzeCanvasImage(canvas);
        setAnalysisResult(analysis);

        const foundMatches = findSimilarProducts(analysis, products, filterCategory);
        setMatches(foundMatches);

        addToast(
          '🔍 Análise Visual Concluída',
          `Tom predominante: ${analysis.colorFamilyLabel}. Encontramos ${foundMatches.length} peças semelhantes.`,
          'success'
        );
      } catch (err) {
        console.error('Falha na análise visual:', err);
        addToast('Erro na análise', 'Não foi possível processar a imagem fornecida.', 'error');
      } finally {
        setIsAnalyzing(false);
      }
    }, 450);
  };

  // Capturar frame da câmera
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/jpeg', 0.88);
    processImageFromCanvas(canvas, dataUri);
  };

  // Fazer upload de foto do celular ou computador
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const uri = event.target?.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.naturalWidth || 640;
        canvas.height = img.naturalHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          processImageFromCanvas(canvas, uri);
        }
      };
      img.src = uri;
    };
    reader.readAsDataURL(file);
  };

  // Testar com amostra rápida pré-definida
  const handleSelectSample = (sample: typeof PRESET_DEMO_SAMPLES[0]) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth || 640;
      canvas.height = img.naturalHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        processImageFromCanvas(canvas, sample.image);
      }
    };
    img.src = sample.image;
  };

  // Resetar e tirar outra foto
  const handleRetake = () => {
    setCapturedImageUri(null);
    setAnalysisResult(null);
    setMatches([]);
    startCamera();
  };

  // Atualizar filtro de categoria nos resultados
  const handleFilterChange = (cat: ProductCategory | 'todas') => {
    setFilterCategory(cat);
    if (analysisResult) {
      const updated = findSimilarProducts(analysisResult, products, cat);
      setMatches(updated);
    }
  };

  if (!isVisualSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setIsVisualSearchOpen(false)}
      />

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-3xl bg-[#12141e] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#161925] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Busca Visual por Foto & Câmera
                  </h3>
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                    IA Color Match
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Fotografe uma camisa, polo ou bermuda para encontrar peças idênticas ou similares
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVisualSearchOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
              aria-label="Fechar busca visual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            
            {/* Viewfinder or Captured Result */}
            {!capturedImageUri ? (
              <div className="space-y-4">
                {/* Live Camera Viewfinder */}
                <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center group shadow-inner">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Viewfinder Target Overlays */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                        {/* Scanning Box Reticle */}
                        <div className="relative w-56 h-64 sm:w-64 sm:h-72 border-2 border-dashed border-amber-400/70 rounded-2xl flex flex-col justify-between p-3 shadow-2xl backdrop-brightness-110">
                          {/* Corner Markers */}
                          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                          {/* Animated Scan Line */}
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-400" />
                          
                          <div className="text-center bg-black/60 backdrop-blur-sm py-1 px-2.5 rounded-lg border border-white/10 self-center">
                            <span className="text-[11px] font-semibold text-amber-300">
                              Enquadre a roupa aqui
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Camera Control overlay */}
                      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10 px-4">
                        {/* Toggle Front/Back Camera */}
                        <button
                          type="button"
                          onClick={handleToggleFacingMode}
                          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition-all"
                          title="Alternar câmera frontal/traseira"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>

                        {/* Shutter Capture Button */}
                        <button
                          type="button"
                          onClick={handleCapturePhoto}
                          className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 p-1.5 shadow-xl shadow-amber-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                          title="Tirar foto para buscar"
                        >
                          <div className="w-full h-full rounded-full border-2 border-black flex items-center justify-center">
                            <Camera className="w-6 h-6 text-black" />
                          </div>
                        </button>

                        {/* Upload Alternative */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition-all"
                          title="Enviar foto da galeria"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Fallback when camera is not ready or blocked */
                    <div className="text-center p-6 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {cameraError ? 'Acesso à câmera bloqueado' : 'Pronto para fotografar'}
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        {cameraError || 'Permita o acesso à câmera no seu dispositivo ou selecione uma imagem da galeria.'}
                      </p>
                      
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Tentar Abrir Câmera
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Carregar Foto da Galeria
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Amostras Rápidas de Demonstração */}
                <div className="bg-[#151824] rounded-2xl p-4 border border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Ou teste com uma foto modelo:
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Clique para processar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_DEMO_SAMPLES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="flex items-center gap-2.5 p-2 bg-[#1b1f2e] hover:bg-[#22273b] border border-zinc-800 hover:border-amber-500/50 rounded-xl transition-all text-left group"
                      >
                        <img
                          src={sample.image}
                          alt={sample.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-black shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                            {sample.title}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: sample.hex }}
                            />
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {sample.hex}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Results View: Analyzed Photo + Matched Products */
              <div className="space-y-6">
                
                {/* Visual Analysis Diagnosis Card */}
                <div className="bg-[#151826] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  
                  <div className="flex items-center gap-4">
                    {/* Thumbnail of Captured Photo */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-zinc-700/80 shrink-0 bg-black shadow-lg">
                      <img
                        src={capturedImageUri}
                        alt="Foto capturada"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                        Sua foto
                      </div>
                    </div>

                    {/* Extracted Color & Shape Diagnostics */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          Diagnóstico Visual da Peça:
                        </span>
                        {analysisResult && (
                          <span className="text-[11px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            {analysisResult.confidence}% precisão
                          </span>
                        )}
                      </div>

                      {analysisResult ? (
                        <div className="space-y-1 text-xs text-zinc-300">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>Tom Predominante:</span>
                            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">
                              <span
                                className="w-3.5 h-3.5 rounded-md shadow-sm border border-white/20"
                                style={{ backgroundColor: analysisResult.primaryHex }}
                              />
                              <strong className="text-white">
                                {analysisResult.colorFamilyLabel}
                              </strong>
                              <span className="text-zinc-500 font-mono text-[10px]">
                                ({analysisResult.primaryHex})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-0.5">
                            <span>Corte sugerido:</span>
                            <strong className="text-zinc-200 capitalize">
                              {analysisResult.suggestedCategory === 'times'
                                ? 'Camisa de Time / Esportiva'
                                : analysisResult.suggestedCategory === 'polo'
                                ? 'Camisa Polo / Casual'
                                : analysisResult.suggestedCategory === 'bermuda'
                                ? 'Bermuda / Treino'
                                : 'Camisa Regata'}
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">Processando características visuais...</p>
                      )}
                    </div>
                  </div>

                  {/* Retake Button */}
                  <button
                    onClick={handleRetake}
                    className="self-stretch sm:self-center px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tirar Nova Foto
                  </button>
                </div>

                {/* Category Refinement Chips */}
                <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Refinar categoria:
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'todas' as const, label: 'Todas as Peças' },
                      { id: 'times' as const, label: 'Camisas de Times' },
                      { id: 'polo' as const, label: 'Polos' },
                      { id: 'bermuda' as const, label: 'Bermudas' },
                      { id: 'regata' as const, label: 'Regatas' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleFilterChange(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          filterCategory === tab.id
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analysis State Loading */}
                {isAnalyzing ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin mx-auto" />
                    <h4 className="text-sm font-bold text-white">Analisando Cores & Texturas...</h4>
                    <p className="text-xs text-zinc-400">Cruzando a peça com o estoque da Henrique Multimarcas.</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-12 space-y-2 bg-[#151824] rounded-2xl border border-zinc-800 p-6">
                    <AlertCircle className="w-10 h-10 mx-auto text-zinc-500 mb-2" />
                    <h4 className="text-sm font-bold text-white">Nenhuma peça encontrada nessa categoria</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Selecione "Todas as Peças" ou tire outra foto com iluminação mais clara.
                    </p>
                  </div>
                ) : (
                  /* Matched Products Grid */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        Resultados encontrados: <strong className="text-white">{matches.length}</strong> produtos
                      </span>
                      <span className="text-[11px] text-amber-400">
                        Ordenados por proximidade de cor & estilo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {matches.map((item) => {
                        const { product, similarityScore, matchedColor, matchReasons } = item;
                        const inComparison = isProductInComparison(product.id);
                        const effectivePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;

                        return (
                          <div
                            key={product.id}
                            className="bg-[#171a28] hover:bg-[#1b1f30] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-3.5 flex gap-3.5 transition-all group relative"
                          >
                            {/* Product Image */}
                            <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-800">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Similarity Badge */}
                              <div className="absolute top-1 left-1 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-black text-amber-400 border border-amber-400/30">
                                {similarityScore}% match
                              </div>
                            </div>

                            {/* Product Info & Actions */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                                    {product.name}
                                  </h4>
                                </div>

                                {/* Matched Color Swatch */}
                                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-300">
                                  <span
                                    className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                    style={{ backgroundColor: matchedColor.hex }}
                                  />
                                  <span className="truncate">
                                    Cor: <strong className="text-white">{matchedColor.name}</strong>
                                  </span>
                                </div>

                                {/* Reason Tag */}
                                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                                  ✓ {matchReasons[0] || 'Similaridade de tonalidade'}
                                </p>
                              </div>

                              {/* Price & Action Buttons */}
                              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 mt-2">
                                <div>
                                  <span className="text-xs font-bold text-amber-400 tabular-nums">
                                    R$ {effectivePrice.toFixed(2).replace('.', ',')}
                                  </span>
                                  {product.isPromo && (
                                    <span className="block text-[9px] text-zinc-500 line-through">
                                      R$ {product.price.toFixed(2).replace('.', ',')}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Compare */}
                                  <button
                                    onClick={() => toggleProductComparison(product)}
                                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                      inComparison
                                        ? 'bg-amber-400 text-black border-amber-400'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                                    }`}
                                    title={inComparison ? 'Remover da comparação' : 'Comparar'}
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                  </button>

                                  {/* View Detail */}
                                  <button
                                    onClick={() => {
                                      setIsVisualSearchOpen(false);
                                      setSelectedProduct(product);
                                    }}
                                    className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Ver</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3.5 bg-[#141724] border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Processamento instantâneo via HTML5 Canvas & Visão Computacional.
            </span>
            <button
              onClick={() => setIsVisualSearchOpen(false)}
              className="text-zinc-400 hover:text-white font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

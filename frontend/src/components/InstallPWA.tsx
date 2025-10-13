import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verifica se já foi instalado anteriormente (localStorage)
    const wasInstalled = localStorage.getItem('pwa-installed');
    if (wasInstalled) {
      setIsInstalled(true);
      return;
    }

    // Verifica se o banner foi dispensado recentemente
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (bannerDismissed) {
      const dismissedTime = parseInt(bannerDismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Não mostra o banner se foi dispensado há menos de 7 dias
        return;
      }
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Mostra o banner após 3 segundos
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
      console.log('PWA instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostra o prompt de instalação nativo
      await deferredPrompt.prompt();

      // Espera pela escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
        setShowInstallBanner(false);
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      } else {
        console.log('Usuário recusou instalar o PWA');
        handleDismiss();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao tentar instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Não renderiza nada se o app já está instalado ou o banner não deve ser mostrado
  if (isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <>
      {/* Banner fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg animate-slideDown">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 p-2 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">
                  Instalar Lava Car Sistema
                </p>
                <p className="text-xs text-blue-100 hidden sm:block">
                  Acesso rápido direto da tela inicial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold
                         hover:bg-blue-50 transition-colors text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaçador para não sobrepor conteúdo */}
      <div className="h-16 sm:h-14" />

      {/* Botão flutuante alternativo (aparece após rolar a página) */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl
                   hover:bg-blue-700 transition-all transform hover:scale-110
                   focus:outline-none focus:ring-4 focus:ring-blue-300
                   z-40 animate-bounce"
        aria-label="Instalar aplicativo"
      >
        <Download className="w-6 h-6" />
      </button>
    </>
  );
}

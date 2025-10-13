import { useState } from 'react';
import { Car, Users, FileText } from 'lucide-react';
import { LavagemView } from './LavagemView';
import ClientesView from './components/clientes/ClientesView';
import { FechamentoDiarioView } from './components/FechamentoDiarioView';
import InstallPWA from './components/InstallPWA';

type TabType = 'lavagens' | 'clientes' | 'fechamento';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('lavagens');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* PWA Install Component */}
      <InstallPWA />

      {/* NAVIGATION TABS */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('lavagens')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === 'lavagens'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Car className="h-5 w-5" />
              <span>Lavagens</span>
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === 'clientes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Clientes</span>
            </button>
            <button
              onClick={() => setActiveTab('fechamento')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === 'fechamento'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Fechamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div>
        {activeTab === 'lavagens' && <LavagemView />}
        {activeTab === 'clientes' && <ClientesView />}
        {activeTab === 'fechamento' && <FechamentoDiarioView />}
      </div>
    </div>
  );
}

export default App;

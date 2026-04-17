import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, TrendingUp, PackageSearch, Box, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- Datos de Ventas (con coordenadas) ---
const salesData = [
  { name: "Iztapalapa", value: 3492, color: "#FF4500", coords: [19.3553, -99.0622] },
  { name: "Satélite", value: 2763, color: "#FF6600", coords: [19.5106, -99.2335] },
  { name: "Ecatepec", value: 1849, color: "#FF8800", coords: [19.6097, -99.0600] },
  { name: "Tecamachalco", value: 1031, color: "#FFAA00", coords: [19.4294, -99.2393] },
  { name: "Tlalnepantla", value: 328, color: "#FFCC00", coords: [19.5408, -99.1932] },
];

const totalUnits = salesData.reduce((acc, curr) => acc + curr.value, 0);

// --- Propuestas de Bodega ---
const proposals = [
  {
    id: 1,
    title: "Vallejo",
    subtitle: "El Centro de Gravedad",
    justification: "Es el punto de equilibrio matemático. Minimiza el costo total de fletes al estar a la misma distancia promedio de los dos hubs principales (Iztapalapa y Satélite). Ideal para una operación centralizada de alto flujo.",
    icon: <MapPin className="text-[#FF6600]" size={20} />,
    coords: [19.4912, -99.1645]
  },
  {
    id: 2,
    title: "Iztacalco / Granjas México",
    subtitle: "Foco en el Líder",
    justification: "Prioriza la tienda #1 (Iztapalapa). Al tener el stock masivo cerca del 37% de tus ventas totales, reduces drásticamente los tiempos de entrega donde más clientes tienes.",
    icon: <TrendingUp className="text-[#FF6600]" size={20} />,
    coords: [19.3980, -99.0985]
  },
  {
    id: 3,
    title: "Vía Morelos / San Pedro Xalostoc",
    subtitle: "Eficiencia Operativa",
    justification: "Acceso estratégico para proveedores que vienen del Norte. Ofrece costos de renta de nave industrial hasta un 20% menores que en CDMX, manteniendo conectividad directa con Ecatepec y Satélite.",
    icon: <Box className="text-[#FF6600]" size={20} />,
    coords: [19.5315, -99.0712]
  },
  {
    id: 4,
    title: "Naucalpan / Alce Blanco",
    subtitle: "Corredor Poniente",
    justification: "Optimiza el servicio para el clúster de mayor poder adquisitivo (Satélite y Tecamachalco). Ideal si la estrategia es entrega inmediata y servicio premium en zona residencial.",
    icon: <PackageSearch className="text-[#FF6600]" size={20} />,
    coords: [19.4675, -99.2210]
  },
  {
    id: 5,
    title: "Tlalnepantla Centro",
    subtitle: "Conectividad Total",
    justification: "Ubicación privilegiada sobre el Periférico y Gustavo Baz. Permite una salida rápida hacia el Circuito Exterior Mexiquense para una futura expansión sin sacrificar la atención al núcleo urbano actual.",
    icon: <Building2 className="text-[#FF6600]" size={20} />,
    coords: [19.5450, -99.1850]
  },
];

const createBranchIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #000; border: 2px solid #FF6600; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 0 10px #FF6600, 0 0 20px #ea580c;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const proposalIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #FF6600; border: 2px solid #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 15px rgba(255, 102, 0, 0.8);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-4 9 4v13"/><path d="M12 21v-9"/><path d="M8 21v-9"/><path d="M16 21v-9"/></svg></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function HeatmapLayer({ data }: { data: typeof salesData }) {
  const map = useMap();
  useEffect(() => {
    const maxSales = Math.max(...data.map(d => d.value));
    const points = data.map(d => [d.coords[0], d.coords[1], d.value / maxSales]);
    
    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 45,
      blur: 35,
      maxZoom: 12,
      gradient: { 0.2: '#4ade80', 0.5: '#facc15', 0.8: '#FF6600', 1.0: '#b91c1c' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);
  
  return null;
}

export default function App() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans selection:bg-[#FF6600] selection:text-white flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-7xl mb-8 border-b border-neutral-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <span className="bg-[#FF6600] text-black p-2 rounded-lg"><Building2 size={28} /></span>
            Logística <span className="text-[#FF6600]">Daytona</span>
          </h1>
          <p className="text-neutral-400 text-lg">Abastecimiento Valle de México - Selección de Bodega Única</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 shadow-lg">
            <p className="text-sm text-neutral-500 font-medium">Unidades Totales</p>
            <p className="text-2xl font-bold text-white">{totalUnits.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 shadow-lg">
            <p className="text-sm text-neutral-500 font-medium">Sucursales</p>
            <p className="text-2xl font-bold text-[#FF6600]">5</p>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Mapa & Gráficas */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Mapa de Calor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-1 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-neutral-700 pointer-events-none">
              <h3 className="font-bold text-white">Densidad de Ventas</h3>
              <p className="text-xs text-neutral-400">Foco: Iztapalapa - Satélite</p>
            </div>
            
            <div className="h-[450px] w-full rounded-xl overflow-hidden grayscale-[40%] contrast-125 relative">
              <MapContainer 
                center={[19.45, -99.15]} 
                zoom={11} 
                className="w-full h-full bg-neutral-900 z-0"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <HeatmapLayer data={salesData} />
                
                {salesData.map((branch, idx) => (
                  <Marker key={`branch-${idx}`} position={branch.coords as [number, number]} icon={createBranchIcon()}>
                    <Popup>
                      <div className="text-center p-1 font-sans">
                        <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{branch.name}</h3>
                        <p className="text-[#FF6600] font-bold mt-1 text-xs">{branch.value.toLocaleString()} ud. vendidas</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {proposals.map((prop, idx) => (
                  <Marker key={`prop-${idx}`} position={prop.coords as [number, number]} icon={proposalIcon}>
                    <Popup>
                      <div className="p-2 font-sans w-48">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600] bg-orange-100 px-2 py-0.5 rounded-full">Propuesta {prop.id}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">{prop.title}</h3>
                        <p className="text-xs text-slate-500 italic mt-1">{prop.subtitle}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Gráfica de Participación */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-[#FF6600]" /> Contexto de Mercado
            </h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ color: '#ccc' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none md:ml-[-100px]">
                <span className="text-2xl font-bold text-slate-200">100%</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Columna Derecha: Tarjetas de Propuestas */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-4 border-b border-neutral-800 pb-2">Opciones de Ubicación</h2>
          
          <AnimatePresence>
            {proposals.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                onClick={() => setActiveCard(activeCard === prop.id ? null : prop.id)}
              >
                <div 
                  className={`cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden relative
                    ${activeCard === prop.id 
                      ? 'bg-neutral-800 border-[#FF6600] shadow-[0_0_20px_rgba(255,102,0,0.15)] ring-1 ring-[#FF6600]/50' 
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/80'
                    }
                  `}
                >
                  <div className="p-5 flex items-start gap-4 z-10 relative">
                    <div className="mt-1 bg-black/30 p-3 rounded-full border border-neutral-800 shadow-inner flex-shrink-0">
                      {prop.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-lg text-white group-hover:text-[#FF6600] leading-tight">
                          {prop.title}
                        </h4>
                        <span className="text-xs font-bold text-neutral-500 bg-neutral-950 px-2 py-1 rounded">
                          Opción {prop.id}
                        </span>
                      </div>
                      <p className="text-[#FF6600] text-sm font-medium mt-1 mb-3">
                        {prop.subtitle}
                      </p>
                      
                      {/* Efecto Acordeón para Justificación */}
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: activeCard === prop.id || activeCard === null ? "auto" : 0,
                          opacity: activeCard === prop.id || activeCard === null ? 1 : 0, 
                          marginTop: activeCard === prop.id || activeCard === null ? 8 : 0
                        }}
                        className="overflow-hidden"
                      >
                        <p className="text-neutral-400 text-sm leading-relaxed">
                          {prop.justification}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Borde de acento lateral izquierdo */}
                  <div className={`absolute top-0 left-0 w-1 h-full bg-[#FF6600] transition-opacity duration-300 ${activeCard === prop.id ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Call to action o Resumen */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1 }}
            className="mt-6 bg-[#FF6600]/10 border border-[#FF6600]/30 rounded-2xl p-6 text-center"
          >
            <CheckCircle2 className="mx-auto text-[#FF6600] mb-3" size={32} />
            <h4 className="font-bold text-white mb-2">Listo para Decisión</h4>
            <p className="text-sm text-neutral-400">Selecciona el nodo que mejor se adapte a tu estrategia de fletes e inversión inmobiliaria.</p>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}

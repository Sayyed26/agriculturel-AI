
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './common/Card';
import {
    Globe,
    TestTube,
    Tractor,
    Bot,
    LayoutGrid,
    Zap,
    Droplets,
    CloudSun,
    Target,
    Smartphone,
    Airplay
} from 'lucide-react';

const tools = [
  {
    category: 'GPS Technology & Sensors',
    items: [
      {
        title: 'GPS Technology',
        icon: <Globe size={28} className="text-blue-500" />,
        description: 'Enables precise mapping of farm fields, guiding tractors for accurate planting and spraying, and tracking crop yield data with geographic context.',
        link: '/operations',
        linkText: 'Manage Zones'
      },
      {
        title: 'Soil Sensors',
        icon: <TestTube size={28} className="text-orange-500" />,
        description: 'In-field sensors that provide real-time data on soil moisture, temperature, and nutrient levels, allowing for targeted irrigation and fertilization.',
        link: '/soil-weather',
        linkText: 'View Soil Data'
      },
    ]
  },
  {
    category: 'Automation and Robotics',
    items: [
      {
        title: 'Autonomous Tractors',
        icon: <Tractor size={28} className="text-gray-700" />,
        description: 'Self-driving tractors that use GPS and other sensors to perform tasks like plowing, planting, and tilling with high precision, operating 24/7.',
        link: '/automation',
        linkText: 'Control Automation'
      },
      {
        title: 'Agricultural Drones',
        icon: <Airplay size={28} className="text-cyan-500" />,
        description: 'UAVs equipped with cameras and sensors for crop monitoring, aerial spraying, and mapping field health from above.',
        link: '/files-gallery',
        linkText: 'See Gallery'
      },
      {
        title: 'Robotic Harvesters',
        icon: <Bot size={28} className="text-indigo-500" />,
        description: 'Automated systems designed to identify and pick ripe fruits and vegetables, reducing labor costs and improving efficiency during harvest.',
        link: '/automation',
        linkText: 'Control Automation'
      },
    ]
  },
  {
    category: 'Data Analytics and IoT',
    items: [
      {
        title: 'Farm Management Software',
        icon: <LayoutGrid size={28} className="text-primary" />,
        description: 'Centralized platforms (like this one!) that integrate data from various sources to provide insights for better decision-making and operational planning.',
        link: '/',
        linkText: 'Go to Dashboard'
      },
      {
        title: 'IoT Sensors and Devices',
        icon: <Zap size={28} className="text-yellow-500" />,
        description: 'A network of connected sensors across the farm monitoring everything from livestock health to water tank levels and equipment status.',
        link: '/automation',
        linkText: 'Control Devices'
      },
      {
        title: 'Drip Irrigation Systems',
        icon: <Droplets size={28} className="text-blue-400" />,
        description: 'Highly efficient irrigation method that delivers water directly to the plant\'s root zone, minimizing water waste through evaporation and runoff.',
        link: '/water-management',
        linkText: 'Manage Water'
      },
      {
        title: 'Weather Monitoring Stations',
        icon: <CloudSun size={28} className="text-sky-500" />,
        description: 'On-site stations that collect hyperlocal weather data, enabling more accurate forecasting and timely decisions for planting and irrigation.',
        link: '/soil-weather',
        linkText: 'View Weather'
      },
      {
        title: 'Smart Sprayers',
        icon: <Target size={28} className="text-red-500" />,
        description: 'Advanced sprayers that use computer vision to detect weeds and apply herbicides only where needed, significantly reducing chemical usage.',
        link: '/automation',
        linkText: 'Control Automation'
      },
      {
        title: 'Crop Monitoring Apps',
        icon: <Smartphone size={28} className="text-slate-600" />,
        description: 'Mobile applications that allow farmers to track crop growth, identify issues via photo analysis, and receive AI-driven advice directly in the field.',
        link: '/ai-advisor',
        linkText: 'Ask AI Advisor'
      },
    ]
  }
];

const ToolCard = ({ tool }: { tool: any }) => (
  <Card className="flex flex-col h-full">
    <div className="flex items-center space-x-4 mb-3">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg">
        {tool.icon}
      </div>
      <h3 className="text-lg font-bold text-on-surface">{tool.title}</h3>
    </div>
    <p className="text-sm text-slate-600 flex-grow">{tool.description}</p>
    <div className="mt-4">
      <Link to={tool.link} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
        {tool.linkText} &rarr;
      </Link>
    </div>
  </Card>
);

export const PrecisionAgriculture: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Precision Agriculture Tools</h1>
        <p className="mt-2 text-slate-600 max-w-3xl">
          Explore the technologies that power modern, efficient, and sustainable farming. These tools help optimize resources, increase yields, and reduce environmental impact.
        </p>
      </div>

      {tools.map((category) => (
        <section key={category.category}>
          <h2 className="text-2xl font-semibold border-b pb-2 mb-6">{category.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

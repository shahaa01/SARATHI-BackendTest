import React from 'react';
import { 
  Zap, 
  Droplet, 
  PaintBucket, 
  Scissors, 
  Utensils, 
  Car, 
  Home, 
  Flower2, 
  Hammer, 
  Brush, 
  Wrench,
  Bell,
  BellRing,
  BellOff
} from 'lucide-react';
import { FaTools, FaBroom, FaChessKing, FaCut, FaCar, FaPaintRoller, FaWrench, FaBolt, FaLeaf, FaUtensils } from 'react-icons/fa';

interface ServiceIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const serviceIconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
  'Electrician': (props) => <Zap {...props} />,
  'Plumber': (props) => <Droplet {...props} />,
  'Painter': (props) => <PaintBucket {...props} />,
  'Tailor': (props) => <Scissors {...props} />,
  'Cook': (props) => <Utensils {...props} />,
  'Driver': (props) => <Car {...props} />,
  'Maid': (props) => <Home {...props} />,
  'Gardener': (props) => <Flower2 {...props} />,
  'Carpenter': (props) => <Hammer {...props} />,
  'Beautician': (props) => <Brush {...props} />
};

export const fontAwesomeIconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
  'Electrician': (props) => <FaBolt {...props} />,
  'Plumber': (props) => <FaWrench {...props} />,
  'Painter': (props) => <FaPaintRoller {...props} />,
  'Tailor': (props) => <FaCut {...props} />,
  'Cook': (props) => <FaUtensils {...props} />,
  'Driver': (props) => <FaCar {...props} />,
  'Maid': (props) => <FaBroom {...props} />,
  'Gardener': (props) => <FaLeaf {...props} />,
  'Carpenter': (props) => <FaTools {...props} />,
  'Beautician': (props) => <FaChessKing {...props} />
};

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className, size = 24 }) => {
  const IconComponent = serviceIconMap[name] || ((props) => <Wrench {...props} />);
  
  return <IconComponent className={className} size={size} />;
};

export const getFontAwesomeIconName = (serviceName: string): string => {
  const iconMap: Record<string, string> = {
    'Electrician': 'fa-bolt',
    'Plumber': 'fa-wrench',
    'Painter': 'fa-paint-roller',
    'Tailor': 'fa-cut',
    'Cook': 'fa-utensils',
    'Driver': 'fa-car',
    'Maid': 'fa-broom',
    'Gardener': 'fa-leaf',
    'Carpenter': 'fa-hammer',
    'Beautician': 'fa-spa'
  };
  
  return iconMap[serviceName] || 'fa-tools';
};

export const NotificationIcon = {
  Bell: Bell,
  BellRing: BellRing,
  BellOff: BellOff
};

export default ServiceIcon;
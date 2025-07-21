// Tree-shaking optimization utilities
// Import only what we need from large libraries

// Lucide React - selective imports
export { 
  Power, 
  Calendar, 
  Smartphone, 
  Cpu, 
  Wifi, 
  HardDrive,
  ExternalLink,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react';

// Radix UI - selective imports to reduce bundle
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";

export {
  Button
} from "@/components/ui/button";

export {
  Card,
  CardContent
} from "@/components/ui/card";
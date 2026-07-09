export interface Brand {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  tagline: string;
}

export interface StackingCard {
  id: string;
  heading: string;
  bgColor: string; // Tailwind hex or class name
  textColor: string; // Tailwind class name
}

export interface TVBrandingConfig {
  departmentLabelFontSize: string;
  departmentLabelColor: string;
  logoText: string;
  logoFontFamily: "Outfit" | "Space Grotesk" | "Inter" | "JetBrains Mono";
  logoColor: string;
  
  tokenBgGradientFrom: string;
  tokenBgGradientTo: string;
  tokenTextColor: string;
  nameTextColor: string;
  counterCardBgFrom: string;
  counterCardBgTo: string;
  counterCardBorderColor: string;
  counterRoomTextColor: string;
  counterOperatorTextColor: string;
  upNextLabelText: string;
  upNextLabelColor: string;
  nextItemsTextColor: string;
  showSecondNextItem: boolean;

  bgPrimaryColor: string;
  showDotMatrix: boolean;
  showGridLines: boolean;
  showAmbientBlobs: boolean;
  blob1Color: string;
  blob2Color: string;
  blob3Color: string;
  showWaves: boolean;
  wave1ColorFrom: string;
  wave1ColorTo: string;
  wave2ColorFrom: string;
  wave2ColorTo: string;
  wave3ColorFrom: string;
  wave3ColorTo: string;
  wave4ColorFrom: string;
  wave4ColorTo: string;
  showFloatingBubbles: boolean;

  autoplayIntervalSeconds: number;
  ttsEnabledByDefault: boolean;
  chimeFrequencies: [number, number];
}


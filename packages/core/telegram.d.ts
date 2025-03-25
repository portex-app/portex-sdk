declare module 'telegram-web-app' {
  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        start_param?: string;
      };
      auth_date: number;
      hash: string;
    };
    platform: string;
    version: string;
    colorScheme: 'light' | 'dark';
    themeParams: {
      bg_color?: string;
      text_color?: string;
      [key: string]: string | undefined;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      isProgressVisible: boolean;
      setText(text: string): void;
      onClick(fn: () => void): void;
      offClick(fn: () => void): void;
      show(): void;
      hide(): void;
      enable(): void;
      disable(): void;
      showProgress(leaveActive: boolean): void;
      hideProgress(): void;
    };
    BackButton: {
      isVisible: boolean;
      onClick(fn: () => void): void;
      offClick(fn: () => void): void;
      show(): void;
      hide(): void;
    };
    ready(): void;
    expand(): void;
    close(): void;
    MainApp: {
      isVersionAtLeast(version: string): boolean;
    };
    sendData(data: string): void;
    sendData(data: object): void;
    enableClosingConfirmation(): void;
    disableClosingConfirmation(): void;
    isClosingConfirmationEnabled(): boolean;
  }

  const WebApp: TelegramWebApp;
  export default WebApp;
} 
declare module 'telegram-web-app' {
  interface WebAppInitData {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    receiver?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat?: {
      id: number;
      type: string;
      title: string;
      username?: string;
    };
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  }

  interface ThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  }

  interface MainButton {
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
  }

  interface BackButton {
    isVisible: boolean;
    onClick(fn: () => void): void;
    offClick(fn: () => void): void;
    show(): void;
    hide(): void;
  }

  interface HapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  }

  interface CloudStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    getKeys(): Promise<string[]>;
  }

  interface WebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: ThemeParams;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    MainButton: MainButton;
    BackButton: BackButton;
    HapticFeedback: HapticFeedback;
    CloudStorage: CloudStorage;

    ready(): void;
    expand(): void;
    close(): void;
    
    onEvent(eventType: string, eventHandler: Function): void;
    offEvent(eventType: string, eventHandler: Function): void;
    sendData(data: any): void;
    
    enableClosingConfirmation(): void;
    disableClosingConfirmation(): void;
    
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    
    switchInlineQuery(query: string, choose_chat_types?: string[]): void;
    openLink(url: string, options?: { try_instant_view?: boolean }): void;
    openTelegramLink(url: string): void;
    openInvoice(url: string, callback?: Function): void;
    
    showPopup(params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
      }>;
    }, callback?: Function): void;
    
    showAlert(message: string, callback?: Function): void;
    showConfirm(message: string, callback?: Function): void;
    
    requestWriteAccess(callback?: Function): void;
    requestContact(callback?: Function): void;
    
    showScanQrPopup(params: {
      text?: string;
    }, callback?: Function): void;
    closeScanQrPopup(): void;
    
    readTextFromClipboard(callback?: Function): void;
  }

  const WebApp: WebApp;
  export default WebApp;
} 
interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleSignInButtonConfiguration {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  locale?: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize(configuration: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      prompt(): void;
      renderButton(parent: HTMLElement, options: GoogleSignInButtonConfiguration): void;
    };
  };
}

interface Window {
  google?: GoogleIdentityServices;
}

const LocalStorageKeys = {
  JWT: "JWT",
};

export const LocalStorageService = {
  getJwt: (): string | null => {
    return localStorage.getItem(LocalStorageKeys.JWT);
  },
  setJwt: (token: string): void => {
    localStorage.setItem(LocalStorageKeys.JWT, token);
  },
};

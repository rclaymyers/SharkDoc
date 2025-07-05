export const LocalStorageKeys = {
  JWT: "JWT",
  Username: "username",
};

type LocalStorageUpdateCallback = (newValue: string | null) => void;

const subscribers = new Map<string, LocalStorageUpdateCallback[]>();
const emitChange = (key: string) => {
  console.log("emit change called for key:", key);
  subscribers.get(key)?.forEach((callback: LocalStorageUpdateCallback) => {
    console.log("Executing callback");
    callback(localStorage.getItem(key));
  });
};

export const LocalStorageService = {
  getJwt: (): string | null => {
    return localStorage.getItem(LocalStorageKeys.JWT);
  },
  setJwt: (token: string): void => {
    localStorage.setItem(LocalStorageKeys.JWT, token);
    emitChange(LocalStorageKeys.JWT);
  },
  clearJwt: (): void => {
    localStorage.removeItem(LocalStorageKeys.JWT);
    emitChange(LocalStorageKeys.JWT);
  },
  getUsername: (): string | null => {
    return localStorage.getItem(LocalStorageKeys.Username);
  },
  setUsername: (username: string): void => {
    localStorage.setItem(LocalStorageKeys.Username, username);
    emitChange(LocalStorageKeys.Username);
  },
  clearUsername: (): void => {
    localStorage.removeItem(LocalStorageKeys.Username);
    emitChange(LocalStorageKeys.Username);
  },
  subscribeToKeyChange: (key: string, callback: LocalStorageUpdateCallback) => {
    const callbacksForKey: LocalStorageUpdateCallback[] =
      subscribers.get(key) ?? [];
    callbacksForKey.push(callback);
    subscribers.set(key, callbacksForKey);
  },
  clearJwt: (): void => {
    localStorage.removeItem(LocalStorageKeys.JWT);
  },
};

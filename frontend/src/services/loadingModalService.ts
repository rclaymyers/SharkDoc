export type LoadingModalParams = {
  loadingMessage?: string;
  showModal: boolean;
};

type LoadingModalUpdateCallback = (
  LoadingModalParams: LoadingModalParams
) => void;

const subscribers: LoadingModalUpdateCallback[] = [];

export const LoadingModalService = {
  subscribeForever: (callback: LoadingModalUpdateCallback): void => {
    subscribers.push(callback);
  },

  updateLoadingModal: (loadingModalParams: LoadingModalParams): void => {
    for (const subscriber of subscribers) {
      subscriber(loadingModalParams);
    }
  },
};

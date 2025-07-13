export const UtilitiesService = {
  prependApiDomain: (originalString: string): string => {
    return `${import.meta.env.VITE_API_URL}${originalString}`;
  },
  buildDebouncedFn: (
    callback: (...args: any) => any,
    debounceTime: number
  ): ((...args: any) => any) => {
    let timeoutId: number | undefined;
    return (args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(args);
      }, debounceTime);
    };
  },
};

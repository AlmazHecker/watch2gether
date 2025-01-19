import { useState, useCallback } from "react";

const useAction = <TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => Promise<TReturn>
): [(...args: TArgs) => Promise<void>, boolean] => {
  const [isLoading, setIsLoading] = useState(false);

  const executeAction = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);

      await func(...args);

      setIsLoading(false);
    },
    [func]
  );

  return [executeAction, isLoading];
};

export default useAction;

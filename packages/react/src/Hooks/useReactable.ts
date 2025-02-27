import { Observable } from 'rxjs';
import { useEffect, useState, useRef } from 'react';
import { Reactable, Action } from '@reactables/core';

export type HookedReactable<T, S> = [T, S, Observable<T>, Observable<Action<unknown>>?];

export const useReactable = <T, S, U extends unknown[]>(
  reactableFactory: (...props: U) => Reactable<T, S>,
  ...props: U
): HookedReactable<T, S> => {
  const rx = useRef<Reactable<T, S>>(null);

  /**
   * React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
   * See Bug: https://github.com/facebook/react/issues/26315
   * See Bug: https://github.com/facebook/react/issues/24670
   * Using this recommended approach for resolving Strict Modeissue: https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
   */
  if (rx.current === null) {
    rx.current = reactableFactory(...props);
  }

  const [state$, actions, actions$] = rx.current;
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    return () => subscription.unsubscribe();
  }, [state$]);

  return [state, actions, state$, actions$];
};

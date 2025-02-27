## Communication between Reactables

The [reactable composition example](#reactable-composition) above is a case where one reactable reacts to the state changes of another.

Reactables can also emit their actions for other reactables to receive. The [reactable interface](/reactables/references/core-api/#reactable) has a third optional item which is an observable emitting the reactable's actions.

All reactable primitives created with [RxBuilder](/reactables/references/core-api/#rx-builder) provides the actions observable.

When composing reactables the developer can decide what actions to expose (if any) by merging any number of action observables together with [RxJS](https://rxjs.dev/).

Below is an example where a counter reactable, `RxCounter`, is extended to react to `toggle` actions emitted by `RxToggle`.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/communication/communication.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

<br>

```typescript
import { ofTypes, Action, Reactable, combine } from '@reactables/core';
import { Observable } from 'rxjs';

import { RxToggle, ToggleActions, ToggleState } from './RxToggle';
import { RxCounter, CounterState, CounterActions } from './RxCounter';

interface ToggleCounter {
  toggle: ToggleState;
  counter: CounterState;
}

interface ToggleCounterActions {
  toggle: ToggleActions;
  counter: CounterActions;
}

export const RxToggleCounter = (): Reactable<
  ToggleCounter,
  ToggleCounterActions
> => {
  const rxToggle = RxToggle();

  const toggled$ = (rxToggle[2] as Observable<Action<unknown>>).pipe(
    ofTypes(['toggle'])
  );

  const rxCounter = RxCounter({
    sources: [toggled$],
    reducers: {
      toggle: (state) => ({ count: state.count + 1 }),
    },
  });

  return combine({
    toggle: rxToggle,
    counter: rxCounter,
  });
};

```

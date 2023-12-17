import { Action } from '@reactables/core';
import { BaseForm, BaseFormState } from '../../Models/Controls';
import { ControlRef } from '../../Models/ControlRef';
import { getControl } from '../../Helpers/getControl';
import { getFormKey } from '../../Helpers/getFormKey';
import {
  updateAncestorValuesRemoveControl,
  UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL,
} from './updateAncestorValuesRemoveControl';
import { getDescendantControls } from '../../Helpers/getDescendantControls';

export const removeControl = <T>(
  { form }: BaseFormState<T>,
  action: Action<ControlRef>,
): BaseFormState<T> => {
  const { payload: controlRef } = action;

  if (!getControl(controlRef, form)) {
    throw 'Control not found';
  }

  // Can't remove the root of the form
  if (!controlRef.length) return { form, action };

  const parentRef = controlRef.slice(0, -1);

  const parentIsFormArray = Array.isArray(getControl(parentRef, form).config.controls);

  const descendantkeys = getDescendantControls(controlRef, form).map(({ controlRef }) =>
    getFormKey(controlRef),
  );

  const controlsRemoved = { ...form };

  descendantkeys.forEach((key) => {
    delete controlsRemoved[key];
  });

  // Remove control and all descendants
  const controlRemoved: BaseForm<T> = Object.entries(controlsRemoved).reduce(
    (acc, [key, control]) => {
      // May need to reindex array items of removed control
      // if it was part of a Form Array.
      if (parentIsFormArray) {
        const oldIndex = control.controlRef.at(parentRef.length) as number;

        if (
          // If control is descendant.
          parentRef.every((ref, index) => control.controlRef[index] === ref) &&
          control.controlRef.length > parentRef.length &&
          // If the array item index was greater than the index of item removed
          // we need to decrement its index by 1.
          oldIndex > (controlRef.at(-1) as number)
        ) {
          const newRef: ControlRef = parentRef
            .concat(oldIndex - 1)
            .concat(control.controlRef.slice(parentRef.length + 1));

          return {
            ...acc,
            [getFormKey(newRef)]: {
              ...control,
              controlRef: newRef,
            },
          };
        }
      }

      return { ...acc, [key]: control };
    },
    {},
  );

  return {
    form: updateAncestorValuesRemoveControl(controlRemoved, {
      type: UPDATE_ANCESTOR_VALUES_REMOVE_CONTROL,
      payload: controlRef,
    }),
    action,
  };
};

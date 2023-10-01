import React, { useContext } from 'react';
import {
  AbstractControlConfig,
  ControlRef,
  ControlModels,
  getControl,
  addFormArrayControl,
  removeControl,
} from '@hub-fx/forms';
import { FormContext } from './Form';

export interface FormArrayChildrenProps {
  formArray: ControlModels.FormArray<unknown>;
  addControl: (config: AbstractControlConfig) => void;
  removeControl: (controlRef: ControlRef) => void;
}

export interface FormArrayProps {
  controlRef: ControlRef;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ controlRef, children }: FormArrayProps) => {
  const { state, dispatch } = useContext(FormContext);
  const formArray = getControl(
    controlRef,
    state,
  ) as ControlModels.FormArray<unknown>;

  const formArrayChildrenProps: FormArrayChildrenProps = {
    formArray,
    addControl: (config: AbstractControlConfig) => {
      dispatch(addFormArrayControl({ controlRef, config }));
    },
    removeControl: (controlRef: ControlRef) => {
      dispatch(removeControl(controlRef));
    },
  };

  return <div>{children && children(formArrayChildrenProps)}</div>;
};

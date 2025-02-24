import React, { createContext, useReducer, useContext, Dispatch } from 'react';

export interface GlobalState {
  counter: number;
  // Add other global state properties here
}

export type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_COUNTER', payload: number };

const initialState: GlobalState = {
  counter: 0,
  // Initialize other global state properties here
};

function reducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, counter: state.counter + 1 };
    case 'DECREMENT':
      return { ...state, counter: state.counter - 1 };
    case 'SET_COUNTER':
      return { ...state, counter: action.payload };
    default:
      return state;
  }
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return React.createElement(
    GlobalStateContext.Provider,
    { value: state },
    React.createElement(
      DispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
};

export function useGlobalState(): GlobalState {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}

export function useGlobalDispatch(): Dispatch<Action> {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a GlobalStateProvider');
  }
  return context;
} 
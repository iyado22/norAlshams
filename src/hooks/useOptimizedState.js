import { useState, useCallback, useMemo, useRef } from 'react';

// Debounced state hook for performance optimization
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef();

  const setDebouncedStateValue = useCallback((newValue) => {
    setValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);
  }, [delay]);

  return [value, debouncedValue, setDebouncedStateValue];
};

// Optimized array state with memoization
export const useOptimizedArray = (initialArray = []) => {
  const [array, setArray] = useState(initialArray);
  
  const memoizedArray = useMemo(() => array, [array]);
  
  const addItem = useCallback((item) => {
    setArray(prev => [...prev, item]);
  }, []);
  
  const removeItem = useCallback((index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const updateItem = useCallback((index, newItem) => {
    setArray(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);
  
  const clearArray = useCallback(() => {
    setArray([]);
  }, []);

  return {
    array: memoizedArray,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    length: memoizedArray.length
  };
};

// Batch state updates for better performance
export const useBatchedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const batchedUpdates = useRef([]);
  const timeoutRef = useRef();

  const batchUpdate = useCallback((updates) => {
    batchedUpdates.current.push(updates);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = { ...prevState };
        batchedUpdates.current.forEach(update => {
          if (typeof update === 'function') {
            newState = update(newState);
          } else {
            newState = { ...newState, ...update };
          }
        });
        batchedUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  return [state, batchUpdate];
};
declare namespace JSX {
  interface IntrinsicElements {
    "math-field": {
      value?: string;
      onInput?: (event: Event) => void;
      style?: Record<string, string | number>;
    };
  }
}

import ErrorBox from "./ErrorBox";
import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, // props
  { hasError: boolean, error: unknown | null } // state
> {
  state = { hasError: false, error: null };


  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBox message={String(this.state.error)}/>
    }
    return this.props.children;
  }
}

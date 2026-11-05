import { Component, type ReactNode } from 'react';

/**
 * Last resort for a client render error: instead of unmounting to a blank page, put back the prerendered HTML the
 * visitor was already looking at (it is a complete page), and log once. In the normal state it renders only its
 * children, so it adds no DOM and does not change hydration.
 */
export class KeepPageBoundary extends Component<{ snapshot: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[atlas] render error, showing the static page', error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: this.props.snapshot }} />;
  }
}

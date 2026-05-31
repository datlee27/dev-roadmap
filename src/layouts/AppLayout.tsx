import { ReactNode } from 'react';

interface AppLayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  theme: 'light' | 'dark';
}

function AppLayout({ header, sidebar, children, footer, theme }: AppLayoutProps) {
  return (
    <div className="app-shell" data-theme={theme}>
      {header}
      <div className="app-layout">
        {sidebar}
        <main className="content">{children}</main>
      </div>
      {footer}
    </div>
  );
}

export default AppLayout;

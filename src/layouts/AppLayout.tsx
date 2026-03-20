import { ReactNode } from 'react';

interface AppLayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

function AppLayout({ header, sidebar, children, footer }: AppLayoutProps) {
  return (
    <div className="app-shell">
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

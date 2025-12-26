import { Outlet } from 'react-router-dom';
import { ShaderBackground } from '@/components/ShaderBackground';
import { FloatingDock } from './FloatingDock';

/**
 * MainLayout component for authenticated pages.
 * Provides the shader background and floating dock navigation.
 * Requirements: 9.4
 */
export function MainLayout() {
  return (
    <ShaderBackground>
      <div className="min-h-screen text-white relative z-10 pb-32">
        <main className="container max-w-2xl mx-auto pt-6 px-4">
          <Outlet />
        </main>
        <FloatingDock />
      </div>
    </ShaderBackground>
  );
}

export default MainLayout;

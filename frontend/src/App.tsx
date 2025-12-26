import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold instrument">Social Media App</h1>
        <p className="text-muted-foreground">
          React + Vite + Tailwind CSS v4 frontend
        </p>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}

export default App

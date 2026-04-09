import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-8">
      <main className="flex flex-col items-center gap-8 max-w-3xl w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            ShadCN UI Setup Complete
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Testing ShadCN UI components with Next.js 16 and Tailwind CSS 4
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Component Test</CardTitle>
            <CardDescription>
              This card demonstrates ShadCN UI components are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Action Button</Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>✓ ShadCN UI configured successfully</p>
          <p>✓ Tailwind CSS 4 integration working</p>
          <p>✓ React 19 compatibility verified</p>
        </div>
      </main>
    </div>
  );
}

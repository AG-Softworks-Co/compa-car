import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/perfil/')({
  component: () => <div>Hello /Perfil/!</div>,
})

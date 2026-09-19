import Button from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl">Page not found</h1>
      <p className="mt-2 text-ink-soft">The page you are looking for does not exist or has moved.</p>
      <Button to="/" className="mt-6">Back to home</Button>
    </div>
  );
}

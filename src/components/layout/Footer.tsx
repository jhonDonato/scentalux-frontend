export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex items-center justify-center py-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Scenta Lux. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

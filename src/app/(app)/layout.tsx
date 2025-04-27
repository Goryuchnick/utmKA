export default function AppPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout can be used for common elements within the /generator and /history routes
  // For now, it just passes children through.
  return <>{children}</>;
}

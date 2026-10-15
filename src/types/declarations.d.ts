// Metro/drizzle — SQL files are bundled as string assets
declare module '*.sql' {
  const content: string;
  export default content;
}

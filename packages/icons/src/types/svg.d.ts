declare module "*.svg" {
  type SvgComponent = (props: Record<string, unknown>) => any;
  const src: number & SvgComponent;
  export default src;
}

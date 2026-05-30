import { glob, type Loader } from "astro/loaders";

export const globLoader = (
  options: Parameters<typeof glob>[0],
  loader: Loader["load"],
): Loader => {
  const base = glob(options);
  const baseLoad = base.load;

  return {
    name: "glob-loader",
    load: async (context) => {
      await baseLoad(context);
      await loader(context);
    },
  };
};

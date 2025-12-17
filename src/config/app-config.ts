import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Захиалгын систем",
  version: packageJson.version,
};

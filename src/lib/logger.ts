import { createConsola } from "consola";

const logger = createConsola({
  formatOptions: {
    colors: true,
    columns: 80,
    compact: 10,
    date: true,
  },
});

export default logger;

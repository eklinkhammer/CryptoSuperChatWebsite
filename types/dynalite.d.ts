declare module "dynalite" {
  interface DynaliteOptions {
    createTableMs?: number;
    updateTableMs?: number;
    deleteTableMs?: number;
    maxItemSizeKb?: number;
  }

  interface DynaliteServer {
    listen(port: number, callback?: () => void): void;
    close(callback?: () => void): void;
  }

  function dynalite(options?: DynaliteOptions): DynaliteServer;

  export = dynalite;
}


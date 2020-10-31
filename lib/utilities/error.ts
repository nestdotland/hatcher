export class HatcherError extends Error {
  name = "Hatcher Error";
  constructor(public message: string) {
    super(message);
  }
}

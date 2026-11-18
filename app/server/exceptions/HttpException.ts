export function toErrorMessage(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    const serialised = JSON.stringify(value);
    if (typeof serialised === 'string') {
      return serialised;
    }
  } catch {
    // fall through to String() for circular or otherwise unserialisable values
  }
  return String(value);
}

class HttpException extends Error {
  status: number;
  message: string;
  constructor(status: number, message: unknown) {
    const stringMessage = toErrorMessage(message);
    super(stringMessage);
    this.status = status;
    this.message = stringMessage;
  }
}

export default HttpException;

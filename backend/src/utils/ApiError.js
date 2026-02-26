class ApiError extends Error {
  // new ApiError(statusCode: number, message: string) => Error
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ApiError;

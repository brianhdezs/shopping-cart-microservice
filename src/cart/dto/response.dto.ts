export class ResponseDto<T = any> {
  result?: T;
  isSuccess: boolean = true;
  message: string = '';

  constructor(result?: T, isSuccess: boolean = true, message: string = '') {
    this.result = result;
    this.isSuccess = isSuccess;
    this.message = message;
  }

  static success<T>(result?: T, message: string = ''): ResponseDto<T> {
    return new ResponseDto(result, true, message);
  }

  static error(message: string): ResponseDto {
    return new ResponseDto(null, false, message);
  }
}
/* eslint-disable max-classes-per-file */
import { CustomError, Status } from '@block65/custom-error';

export class ValidationError extends CustomError {
  public override code = Status.INVALID_ARGUMENT;
}

export class TokenValidationError extends ValidationError {}

export class TokenExpiredError extends TokenValidationError {
  public override code = Status.OUT_OF_RANGE;
}

export class KeyNotFoundError extends CustomError {
  public override code = Status.NOT_FOUND;
}

export class JwksFetchError extends CustomError {
  public override code = Status.UNKNOWN;
}

import type { Matrix2 } from "./matrix";

import {
  identityMatrix,
  multiplyMatrix,
} from "./matrix";

import {
  makePhasePulse,
  makePhasePulseWithErrors,
} from "./gate";

export type PulseOperation = {
  theta: number;
  phi: number;
};

export function circuitToMatrix(
  circuit: PulseOperation[]
): Matrix2 {
  let total = identityMatrix();

  for (const operation of circuit) {
    const pulseMatrix =
      makePhasePulse(
        operation.theta,
        operation.phi
      );

    total = multiplyMatrix(
      pulseMatrix,
      total
    );
  }

  return total;
}

export function circuitToMatrixWithErrors(
  circuit: PulseOperation[],
  epsilon: number,
  f: number
): Matrix2 {
  let total = identityMatrix();

  for (const operation of circuit) {
    const pulseMatrix =
      makePhasePulseWithErrors(
        operation.theta,
        operation.phi,
        epsilon,
        f
      );

    total = multiplyMatrix(
      pulseMatrix,
      total
    );
  }

  return total;
}
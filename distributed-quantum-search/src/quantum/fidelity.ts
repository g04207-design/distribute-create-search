import type { Complex, Matrix2 } from "./matrix";
import { multiplyMatrix } from "./matrix";
import type { PulseOperation } from "./circuit";
import { circuitToMatrixWithErrors } from "./circuit";
import { makeNotGate } from "./gate";

// 複素共役
function conjugate(z: Complex): Complex {
  return {
    re: z.re,
    im: -z.im,
  };
}

// エルミート共役 U†
function daggerMatrix(matrix: Matrix2): Matrix2 {
  return [
    [
      conjugate(matrix[0][0]),
      conjugate(matrix[1][0]),
    ],
    [
      conjugate(matrix[0][1]),
      conjugate(matrix[1][1]),
    ],
  ];
}

// 行列のトレース
function traceMatrix(matrix: Matrix2): Complex {
  return {
    re: matrix[0][0].re + matrix[1][1].re,
    im: matrix[0][0].im + matrix[1][1].im,
  };
}

// 2つの1量子ビットユニタリのAverage Gate Fidelity
export function gateFidelity(
  actual: Matrix2,
  target: Matrix2
): number {
  const actualDagger = daggerMatrix(actual);

  const product = multiplyMatrix(
    actualDagger,
    target
  );

  const trace = traceMatrix(product);

  const traceAbsSquared =
    trace.re * trace.re +
    trace.im * trace.im;

  const d = 2;

  return (
    (traceAbsSquared + d) /
    (d * (d + 1))
  );
}

export function averageFidelityWithErrors(
  circuit: PulseOperation[]
): number {
  const target = makeNotGate();

  const errorValues = [
    -0.1,
    -0.05,
    0,
    0.05,
    0.1,
  ];

  let totalFidelity = 0;
  let count = 0;

  for (const epsilon of errorValues) {
    for (const f of errorValues) {
      const actual =
        circuitToMatrixWithErrors(
          circuit,
          epsilon,
          f
        );

      const fidelity =
        gateFidelity(
          actual,
          target
        );

      totalFidelity += fidelity;
      count++;
    }
  }

  return totalFidelity / count;
}
import type {
  Matrix2,
} from "./matrix";

import {
  multiplyMatrix,
} from "./matrix";

// x軸まわりの回転 Rx(θ)
export function makeRx(theta: number): Matrix2 {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);

  return [
    [
      { re: c, im: 0 },
      { re: 0, im: -s },
    ],
    [
      { re: 0, im: -s },
      { re: c, im: 0 },
    ],
  ];
}

// y軸まわりの回転 Ry(θ)
export function makeRy(theta: number): Matrix2 {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);

  return [
    [
      { re: c, im: 0 },
      { re: -s, im: 0 },
    ],
    [
      { re: s, im: 0 },
      { re: c, im: 0 },
    ],
  ];
}

// z軸まわりの回転 Rz(θ)
export function makeRz(theta: number): Matrix2 {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);

  return [
    [
      { re: c, im: -s },
      { re: 0, im: 0 },
    ],
    [
      { re: 0, im: 0 },
      { re: c, im: s },
    ],
  ];
}

// 目標となるNOTゲート
export function makeNotGate(): Matrix2 {
  return [
    [
      { re: 0, im: 0 },
      { re: 1, im: 0 },
    ],
    [
      { re: 1, im: 0 },
      { re: 0, im: 0 },
    ],
  ];
}

// x軸方向の制御に ε と f の誤差を加えた回転
export function makeRxWithErrors(
  theta: number,
  epsilon: number,
  f: number
): Matrix2 {
  const x = 1 + epsilon;
  const z = f;

  const length = Math.sqrt(x * x + z * z);

  const nx = x / length;
  const nz = z / length;

  const effectiveAngle = theta * length;

  const c = Math.cos(effectiveAngle / 2);
  const s = Math.sin(effectiveAngle / 2);

  return [
    [
      { re: c, im: -s * nz },
      { re: 0, im: -s * nx },
    ],
    [
      { re: 0, im: -s * nx },
      { re: c, im: s * nz },
    ],
  ];
}


// y軸方向の制御に ε と f の誤差を加えた回転
export function makeRyWithErrors(
  theta: number,
  epsilon: number,
  f: number
): Matrix2 {
  const y = 1 + epsilon;
  const z = f;

  const length = Math.sqrt(y * y + z * z);

  const ny = y / length;
  const nz = z / length;

  const effectiveAngle = theta * length;

  const c = Math.cos(effectiveAngle / 2);
  const s = Math.sin(effectiveAngle / 2);

  return [
    [
      { re: c, im: -s * nz },
      { re: -s * ny, im: 0 },
    ],
    [
      { re: s * ny, im: 0 },
      { re: c, im: s * nz },
    ],
  ];
}

export function makePhasePulse(
  theta: number,
  phi: number
): Matrix2 {
  const rzMinus =
    makeRz(-phi);

  const rx =
    makeRx(theta);

  const rzPlus =
    makeRz(phi);

  return multiplyMatrix(
    rzPlus,
    multiplyMatrix(
      rx,
      rzMinus
    )
  );
}

export function makePhasePulseWithErrors(
  theta: number,
  phi: number,
  epsilon: number,
  f: number
): Matrix2 {
  const x =
    (1 + epsilon) * Math.cos(phi);

  const y =
    (1 + epsilon) * Math.sin(phi);

  const z = f;

  const length = Math.sqrt(
    x * x +
    y * y +
    z * z
  );

  const nx = x / length;
  const ny = y / length;
  const nz = z / length;

  const effectiveAngle =
    theta * length;

  const c =
    Math.cos(effectiveAngle / 2);

  const s =
    Math.sin(effectiveAngle / 2);

  return [
    [
      {
        re: c,
        im: -s * nz,
      },
      {
        re: -s * ny,
        im: -s * nx,
      },
    ],
    [
      {
        re: s * ny,
        im: -s * nx,
      },
      {
        re: c,
        im: s * nz,
      },
    ],
  ];
}
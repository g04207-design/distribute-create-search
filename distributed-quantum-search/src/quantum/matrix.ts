// 複素数
export type Complex = {
  re: number;
  im: number;
};

// 2×2複素行列
export type Matrix2 = [
  [Complex, Complex],
  [Complex, Complex]
];

// 複素数の掛け算
export function multiplyComplex(
  a: Complex,
  b: Complex
): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

// 複素数の足し算
export function addComplex(
  a: Complex,
  b: Complex
): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

// 2×2行列の掛け算
export function multiplyMatrix(
  a: Matrix2,
  b: Matrix2
): Matrix2 {
  return [
    [
      addComplex(
        multiplyComplex(a[0][0], b[0][0]),
        multiplyComplex(a[0][1], b[1][0])
      ),
      addComplex(
        multiplyComplex(a[0][0], b[0][1]),
        multiplyComplex(a[0][1], b[1][1])
      ),
    ],
    [
      addComplex(
        multiplyComplex(a[1][0], b[0][0]),
        multiplyComplex(a[1][1], b[1][0])
      ),
      addComplex(
        multiplyComplex(a[1][0], b[0][1]),
        multiplyComplex(a[1][1], b[1][1])
      ),
    ],
  ];
}

// 単位行列 I
export function identityMatrix(): Matrix2 {
  return [
    [
      { re: 1, im: 0 },
      { re: 0, im: 0 },
    ],
    [
      { re: 0, im: 0 },
      { re: 1, im: 0 },
    ],
  ];
}